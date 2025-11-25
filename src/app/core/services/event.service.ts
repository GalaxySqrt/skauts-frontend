import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventDto, SalvarEventDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}/api/Events`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<EventDto[]> {
        return this.http.get<EventDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<EventDto> {
        return this.http.get<EventDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarEventDto): Observable<EventDto> {
        return this.http.post<EventDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarEventDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByMatch(matchId: number): Observable<EventDto[]> {
        return this.http.get<EventDto[]>(`${this.apiUrl}/por-partida/${matchId}`);
    }

    getByPlayer(playerId: number): Observable<EventDto[]> {
        return this.http.get<EventDto[]>(`${this.apiUrl}/por-jogador/${playerId}`);
    }
}
