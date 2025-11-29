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
import { MatTabsModule } from '@angular/material/tabs';
import { PlayerService } from '../../../core/services/player.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerDto, RoleDto } from '../../../core/models/api-models';
import { PlayerFormComponent } from '../form/player-form.component';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-player-list',
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
        MatInputModule,
        TranslateModule,
        MatTabsModule
    ],
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'role', 'skill', 'physique', 'actions'];
    dataSource: MatTableDataSource<PlayerDto>;
    roles: Map<number, string> = new Map();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private playerService: PlayerService,
        private roleService: RoleService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);

            forkJoin({
                players: this.playerService.getByOrg(orgId),
                roles: this.roleService.getAll()
            }).subscribe({
                next: ({ players, roles }) => {
                    this.roles = new Map(roles.map(r => [r.id!, r.name!]));
                    this.dataSource.data = players;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: (err) => console.error('Failed to load data', err)
            });
        }
    }

    getRoleName(roleId?: number): string {
        return roleId ? this.roles.get(roleId) || 'Unknown' : 'N/A';
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(player?: PlayerDto) {
        const dialogRef = this.dialog.open(PlayerFormComponent, {
            width: '600px',
            data: player || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
                this.snackBar.open('Player saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deletePlayer(id: number) {
        if (confirm('Are you sure you want to delete this player?')) {
            if (id === undefined) return;
            this.playerService.delete(id).subscribe({
                next: () => {
                    this.loadData();
                    this.snackBar.open('Player deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
