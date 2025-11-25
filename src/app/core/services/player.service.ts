import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlayerDto, SalvarPlayerDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private apiUrl = `${environment.apiUrl}/api/Players`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<PlayerDto[]> {
        return this.http.get<PlayerDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<PlayerDto> {
        return this.http.get<PlayerDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarPlayerDto): Observable<PlayerDto> {
        return this.http.post<PlayerDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarPlayerDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByOrg(orgId: number): Observable<PlayerDto[]> {
        return this.http.get<PlayerDto[]>(`${this.apiUrl}/por-organizacao/${orgId}`);
    }

    getByEmail(email: string): Observable<PlayerDto> {
        const params = new HttpParams().set('email', email);
        return this.http.get<PlayerDto>(`${this.apiUrl}/por-email`, { params });
    }

    existsByEmail(email: string): Observable<boolean> {
        const params = new HttpParams().set('email', email);
        return this.http.get<boolean>(`${this.apiUrl}/existe-por-email`, { params });
    }
}
