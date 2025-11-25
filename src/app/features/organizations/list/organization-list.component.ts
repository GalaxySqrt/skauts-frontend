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
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationDto } from '../../../core/models/api-models';
import { OrganizationFormComponent } from '../form/organization-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-organization-list',
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
    templateUrl: './organization-list.component.html',
    styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'createdAt', 'actions'];
    dataSource: MatTableDataSource<OrganizationDto>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private organizationService: OrganizationService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadOrganizations();
    }

    loadOrganizations() {
        this.organizationService.getAll().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Failed to load organizations', err)
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(organization?: OrganizationDto) {
        const dialogRef = this.dialog.open(OrganizationFormComponent, {
            width: '500px',
            data: organization || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadOrganizations();
                this.snackBar.open('Organization saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deleteOrganization(id: number) {
        if (confirm('Are you sure you want to delete this organization?')) {
            if (id === undefined) return;
            this.organizationService.delete(id).subscribe({
                next: () => {
                    this.loadOrganizations();
                    this.snackBar.open('Organization deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
