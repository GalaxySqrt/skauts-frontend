import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UsersOrganizationService } from '../../../core/services/users-organization.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrganizationDto, UsersOrganizationDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, map, switchMap } from 'rxjs';

@Component({
    selector: 'app-org-selection',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule
    ],
    templateUrl: './org-selection.component.html',
    styleUrls: ['./org-selection.component.scss']
})
export class OrgSelectionComponent implements OnInit {
    organizations: OrganizationDto[] = [];
    isLoading = true;

    constructor(
        private usersOrgService: UsersOrganizationService,
        private orgService: OrganizationService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        const userIdStr = this.authService.getUserId();
        if (!userIdStr) {
            this.router.navigate(['/auth/login']);
            return;
        }

        const userId = parseInt(userIdStr, 10);

        this.usersOrgService.getByUser(userId).pipe(
            switchMap((usersOrgs: UsersOrganizationDto[]) => {
                if (usersOrgs.length === 0) {
                    return [];
                }
                const orgRequests = usersOrgs.map(uo => this.orgService.getById(uo.orgId!));
                return forkJoin(orgRequests);
            })
        ).subscribe({
            next: (orgs) => {
                this.organizations = orgs;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load organizations', err);
                this.isLoading = false;
            }
        });
    }

    selectOrg(org: OrganizationDto) {
        this.authService.setOrgId(org.id?.toString() || '');
        this.router.navigate(['/dashboard']);
    }
}
