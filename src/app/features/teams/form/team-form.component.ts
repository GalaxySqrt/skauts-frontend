import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TeamService } from '../../../core/services/team.service';
import { TeamPlayerService } from '../../../core/services/team-player.service';
import { PlayerService } from '../../../core/services/player.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamDto, PlayerDto, TeamPlayerDto, RoleDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-team-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatListModule,
        TranslateModule
    ],
    templateUrl: './team-form.component.html',
    styleUrls: ['./team-form.component.scss']
})
export class TeamFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    // Player management
    teamPlayers: (TeamPlayerDto & { player?: PlayerDto })[] = [];
    availablePlayers: PlayerDto[] = [];
    allPlayers: PlayerDto[] = [];
    roles: RoleDto[] = [];
    selectedPlayerId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private teamService: TeamService,
        private teamPlayerService: TeamPlayerService,
        private playerService: PlayerService,
        private roleService: RoleService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<TeamFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TeamDto | null
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]]
        });
    }

    ngOnInit() {
        this.loadRoles();
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue({
                name: this.data.name
            });
            this.loadTeamPlayers();
        }
        this.loadAllPlayers();
    }

    loadRoles() {
        this.roleService.getAll().subscribe({
            next: (data) => this.roles = data,
            error: (err) => console.error('Failed to load roles', err)
        });
    }

    loadAllPlayers() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);
            this.playerService.getByOrg(orgId).subscribe({
                next: (players) => {
                    this.allPlayers = players;
                    this.updateAvailablePlayers();
                },
                error: (err) => console.error('Failed to load players', err)
            });
        }
    }

    loadTeamPlayers() {
        if (!this.data?.id) return;

        this.teamPlayerService.getByTeam(this.data.id).subscribe({
            next: (teamPlayers) => {
                // Load player details for each team player
                const playerLoads = teamPlayers.map(tp =>
                    this.playerService.getById(tp.playerId!).pipe()
                );

                if (playerLoads.length > 0) {
                    forkJoin(playerLoads).subscribe({
                        next: (players) => {
                            this.teamPlayers = teamPlayers.map((tp, index) => ({
                                ...tp,
                                player: players[index]
                            }));
                            this.updateAvailablePlayers();
                        },
                        error: (err) => console.error('Failed to load player details', err)
                    });
                } else {
                    this.teamPlayers = [];
                    this.updateAvailablePlayers();
                }
            },
            error: (err) => console.error('Failed to load team players', err)
        });
    }

    updateAvailablePlayers() {
        const teamPlayerIds = this.teamPlayers.map(tp => tp.playerId);
        this.availablePlayers = this.allPlayers.filter(p => !teamPlayerIds.includes(p.id));
    }

    addPlayer() {
        if (!this.selectedPlayerId || !this.data?.id) return;

        const dto: TeamPlayerDto = {
            teamId: this.data.id,
            playerId: this.selectedPlayerId,
            joinDate: new Date().toISOString().split('T')[0]
        };

        this.teamPlayerService.add(dto).subscribe({
            next: () => {
                this.selectedPlayerId = null;
                this.loadTeamPlayers();
            },
            error: (err) => console.error('Failed to add player', err)
        });
    }

    removePlayer(playerId: number) {
        if (!this.data?.id) return;

        if (confirm(this.getTranslation('TEAMS.CONFIRM_REMOVE'))) {
            this.teamPlayerService.remove(this.data.id, playerId).subscribe({
                next: () => {
                    this.loadTeamPlayers();
                },
                error: (err) => console.error('Failed to remove player', err)
            });
        }
    }

    getRoleName(roleId?: number): string {
        if (!roleId) return '';
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.name || '' : '';
    }

    getTranslation(key: string): string {
        // This is a simple fallback - in production, translate service would be used
        return key;
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

        const dto = {
            ...this.form.value,
            orgId: orgId
        };

        if (this.isEditMode && this.data?.id) {
            this.teamService.update(this.data.id, dto).subscribe({
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
            this.teamService.create(dto).subscribe({
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
