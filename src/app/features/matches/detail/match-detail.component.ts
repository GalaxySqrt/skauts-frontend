import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatchService } from '../../../core/services/match.service';
import { EventService } from '../../../core/services/event.service';
import { MatchDto, EventDto } from '../../../core/models/api-models';

@Component({
    selector: 'app-match-detail',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTabsModule, MatListModule],
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.scss']
})
export class MatchDetailComponent implements OnInit {
    match: MatchDto | null = null;
    events: EventDto[] = [];

    constructor(
        private route: ActivatedRoute,
        private matchService: MatchService,
        private eventService: EventService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadMatch(+id);
            this.loadEvents(+id);
        }
    }

    loadMatch(id: number) {
        this.matchService.getById(id).subscribe({
            next: (data) => this.match = data,
            error: (err) => console.error('Failed to load match', err)
        });
    }

    loadEvents(matchId: number) {
        this.eventService.getByMatch(matchId).subscribe({
            next: (data) => this.events = data,
            error: (err) => console.error('Failed to load events', err)
        });
    }
}
