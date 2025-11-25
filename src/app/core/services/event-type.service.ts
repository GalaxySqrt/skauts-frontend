import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventTypeDto, SalvarEventTypeDto } from '../models/api-models';

@Injectable({
    providedIn: 'root'
})
export class EventTypeService {
    private apiUrl = `${environment.apiUrl}/api/EventTypes`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<EventTypeDto[]> {
        return this.http.get<EventTypeDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<EventTypeDto> {
        return this.http.get<EventTypeDto>(`${this.apiUrl}/${id}`);
    }

    create(dto: SalvarEventTypeDto): Observable<EventTypeDto> {
        return this.http.post<EventTypeDto>(this.apiUrl, dto);
    }

    update(id: number, dto: SalvarEventTypeDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
