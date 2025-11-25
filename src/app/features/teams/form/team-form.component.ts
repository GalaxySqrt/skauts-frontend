import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-team-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        TranslateModule
    ],
    templateUrl: './team-form.component.html',
    styleUrls: ['./team-form.component.scss']
})
export class TeamFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private teamService: TeamService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<TeamFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TeamDto | null
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]]
        });
    }

    ngOnInit() {
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue({
                name: this.data.name
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

        const dto = {
            ...this.form.value,
            orgId: orgId
        };

        if (this.isEditMode && this.data?.id) {
            this.teamService.update(this.data.id, dto).subscribe({
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
            this.teamService.create(dto).subscribe({
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
