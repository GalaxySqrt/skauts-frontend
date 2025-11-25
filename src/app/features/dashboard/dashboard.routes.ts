import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';
import { DashboardHomeComponent } from './home/dashboard-home.component';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        component: DashboardLayoutComponent,
        children: [
            { path: '', component: DashboardHomeComponent },
            {
                path: 'championships',
                loadChildren: () => import('../championships/championships.routes').then(m => m.CHAMPIONSHIP_ROUTES)
            },
            {
                path: 'organizations',
                loadChildren: () => import('../organizations/organizations.routes').then(m => m.ORGANIZATION_ROUTES)
            },
            {
                path: 'players',
                loadChildren: () => import('../players/players.routes').then(m => m.PLAYER_ROUTES)
            },
            {
                path: 'matches',
                loadChildren: () => import('../matches/matches.routes').then(m => m.MATCH_ROUTES)
            },
            {
                path: 'teams',
                loadChildren: () => import('../teams/teams.routes').then(m => m.TEAM_ROUTES)
            },
            {
                path: 'events',
                loadChildren: () => import('../events/events.routes').then(m => m.EVENT_ROUTES)
            }
        ]
    }
];
