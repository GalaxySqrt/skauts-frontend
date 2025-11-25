import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto, SalvarUserDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/api/Users`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarUserDto): Observable<UserDto> {
        return this.http.post<UserDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarUserDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByEmail(email: string): Observable<UserDto> {
        const params = new HttpParams().set('email', email);
        return this.http.get<UserDto>(`${this.apiUrl}/por-email`, { params });
    }

    existsByEmail(email: string): Observable<boolean> {
        const params = new HttpParams().set('email', email);
        return this.http.get<boolean>(`${this.apiUrl}/existe-por-email`, { params });
    }
}
