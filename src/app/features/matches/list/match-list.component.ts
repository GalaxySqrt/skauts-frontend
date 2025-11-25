import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatchService } from '../../../core/services/match.service';
import { TeamService } from '../../../core/services/team.service';
import { ChampionshipService } from '../../../core/services/championship.service';
import { MatchDto } from '../../../core/models/api-models';
import { MatchFormComponent } from '../form/match-form.component';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-match-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule
    ],
    templateUrl: './match-list.component.html',
    styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {
    displayedColumns: string[] = ['date', 'teamA', 'teamB', 'championship', 'actions'];
    dataSource: MatTableDataSource<MatchDto>;
    teams: Map<string, string> = new Map();
    championships: Map<number, string> = new Map();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private matchService: MatchService,
        private teamService: TeamService,
        private championshipService: ChampionshipService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const orgIdStr = localStorage.getItem('skauts_org_id');
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);

            forkJoin({
                matches: this.matchService.getByOrg(orgId),
                teams: this.teamService.getByOrg(orgId),
                championships: this.championshipService.getByOrg(orgId)
            }).subscribe({
                next: ({ matches, teams, championships }) => {
                    this.teams = new Map(teams.map(t => [t.id!, t.name!]));
                    this.championships = new Map(championships.map(c => [c.id!, c.name!]));
                    this.dataSource.data = matches;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: (err) => console.error('Failed to load data', err)
            });
        }
    }

    getTeamName(teamId?: string): string {
        return teamId ? this.teams.get(teamId) || 'Unknown' : 'N/A';
    }

    getChampionshipName(champId?: number): string {
        return champId ? this.championships.get(champId) || 'Unknown' : 'Friendly';
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(match?: MatchDto) {
        const dialogRef = this.dialog.open(MatchFormComponent, {
            width: '600px',
            data: match || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
                this.snackBar.open('Match saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deleteMatch(id: number) {
        if (confirm('Are you sure you want to delete this match?')) {
            if (id === undefined) return;
            this.matchService.delete(id).subscribe({
                next: () => {
                    this.loadData();
                    this.snackBar.open('Match deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
