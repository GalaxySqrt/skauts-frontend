import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrizeTypeDto, SalvarPrizeTypeDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class PrizeTypeService {
    private apiUrl = `${environment.apiUrl}/api/PrizeTypes`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<PrizeTypeDto[]> {
        return this.http.get<PrizeTypeDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<PrizeTypeDto> {
        return this.http.get<PrizeTypeDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarPrizeTypeDto): Observable<PrizeTypeDto> {
        return this.http.post<PrizeTypeDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarPrizeTypeDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getByName(name: string): Observable<PrizeTypeDto> {
        return this.http.get<PrizeTypeDto>(`${this.apiUrl}/por-nome/${name}`);
    }
}
