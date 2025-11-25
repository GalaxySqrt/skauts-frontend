import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlayersPrizeDto, SalvarPlayersPrizeDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class PlayersPrizeService {
    private apiUrl = `${environment.apiUrl}/api/PlayersPrizes`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<PlayersPrizeDto[]> {
        return this.http.get<PlayersPrizeDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<PlayersPrizeDto> {
        return this.http.get<PlayersPrizeDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarPlayersPrizeDto): Observable<PlayersPrizeDto> {
        return this.http.post<PlayersPrizeDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarPlayersPrizeDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByPlayer(playerId: number): Observable<PlayersPrizeDto[]> {
        return this.http.get<PlayersPrizeDto[]>(`${this.apiUrl}/por-jogador/${playerId}`);
    }

    getByPrizeType(prizeTypeId: number): Observable<PlayersPrizeDto[]> {
        return this.http.get<PlayersPrizeDto[]>(`${this.apiUrl}/por-tipo-premio/${prizeTypeId}`);
    }
}
