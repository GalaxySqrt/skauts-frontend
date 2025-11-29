import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatchService } from '../../../core/services/match.service';
import { TeamService } from '../../../core/services/team.service';
import { ChampionshipService } from '../../../core/services/championship.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { EventTypeService } from '../../../core/services/event-type.service';
import { PlayerService } from '../../../core/services/player.service';
import { MatchDto, TeamDto, ChampionshipDto, EventDto, EventTypeDto, PlayerDto, SalvarEventDto } from '../../../core/models/api-models';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

interface EventWithDetails extends EventDto {
    playerName?: string;
    eventTypeName?: string;
    isEditing?: boolean;
}

@Component({
    selector: 'app-match-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        TranslateModule
    ],
    templateUrl: './match-form.component.html',
    styleUrls: ['./match-form.component.scss']
})
export class MatchFormComponent implements OnInit {
    form: FormGroup;
    eventForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    teams: TeamDto[] = [];
    championships: ChampionshipDto[] = [];
    players: PlayerDto[] = [];
    eventTypes: EventTypeDto[] = [];
    events: EventWithDetails[] = [];
    editingEventIndex: number | null = null;

    constructor(
        private fb: FormBuilder,
        private matchService: MatchService,
        private teamService: TeamService,
        private championshipService: ChampionshipService,
        private authService: AuthService,
        private eventService: EventService,
        private eventTypeService: EventTypeService,
        private playerService: PlayerService,
        public dialogRef: MatDialogRef<MatchFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MatchDto | null
    ) {
        this.form = this.fb.group({
            teamAId: ['', Validators.required],
            teamBId: ['', Validators.required],
            date: ['', Validators.required],
            time: ['', Validators.required], // Separate time input for better UX
            championshipId: [null]
        });

        this.eventForm = this.fb.group({
            playerId: ['', Validators.required],
            eventTypeId: ['', Validators.required],
            eventTime: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadDependencies();
        if (this.data) {
            this.isEditMode = true;
            const dateObj = new Date(this.data.date!);
            this.form.patchValue({
                teamAId: this.data.teamAId,
                teamBId: this.data.teamBId,
                date: dateObj,
                time: dateObj.toTimeString().substring(0, 5),
                championshipId: this.data.championshipId
            });
        }
    }

    loadDependencies() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);
            forkJoin({
                teams: this.teamService.getByOrg(orgId),
                championships: this.championshipService.getByOrg(orgId),
                players: this.playerService.getByOrg(orgId),
                eventTypes: this.eventTypeService.getAll()
            }).subscribe({
                next: ({ teams, championships, players, eventTypes }) => {
                    this.teams = teams;
                    this.championships = championships;
                    this.players = players;
                    this.eventTypes = eventTypes;

                    // Load events after dependencies are loaded
                    if (this.data?.id && this.isEditMode) {
                        this.loadMatchEvents(this.data.id);
                    }
                },
                error: (err) => console.error('Failed to load dependencies', err)
            });
        }
    }

    loadMatchEvents(matchId: number) {
        this.eventService.getByMatch(matchId).subscribe({
            next: (events) => {
                this.events = events.map(event => ({
                    ...event,
                    playerName: this.getPlayerName(event.playerId),
                    eventTypeName: this.getEventTypeName(event.eventTypeId),
                    isEditing: false
                }));
            },
            error: (err) => console.error('Failed to load events', err)
        });
    }

    getPlayerName(playerId?: number): string {
        if (!playerId) return '';
        const player = this.players.find(p => p.id === playerId);
        return player?.name || '';
    }

    getPlayerImage(playerId?: number): string {
        if (!playerId) return '';
        const player = this.players.find(p => p.id === playerId);
        return player?.imagePath || '';
    }

    getEventTypeName(eventTypeId?: number): string {
        if (!eventTypeId) return '';
        const eventType = this.eventTypes.find(et => et.id === eventTypeId);
        return eventType?.name || '';
    }

    addEvent() {
        if (this.eventForm.invalid) return;
        if (!this.data?.id) return;

        this.isLoading = true;

        const eventDto: SalvarEventDto = {
            matchId: this.data.id,
            playerId: this.eventForm.value.playerId,
            eventTypeId: this.eventForm.value.eventTypeId,
            eventTime: this.getEventIsoTime()
        };

        this.eventService.create(eventDto).subscribe({
            next: (created) => {
                this.events.push({
                    ...created,
                    playerName: this.getPlayerName(created.playerId),
                    eventTypeName: this.getEventTypeName(created.eventTypeId),
                    isEditing: false
                });
                this.eventForm.reset();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to create event', err);
                this.isLoading = false;
            }
        });
    }

    startEditEvent(index: number) {
        this.editingEventIndex = index;
        const event = this.events[index];
        this.eventForm.patchValue({
            playerId: event.playerId,
            eventTypeId: event.eventTypeId,
            eventTime: event.eventTime
        });
        event.isEditing = true;
    }

    updateEvent() {
        if (this.eventForm.invalid || this.editingEventIndex === null) return;
        if (!this.data?.id) return;

        this.isLoading = true;
        const event = this.events[this.editingEventIndex];

        const eventDto: SalvarEventDto = {
            matchId: this.data.id,
            playerId: this.eventForm.value.playerId,
            eventTypeId: this.eventForm.value.eventTypeId,
            eventTime: this.getEventIsoTime()
        };

        this.eventService.update(event.id!, eventDto).subscribe({
            next: () => {
                this.events[this.editingEventIndex!] = {
                    ...event,
                    playerId: eventDto.playerId,
                    eventTypeId: eventDto.eventTypeId,
                    eventTime: eventDto.eventTime,
                    playerName: this.getPlayerName(eventDto.playerId),
                    eventTypeName: this.getEventTypeName(eventDto.eventTypeId),
                    isEditing: false
                };
                this.cancelEditEvent();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to update event', err);
                this.isLoading = false;
            }
        });
    }

    cancelEditEvent() {
        this.editingEventIndex = null;
        this.eventForm.reset();
    }

    deleteEvent(index: number) {
        const event = this.events[index];
        if (event.id) {
            this.eventService.delete(event.id).subscribe({
                next: () => {
                    this.events.splice(index, 1);
                },
                error: (err) => console.error('Failed to delete event', err)
            });
        }
    }

    getEventIsoTime(): string {
        const matchDate = new Date(this.form.value.date);
        const timeParts = this.eventForm.value.eventTime.split(':');
        matchDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
        return matchDate.toISOString();
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading = true;
        const orgIdStr = this.authService.getOrgId();
        if (!orgIdStr) {
            console.error('No organization selected');
            this.isLoading = false;
            return;
        }
        const orgId = parseInt(orgIdStr, 10);

        const date = this.form.value.date as Date;
        const time = this.form.value.time as string;
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes);

        const dto = {
            orgId: orgId,
            teamAId: this.form.value.teamAId,
            teamBId: this.form.value.teamBId,
            date: date.toISOString(),
            championshipId: this.form.value.championshipId
        };

        if (this.isEditMode && this.data?.id) {
            this.matchService.update(this.data.id, dto).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.matchService.create(dto).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Create failed', err);
                    this.isLoading = false;
                }
            });
        }
    }
}
