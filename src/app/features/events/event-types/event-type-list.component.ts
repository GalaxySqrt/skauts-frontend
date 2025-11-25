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
import { EventTypeService } from '../../../core/services/event-type.service';
import { EventTypeDto } from '../../../core/models/api-models';
import { EventTypeFormComponent } from './event-type-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-event-type-list',
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
    templateUrl: './event-type-list.component.html',
    styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'actions'];
    dataSource: MatTableDataSource<EventTypeDto>;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private eventTypeService: EventTypeService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadEventTypes();
    }

    loadEventTypes() {
        this.eventTypeService.getAll().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Failed to load event types', err)
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(eventType?: EventTypeDto) {
        const dialogRef = this.dialog.open(EventTypeFormComponent, {
            width: '500px',
            data: eventType || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadEventTypes();
                this.snackBar.open('Event Type saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deleteEventType(id: number) {
        if (confirm('Are you sure you want to delete this event type?')) {
            if (id === undefined) return;
            this.eventTypeService.delete(id).subscribe({
                next: () => {
                    this.loadEventTypes();
                    this.snackBar.open('Event Type deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
