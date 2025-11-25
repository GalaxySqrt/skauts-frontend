import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatchService } from '../../../core/services/match.service';
import { TeamService } from '../../../core/services/team.service';
import { ChampionshipService } from '../../../core/services/championship.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatchDto, TeamDto, ChampionshipDto } from '../../../core/models/api-models';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-match-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        TranslateModule
    ],
    templateUrl: './match-form.component.html',
    styleUrls: ['./match-form.component.scss']
})
export class MatchFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    teams: TeamDto[] = [];
    championships: ChampionshipDto[] = [];

    constructor(
        private fb: FormBuilder,
        private matchService: MatchService,
        private teamService: TeamService,
        private championshipService: ChampionshipService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<MatchFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MatchDto | null
    ) {
        this.form = this.fb.group({
            teamAId: ['', Validators.required],
            teamBId: ['', Validators.required],
            date: ['', Validators.required],
            time: ['', Validators.required], // Separate time input for better UX
            championshipId: [null]
        });
    }

    ngOnInit() {
        this.loadDependencies();
        if (this.data) {
            this.isEditMode = true;
            const dateObj = new Date(this.data.date!);
            this.form.patchValue({
                teamAId: this.data.teamAId,
                teamBId: this.data.teamBId,
                date: dateObj,
                time: dateObj.toTimeString().substring(0, 5),
                championshipId: this.data.championshipId
            });
        }
    }

    loadDependencies() {
        const orgIdStr = this.authService.getOrgId();
        if (orgIdStr) {
            const orgId = parseInt(orgIdStr, 10);
            forkJoin({
                teams: this.teamService.getByOrg(orgId),
                championships: this.championshipService.getByOrg(orgId)
            }).subscribe({
                next: ({ teams, championships }) => {
                    this.teams = teams;
                    this.championships = championships;
                },
                error: (err) => console.error('Failed to load dependencies', err)
            });
        }
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading = true;
        const orgIdStr = this.authService.getOrgId();
        if (!orgIdStr) {
            console.error('No organization selected');
            this.isLoading = false;
            return;
        }
        const orgId = parseInt(orgIdStr, 10);

        const date = this.form.value.date as Date;
        const time = this.form.value.time as string;
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes);

        const dto = {
            orgId: orgId,
            teamAId: this.form.value.teamAId,
            teamBId: this.form.value.teamBId,
            date: date.toISOString(),
            championshipId: this.form.value.championshipId
        };

        if (this.isEditMode && this.data?.id) {
            this.matchService.update(this.data.id, dto).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Update failed', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.matchService.create(dto).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    console.error('Create failed', err);
                    this.isLoading = false;
                }
            });
        }
    }
}
