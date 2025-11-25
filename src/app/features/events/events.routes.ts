import { Routes } from '@angular/router';
import { EventTypeListComponent } from './event-types/event-type-list.component';

export const EVENT_ROUTES: Routes = [
    { path: 'types', component: EventTypeListComponent }
];
