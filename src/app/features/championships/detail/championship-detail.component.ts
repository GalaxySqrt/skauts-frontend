import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ChampionshipService } from '../../../core/services/championship.service';
import { ChampionshipDto } from '../../../core/models/api-models';

@Component({
    selector: 'app-championship-detail',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTabsModule],
    templateUrl: './championship-detail.component.html',
    styleUrls: ['./championship-detail.component.scss']
})
export class ChampionshipDetailComponent implements OnInit {
    championship: ChampionshipDto | null = null;

    constructor(
        private route: ActivatedRoute,
        private championshipService: ChampionshipService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.championshipService.getById(+id).subscribe({
                next: (data) => this.championship = data,
                error: (err) => console.error('Failed to load championship', err)
            });
        }
    }
}
