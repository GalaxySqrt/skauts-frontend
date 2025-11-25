import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChampionshipDto, SalvarChampionshipDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class ChampionshipService {
    private apiUrl = `${environment.apiUrl}/api/Championships`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<ChampionshipDto[]> {
        return this.http.get<ChampionshipDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<ChampionshipDto> {
        return this.http.get<ChampionshipDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarChampionshipDto): Observable<ChampionshipDto> {
        return this.http.post<ChampionshipDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarChampionshipDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByOrg(orgId: number): Observable<ChampionshipDto[]> {
        return this.http.get<ChampionshipDto[]>(`${this.apiUrl}/por-organizacao/${orgId}`);
    }
}
