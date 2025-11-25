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
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { PlayersPrizeService } from '../../../core/services/players-prize.service';
import { PlayerService } from '../../../core/services/player.service';
import { PrizeTypeService } from '../../../core/services/prize-type.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayersPrizeDto, PlayerDto, PrizeTypeDto } from '../../../core/models/api-models';
import { PlayersPrizeFormComponent } from '../form/players-prize-form.component';

@Component({
    selector: 'app-players-prize-list',
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
    templateUrl: './players-prize-list.component.html',
    styleUrls: ['./players-prize-list.component.scss']
})
export class PlayersPrizeListComponent implements OnInit {
    displayedColumns: string[] = ['playerName', 'prizeTypeName', 'receiveDate', 'actions'];
    dataSource: MatTableDataSource<PlayersPrizeDto>;

    players: PlayerDto[] = [];
    prizeTypes: PrizeTypeDto[] = [];
    playerMap = new Map<number, string>();
    prizeTypeMap = new Map<number, string>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private playersPrizeService: PlayersPrizeService,
        private playerService: PlayerService,
        private prizeTypeService: PrizeTypeService,
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
        if (!orgIdStr) return;
        const orgId = parseInt(orgIdStr, 10);

        // Load players and prize types first to build maps
        forkJoin({
            players: this.playerService.getByOrg(orgId),
            prizeTypes: this.prizeTypeService.getAll(),
            prizes: this.playersPrizeService.getAll()
        }).subscribe({
            next: (data) => {
                this.players = data.players;
                this.prizeTypes = data.prizeTypes;

                // Build maps for easy lookup
                this.playerMap.clear();
                this.players.forEach(p => {
                    if (p.id && p.name) this.playerMap.set(p.id, p.name);
                });

                this.prizeTypeMap.clear();
                this.prizeTypes.forEach(pt => {
                    if (pt.id && pt.name) this.prizeTypeMap.set(pt.id, pt.name);
                });

                // Filter prizes to only show those for players in the current org
                const playerIds = new Set(this.players.map(p => p.id));
                const filteredPrizes = data.prizes.filter(prize =>
                    prize.playerId !== undefined && playerIds.has(prize.playerId)
                );

                this.dataSource.data = filteredPrizes;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Failed to load data', err)
        });
    }

    getPlayerName(id?: number): string {
        if (!id) return '';
        return this.playerMap.get(id) || 'Unknown Player';
    }

    getPrizeTypeName(id?: number): string {
        if (!id) return '';
        return this.prizeTypeMap.get(id) || 'Unknown Prize Type';
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        // Custom filter predicate to search by names instead of IDs
        this.dataSource.filterPredicate = (data: PlayersPrizeDto, filter: string) => {
            const playerName = this.getPlayerName(data.playerId).toLowerCase();
            const prizeName = this.getPrizeTypeName(data.prizeTypeId).toLowerCase();
            const date = data.receiveDate ? data.receiveDate.toLowerCase() : '';
            return playerName.includes(filter) || prizeName.includes(filter) || date.includes(filter);
        };

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openForm(prize?: PlayersPrizeDto) {
        const dialogRef = this.dialog.open(PlayersPrizeFormComponent, {
            width: '500px',
            data: {
                prize: prize || null,
                players: this.players,
                prizeTypes: this.prizeTypes
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadData();
                this.snackBar.open('Prize saved successfully', 'Close', { duration: 3000 });
            }
        });
    }

    deletePrize(id?: number) {
        if (!id) return;
        if (confirm('Are you sure you want to delete this prize?')) {
            this.playersPrizeService.delete(id).subscribe({
                next: () => {
                    this.loadData();
                    this.snackBar.open('Prize deleted', 'Close', { duration: 3000 });
                },
                error: (err) => console.error('Failed to delete', err)
            });
        }
    }
}
