import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsersOrganizationDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class UsersOrganizationService {
    private apiUrl = `${environment.apiUrl}/api/UsersOrganizations`;

    constructor(private http: HttpClient) { }

    add(dto: UsersOrganizationDto): Observable<UsersOrganizationDto> {
        return this.http.post<UsersOrganizationDto>(this.apiUrl, dto);
    }

    remove(userId: number, orgId: number): Observable<void> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('orgId', orgId.toString());
        return this.http.delete<void>(this.apiUrl, { params });
    }

    getByOrg(orgId: number): Observable<UsersOrganizationDto[]> {
        return this.http.get<UsersOrganizationDto[]>(`${this.apiUrl}/por-organizacao/${orgId}`);
    }

    getByUser(userId: number): Observable<UsersOrganizationDto[]> {
        return this.http.get<UsersOrganizationDto[]>(`${this.apiUrl}/por-usuario/${userId}`);
    }

    getRelation(userId: number, orgId: number): Observable<UsersOrganizationDto> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('orgId', orgId.toString());
        return this.http.get<UsersOrganizationDto>(`${this.apiUrl}/relacao`, { params });
    }
}
