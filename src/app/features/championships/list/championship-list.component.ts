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
import { ChampionshipService } from '../../../core/services/championship.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChampionshipDto } from '../../../core/models/api-models';
import { ChampionshipFormComponent } from '../form/championship-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-championship-list',
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
    templateUrl: './championship-list.component.html',
    styleUrls: ['./championship-list.component.scss']
})
export class ChampionshipListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'startDate', 'endDate', 'actions'];
    dataSource: MatTableDataSource<ChampionshipDto>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private championshipService: ChampionshipService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadChampionships();
    }

    loadChampionships() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);
            this.championshipService.getByOrg(orgId).subscribe({
                next: (data) => {
                    this.dataSource.data = data;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: (err) => console.error('Failed to load championships', err)
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

    openForm(championship?: ChampionshipDto) {
        const dialogRef = this.dialog.open(ChampionshipFormComponent, {
            width: '500px',
            data: championship || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadChampionships();
                this.snackBar.open('Championship saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deleteChampionship(id: number) {
        if (confirm('Are you sure you want to delete this championship?')) {
            if (id === undefined) return;
            this.championshipService.delete(id).subscribe({
                next: () => {
                    this.loadChampionships();
                    this.snackBar.open('Championship deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
