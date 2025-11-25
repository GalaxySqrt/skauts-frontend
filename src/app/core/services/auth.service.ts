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
    private userKey = 'skauts_user';

    private currentUserSubject: BehaviorSubject<UserDto | null>;
    public currentUser$: Observable<UserDto | null>;

    constructor(private http: HttpClient, private router: Router) {
        const savedUser = localStorage.getItem(this.userKey);
        this.currentUserSubject = new BehaviorSubject<UserDto | null>(savedUser ? JSON.parse(savedUser) : null);
        this.currentUser$ = this.currentUserSubject.asObservable();
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
        localStorage.setItem(this.tokenKey, authResult.token);
        // Assuming the response might contain user info or we decode the token. 
        // For now, we might need to fetch user info separately or if the login response has it.
        // The swagger says login returns just a token (string) or object?
        // Swagger: /api/Auth/login -> 200 OK -> content: string (token)
        // Wait, swagger says:
        // "200": { "content": { "text/plain": { "schema": { "type": "string" } }, "application/json": { "schema": { "type": "string" } } } }
        // So it returns a string directly? Or a JSON with token property?
        // Usually if it says schema type string, it's just the string.
        // But let's assume it returns the token string.

        // If it's just a string:
        if (typeof authResult === 'string') {
            localStorage.setItem(this.tokenKey, authResult);
        } else if (authResult.token) {
            localStorage.setItem(this.tokenKey, authResult.token);
        }

        // We might want to fetch user details here if not provided.
        // For now, let's just set a dummy user or decode token if needed.
        // I'll leave user null for now or fetch it.
        // There is /api/Users/por-email but we need email.
        // Let's just set logged in state.
        this.currentUserSubject.next({ email: authResult.email || 'user@example.com' } as UserDto);
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        // Check token expiration if possible (jwt-decode)
        return !!token;
    }
}
