import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamDto, SalvarTeamDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private apiUrl = `${environment.apiUrl}/api/Teams`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<TeamDto[]> {
        return this.http.get<TeamDto[]>(this.apiUrl);
    }

    getById(id: string): Observable<TeamDto> {
        return this.http.get<TeamDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarTeamDto): Observable<TeamDto> {
        return this.http.post<TeamDto>(this.apiUrl, dto);
    }

    update(id: string, dto: SalvarTeamDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByOrg(orgId: number): Observable<TeamDto[]> {
        return this.http.get<TeamDto[]>(`${this.apiUrl}/por-organizacao/${orgId}`);
    }

    getByName(name: string): Observable<TeamDto> {
        return this.http.get<TeamDto>(`${this.apiUrl}/por-nome/${name}`);
    }
}
