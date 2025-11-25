import { Routes } from '@angular/router';
import { MatchListComponent } from './list/match-list.component';
import { MatchDetailComponent } from './detail/match-detail.component';

export const MATCH_ROUTES: Routes = [
    { path: '', component: MatchListComponent },
    { path: ':id', component: MatchDetailComponent }
];
