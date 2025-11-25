import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamPlayerDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class TeamPlayerService {
    private apiUrl = `${environment.apiUrl}/api/TeamPlayers`;

    constructor(private http: HttpClient) { }

    add(dto: TeamPlayerDto): Observable<TeamPlayerDto> {
        return this.http.post<TeamPlayerDto>(this.apiUrl, dto);
    }

    remove(teamId: string, playerId: number): Observable<void> {
        const params = new HttpParams()
            .set('teamId', teamId)
            .set('playerId', playerId.toString());
        return this.http.delete<void>(this.apiUrl, { params });
    }

    getByTeam(teamId: string): Observable<TeamPlayerDto[]> {
        return this.http.get<TeamPlayerDto[]>(`${this.apiUrl}/por-time/${teamId}`);
    }

    getByPlayer(playerId: number): Observable<TeamPlayerDto[]> {
        return this.http.get<TeamPlayerDto[]>(`${this.apiUrl}/por-jogador/${playerId}`);
    }

    getRelation(teamId: string, playerId: number): Observable<TeamPlayerDto> {
        const params = new HttpParams()
            .set('teamId', teamId)
            .set('playerId', playerId.toString());
        return this.http.get<TeamPlayerDto>(`${this.apiUrl}/relacao`, { params });
    }
}
