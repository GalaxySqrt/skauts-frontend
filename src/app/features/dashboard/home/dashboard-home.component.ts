import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../core/services/auth.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { MatchService } from '../../../core/services/match.service';
import { ChampionshipService } from '../../../core/services/championship.service';
import { PlayerService } from '../../../core/services/player.service';
import { EventService } from '../../../core/services/event.service';
import { EventTypeService } from '../../../core/services/event-type.service';
import { OrganizationDto, MatchDto, ChampionshipDto, PlayerDto, EventDto, EventTypeDto } from '../../../core/models/api-models';
import { forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

interface PlayerRanking {
  player: PlayerDto;
  goals: number;
  assists?: number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TranslateModule
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  organization: OrganizationDto | null = null;
  totalMatches: number = 0;
  totalChampionships: number = 0;
  totalPlayers: number = 0;
  totalGoals: number = 0;
  topScorers: PlayerRanking[] = [];
  topAssisters: PlayerRanking[] = [];
  loading: boolean = true;
  loadingRanking: boolean = true;

  displayedColumns: string[] = ['rank', 'name', 'count'];

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private matchService: MatchService,
    private championshipService: ChampionshipService,
    private playerService: PlayerService,
    private eventService: EventService,
    private eventTypeService: EventTypeService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    const orgIdStr = this.authService.getOrgId();

    if (!orgIdStr) {
      this.loading = false;
      return;
    }

    const orgId = parseInt(orgIdStr, 10);

    // 1. Fetch Basic Stats
    const org$ = this.organizationService.getById(orgId);
    const matches$ = this.matchService.getByOrg(orgId);
    const championships$ = this.championshipService.getByOrg(orgId);
    const players$ = this.playerService.getByOrg(orgId);

    forkJoin({
      org: org$,
      matches: matches$,
      championships: championships$,
      players: players$
    }).subscribe({
      next: (data) => {
        this.organization = data.org;
        this.totalMatches = data.matches.length;
        this.totalChampionships = data.championships.length;
        this.totalPlayers = data.players.length;
        this.loading = false;

        // 2. Calculate Rankings (Dependent on Players)
        this.calculateRankings(data.players);
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading = false;
        this.loadingRanking = false;
      }
    });
  }

  calculateRankings(players: PlayerDto[]): void {
    this.loadingRanking = true;

    // Find "Goal" and "Assist" event types
    this.eventTypeService.getAll().pipe(
      switchMap(eventTypes => {
        const goalType = eventTypes.find(et => et.name?.toLowerCase() === 'gol' || et.name?.toLowerCase() === 'goal');
        const assistType = eventTypes.find(et => et.name?.toLowerCase().includes('assist') || et.name?.toLowerCase().includes('passe'));

        const goalTypeId = goalType?.id;
        const assistTypeId = assistType?.id;

        if (!goalTypeId) console.warn('Goal event type not found');
        if (!assistTypeId) console.warn('Assist event type not found');

        // Create an array of observables to fetch events for each player
        const playerEventRequests = players.map(player =>
          this.eventService.getByPlayer(player.id!).pipe(
            map(events => {
              const goalCount = goalTypeId ? events.filter(e => e.eventTypeId === goalTypeId).length : 0;
              const assistCount = assistTypeId ? events.filter(e => e.eventTypeId === assistTypeId).length : 0;

              return {
                player,
                goals: goalCount,
                assists: assistCount
              };
            }),
            catchError(() => of({ player, goals: 0, assists: 0 }))
          )
        );

        if (playerEventRequests.length === 0) {
          return of([]);
        }

        return forkJoin(playerEventRequests);
      })
    ).subscribe({
      next: (playerStats) => {
        // Calculate Total Goals
        this.totalGoals = playerStats.reduce((sum, stat) => sum + stat.goals, 0);

        // Top Scorers
        this.topScorers = playerStats
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 5)
          .map(stat => ({ player: stat.player, goals: stat.goals }));

        // Top Assisters
        this.topAssisters = playerStats
          .sort((a, b) => (b.assists || 0) - (a.assists || 0))
          .slice(0, 5)
          .map(stat => ({ player: stat.player, goals: stat.assists || 0 })); // Reusing 'goals' property for generic count column or we can change column def

        this.loadingRanking = false;
      },
      error: (err) => {
        console.error('Error calculating rankings', err);
        this.loadingRanking = false;
      }
    });
  }
}
