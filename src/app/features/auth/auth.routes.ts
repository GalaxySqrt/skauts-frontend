import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OrgSelectionComponent } from './org-selection/org-selection.component';

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'org-selection', component: OrgSelectionComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
