import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TeamService } from '../../../core/services/team.service';
import { TeamPlayerService } from '../../../core/services/team-player.service';
import { PlayerService } from '../../../core/services/player.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamDto, PlayerDto, TeamPlayerDto, RoleDto } from '../../../core/models/api-models';
import { TeamFormComponent } from '../form/team-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-team-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        TranslateModule
    ],
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class TeamListComponent implements OnInit {
    displayedColumns: string[] = ['expand', 'name', 'createdAt', 'actions'];
    dataSource: MatTableDataSource<TeamDto>;
    expandedElements: Set<string> = new Set();
    teamPlayers: Map<string, (TeamPlayerDto & { player?: PlayerDto })[]> = new Map();
    roles: RoleDto[] = [];
    loadingPlayers: Set<string> = new Set();
    filterDate: Date | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private teamService: TeamService,
        private teamPlayerService: TeamPlayerService,
        private playerService: PlayerService,
        private roleService: RoleService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
        this.dataSource.filterPredicate = this.createFilter();
    }

    ngOnInit() {
        this.loadRoles();
        this.loadTeams();
    }

    loadRoles() {
        this.roleService.getAll().subscribe({
            next: (data) => this.roles = data,
            error: (err) => console.error('Failed to load roles', err)
        });
    }

    loadTeams() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);
            this.teamService.getByOrg(orgId).subscribe({
                next: (data) => {
                    this.dataSource.data = data;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: (err) => console.error('Failed to load teams', err)
            });
        }
    }

    toggleRow(element: TeamDto) {
        const teamId = element.id!;

        if (this.expandedElements.has(teamId)) {
            this.expandedElements.delete(teamId);
        } else {
            this.expandedElements.add(teamId);
            if (!this.teamPlayers.has(teamId)) {
                this.loadTeamPlayers(teamId);
            }
        }
    }

    isExpanded(element: TeamDto): boolean {
        return this.expandedElements.has(element.id!);
    }

    loadTeamPlayers(teamId: string) {
        this.loadingPlayers.add(teamId);

        this.teamPlayerService.getByTeam(teamId).subscribe({
            next: (teamPlayers) => {
                if (teamPlayers.length > 0) {
                    const playerLoads = teamPlayers.map(tp =>
                        this.playerService.getById(tp.playerId!)
                    );

                    forkJoin(playerLoads).subscribe({
                        next: (players) => {
                            const enrichedPlayers = teamPlayers.map((tp, index) => ({
                                ...tp,
                                player: players[index]
                            }));
                            this.teamPlayers.set(teamId, enrichedPlayers);
                            this.loadingPlayers.delete(teamId);
                        },
                        error: (err) => {
                            console.error('Failed to load player details', err);
                            this.loadingPlayers.delete(teamId);
                        }
                    });
                } else {
                    this.teamPlayers.set(teamId, []);
                    this.loadingPlayers.delete(teamId);
                }
            },
            error: (err) => {
                console.error('Failed to load team players', err);
                this.loadingPlayers.delete(teamId);
            }
        });
    }

    getTeamPlayers(teamId: string): (TeamPlayerDto & { player?: PlayerDto })[] {
        return this.teamPlayers.get(teamId) || [];
    }

    isLoadingPlayers(teamId: string): boolean {
        return this.loadingPlayers.has(teamId);
    }

    getRoleName(roleId?: number): string {
        if (!roleId) return '';
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.name || '' : '';
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    createFilter(): (data: TeamDto, filter: string) => boolean {
        return (data: TeamDto, filter: string): boolean => {
            const searchStr = filter.toLowerCase();
            const matchesText = !searchStr || (data.name?.toLowerCase().includes(searchStr) ?? false);

            let matchesDate = true;
            if (this.filterDate) {
                const teamDate = new Date(data.createdAt!);
                const filterDateOnly = new Date(this.filterDate.getFullYear(), this.filterDate.getMonth(), this.filterDate.getDate());
                const teamDateOnly = new Date(teamDate.getFullYear(), teamDate.getMonth(), teamDate.getDate());
                matchesDate = teamDateOnly.getTime() === filterDateOnly.getTime();
            }

            return matchesText && matchesDate;
        };
    }

    applyDateFilter(date: Date | null) {
        this.filterDate = date;
        this.dataSource.filter = this.dataSource.filter || ' ';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    clearDateFilter() {
        this.filterDate = null;
        this.dataSource.filter = this.dataSource.filter || ' ';

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(team?: TeamDto) {
        const dialogRef = this.dialog.open(TeamFormComponent, {
            width: '600px',
            data: team || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadTeams();
                // Refresh players if the edited team was expanded
                if (team?.id && this.teamPlayers.has(team.id)) {
                    this.loadTeamPlayers(team.id);
                }
                this.snackBar.open('Team saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deleteTeam(id: string) {
        if (confirm('Are you sure you want to delete this team?')) {
            if (id === undefined) return;
            this.teamService.delete(id).subscribe({
                next: () => {
                    this.loadTeams();
                    this.teamPlayers.delete(id);
                    this.snackBar.open('Team deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
