import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ChampionshipService } from '../../../core/services/championship.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChampionshipDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-championship-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        TranslateModule
    ],
    templateUrl: './championship-form.component.html',
    styleUrls: ['./championship-form.component.scss']
})
export class ChampionshipFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private championshipService: ChampionshipService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<ChampionshipFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ChampionshipDto | null
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(150)]],
            startDate: ['', Validators.required],
            endDate: ['']
        });
    }

    ngOnInit() {
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue({
                name: this.data.name,
                startDate: this.data.startDate,
                endDate: this.data.endDate
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
            orgId: orgId,
            // Ensure dates are strings if needed, or rely on Angular's serialization
            startDate: this.formatDate(this.form.value.startDate),
            endDate: this.form.value.endDate ? this.formatDate(this.form.value.endDate) : null
        };

        if (this.isEditMode && this.data?.id) {
            this.championshipService.update(this.data.id, dto).subscribe({
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
            this.championshipService.create(dto).subscribe({
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

    private formatDate(date: Date | string): string {
        if (!date) return '';
        if (typeof date === 'string') return date;
        return date.toISOString().split('T')[0];
    }
}
