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
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamDto } from '../../../core/models/api-models';
import { TeamFormComponent } from '../form/team-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-team-list',
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
        MatInputModule,
        TranslateModule
    ],
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'actions'];
    dataSource: MatTableDataSource<TeamDto>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private teamService: TeamService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadTeams();
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

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(team?: TeamDto) {
        const dialogRef = this.dialog.open(TeamFormComponent, {
            width: '500px',
            data: team || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadTeams();
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
                    this.snackBar.open('Team deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
