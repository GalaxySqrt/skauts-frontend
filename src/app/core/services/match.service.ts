import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatchDto, SalvarMatchDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private apiUrl = `${environment.apiUrl}/api/Matches`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<MatchDto[]> {
        return this.http.get<MatchDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<MatchDto> {
        return this.http.get<MatchDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarMatchDto): Observable<MatchDto> {
        return this.http.post<MatchDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarMatchDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByOrg(orgId: number): Observable<MatchDto[]> {
        return this.http.get<MatchDto[]>(`${this.apiUrl}/por-organizacao/${orgId}`);
    }

    getByChampionship(championshipId: number): Observable<MatchDto[]> {
        return this.http.get<MatchDto[]>(`${this.apiUrl}/por-campeonato/${championshipId}`);
    }

    getByDate(date: string): Observable<MatchDto[]> {
        const params = new HttpParams().set('date', date);
        return this.http.get<MatchDto[]>(`${this.apiUrl}/por-data`, { params });
    }
}
