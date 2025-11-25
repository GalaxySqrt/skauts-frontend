import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequestDto, UserDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/api/Auth`;
    private tokenKey = 'skauts_token';
    private userKey = 'skauts_user'; // For user object if needed
    private userIdKey = 'skauts_user_id'; // For user ID

    private currentUserSubject: BehaviorSubject<UserDto | null>;
    public currentUser$: Observable<UserDto | null>;

    constructor(private http: HttpClient, private router: Router) {
        // Try to recover user state from cookies or just initialize as null/empty
        // Since we don't store the full user object in cookies usually (too big), 
        // we might just rely on the token presence or fetch user on load.
        // For now, let's keep the behavior similar but read from cookie if we were storing it there,
        // or just initialize based on token presence.
        // The previous implementation stored the whole user object in localStorage.
        // Storing large objects in cookies is not recommended.
        // Let's assume we just check if we have a token.

        this.currentUserSubject = new BehaviorSubject<UserDto | null>(null);
        this.currentUser$ = this.currentUserSubject.asObservable();

        if (this.isAuthenticated()) {
            // Optionally fetch user details here if we want to restore the user object state
        }
    }

    login(credentials: LoginRequestDto): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    this.setSession(response);
                }
            })
        );
    }

    private setSession(authResult: any) {
        // Save token to cookie
        // Expires in 1 day by default or parse from token if possible
        const token = authResult.token || authResult;
        if (typeof token === 'string') {
            this.setCookie(this.tokenKey, token, 1);
        }

        // We can also store the email if returned
        if (authResult.email) {
            this.currentUserSubject.next({ email: authResult.email } as UserDto);
        } else {
            this.currentUserSubject.next({ email: 'user@example.com' } as UserDto);
        }
    }

    // Helper to store User ID in cookie (called from Login Component or here)
    setUserId(id: string) {
        this.setCookie(this.userIdKey, id, 1);
    }

    getUserId(): string | null {
        return this.getCookie(this.userIdKey);
    }

    // Helper for Org ID
    setOrgId(id: string) {
        this.setCookie('skauts_org_id', id, 1);
    }

    getOrgId(): string | null {
        return this.getCookie('skauts_org_id');
    }

    logout() {
        this.deleteCookie(this.tokenKey);
        this.deleteCookie(this.userIdKey);
        this.deleteCookie('skauts_org_id');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }
    getToken(): string | null {
        return this.getCookie(this.tokenKey);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!token;
    }

    // Cookie Helpers
    setCookie(name: string, value: string, days: number) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict; Secure";
    }

    getCookie(name: string): string | null {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name: string) {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
    }
}
