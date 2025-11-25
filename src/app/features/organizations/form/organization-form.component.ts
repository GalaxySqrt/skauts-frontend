import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { OrganizationService } from '../../../core/services/organization.service';
import { OrganizationDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-organization-form',
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
    templateUrl: './organization-form.component.html',
    styleUrls: ['./organization-form.component.scss']
})
export class OrganizationFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private organizationService: OrganizationService,
        public dialogRef: MatDialogRef<OrganizationFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: OrganizationDto | null
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            imagePath: ['']
        });
    }

    ngOnInit() {
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue({
                name: this.data.name,
                imagePath: this.data.imagePath
            });
        }
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading = true;
        const dto = this.form.value;

        if (this.isEditMode && this.data?.id) {
            this.organizationService.update(this.data.id, dto).subscribe({
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
            this.organizationService.create(dto).subscribe({
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
