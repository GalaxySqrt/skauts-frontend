import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationDto, SalvarOrganizationDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    private apiUrl = `${environment.apiUrl}/api/Organizations`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<OrganizationDto[]> {
        return this.http.get<OrganizationDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<OrganizationDto> {
        return this.http.get<OrganizationDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarOrganizationDto): Observable<OrganizationDto> {
        return this.http.post<OrganizationDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarOrganizationDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
