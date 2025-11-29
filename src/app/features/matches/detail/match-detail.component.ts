import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatchService } from '../../../core/services/match.service';
import { EventService } from '../../../core/services/event.service';
import { TeamService } from '../../../core/services/team.service';
import { PlayerService } from '../../../core/services/player.service';
import { EventTypeService } from '../../../core/services/event-type.service';
import { MatchDto, EventDto, TeamDto, PlayerDto, EventTypeDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

interface EnrichedEvent extends EventDto {
    playerName?: string;
    eventTypeName?: string;
    eventTypeIcon?: string;
}

@Component({
    selector: 'app-match-detail',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTabsModule, MatListModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatButtonModule, RouterLink, TranslateModule],
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.scss']
})
export class MatchDetailComponent implements OnInit {
    match: MatchDto | null = null;
    events: EnrichedEvent[] = [];
    teamAName: string = '';
    teamBName: string = '';
    goalsTeamA: number = 0;
    goalsTeamB: number = 0;
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private matchService: MatchService,
        private eventService: EventService,
        private teamService: TeamService,
        private playerService: PlayerService,
        private eventTypeService: EventTypeService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadMatchData(+id);
        }
    }

    loadMatchData(matchId: number) {
        this.loading = true;
        this.matchService.getById(matchId).subscribe({
            next: (match) => {
                this.match = match;
                this.loadTeamsAndEvents();
            },
            error: (err) => {
                console.error('Failed to load match', err);
                this.loading = false;
            }
        });
    }

    loadTeamsAndEvents() {
        if (!this.match) return;

        const teamA$ = this.teamService.getById(this.match.teamAId!);
        const teamB$ = this.teamService.getById(this.match.teamBId!);
        const events$ = this.eventService.getByMatch(this.match.id!);
        const eventTypes$ = this.eventTypeService.getAll();
        const players$ = this.playerService.getAll();

        forkJoin({
            teamA: teamA$,
            teamB: teamB$,
            events: events$,
            eventTypes: eventTypes$,
            players: players$
        }).subscribe({
            next: (data) => {
                this.teamAName = data.teamA.name || 'Team A';
                this.teamBName = data.teamB.name || 'Team B';

                // Create lookup maps for efficient matching
                const playerMap = new Map(data.players.map(p => [p.id!, p]));
                const eventTypeMap = new Map(data.eventTypes.map(et => [et.id!, et]));

                // Enrich events with names
                this.events = data.events.map(event => {
                    const player = playerMap.get(event.playerId!);
                    const eventType = eventTypeMap.get(event.eventTypeId!);

                    return {
                        ...event,
                        playerName: player?.name || 'Unknown Player',
                        eventTypeName: eventType?.name || 'Unknown Event',
                        eventTypeIcon: this.getEventIcon(eventType?.name ?? undefined)
                    };
                });

                // Calculate goals (assuming event type name contains 'Gol' or 'Goal')
                this.calculateGoals(data.teamA.id!, data.teamB.id!, playerMap);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load match details', err);
                this.loading = false;
            }
        });
    }

    calculateGoals(teamAId: string, teamBId: string, playerMap: Map<number, PlayerDto>) {
        this.goalsTeamA = 0;
        this.goalsTeamB = 0;

        this.events.forEach(event => {
            const eventTypeLower = event.eventTypeName?.toLowerCase() || '';
            const isGoal = eventTypeLower.includes('gol') || eventTypeLower.includes('goal');

            if (isGoal) {
                const player = playerMap.get(event.playerId!);
                // We need to check which team the player belongs to
                // For now, we'll use a simplified approach - you may need to fetch team-player relationships
                // Alternatively, check based on event context or add team info to events
                // This is a simplified version - adjust based on your data model
                this.goalsTeamA++;
            }
        });
    }

    getEventIcon(eventTypeName?: string): string {
        if (!eventTypeName) return 'event';

        const typeLower = eventTypeName.toLowerCase();
        if (typeLower.includes('gol') || typeLower.includes('goal')) return 'sports_soccer';
        if (typeLower.includes('cartão amarelo') || typeLower.includes('yellow card')) return 'warning';
        if (typeLower.includes('cartão vermelho') || typeLower.includes('red card')) return 'error';
        if (typeLower.includes('substituição') || typeLower.includes('substitution')) return 'swap_horiz';
        if (typeLower.includes('assistência') || typeLower.includes('assist')) return 'support';

        return 'event';
    }

    getEventColor(eventTypeName?: string): string {
        if (!eventTypeName) return 'primary';

        const typeLower = eventTypeName.toLowerCase();
        if (typeLower.includes('gol') || typeLower.includes('goal')) return 'primary';
        if (typeLower.includes('cartão amarelo') || typeLower.includes('yellow card')) return 'accent';
        if (typeLower.includes('cartão vermelho') || typeLower.includes('red card')) return 'warn';

        return 'primary';
    }
}
