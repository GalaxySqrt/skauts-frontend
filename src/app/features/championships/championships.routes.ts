import { Routes } from '@angular/router';
import { ChampionshipListComponent } from './list/championship-list.component';
import { ChampionshipDetailComponent } from './detail/championship-detail.component';

export const CHAMPIONSHIP_ROUTES: Routes = [
    { path: '', component: ChampionshipListComponent },
    { path: ':id', component: ChampionshipDetailComponent }
];
