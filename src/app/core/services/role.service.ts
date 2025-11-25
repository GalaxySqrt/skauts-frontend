import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleDto, SalvarRoleDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = `${environment.apiUrl}/api/Roles`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<RoleDto[]> {
        return this.http.get<RoleDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<RoleDto> {
        return this.http.get<RoleDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarRoleDto): Observable<RoleDto> {
        return this.http.post<RoleDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarRoleDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByName(name: string): Observable<RoleDto> {
        return this.http.get<RoleDto>(`${this.apiUrl}/por-nome/${name}`);
    }

    getByAcronym(acronym: string): Observable<RoleDto> {
        return this.http.get<RoleDto>(`${this.apiUrl}/por-acronimo/${acronym}`);
    }
}
