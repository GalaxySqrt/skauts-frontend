import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-dashboard-home',
    standalone: true,
    imports: [CommonModule, MatCardModule],
    template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Welcome to Skauts</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Select an item from the menu to manage your data.</p>
      </mat-card-content>
    </mat-card>
  `,
    styles: [`
    mat-card {
      max-width: 600px;
      margin: 20px auto;
    }
  `]
})
export class DashboardHomeComponent { }
