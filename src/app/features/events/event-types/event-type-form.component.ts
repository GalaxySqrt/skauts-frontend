import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EventTypeService } from '../../../core/services/event-type.service';
import { EventTypeDto } from '../../../core/models/api-models';

@Component({
    selector: 'app-event-type-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './event-type-form.component.html',
    styleUrls: ['./event-type-form.component.scss']
})
export class EventTypeFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private eventTypeService: EventTypeService,
        public dialogRef: MatDialogRef<EventTypeFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EventTypeDto | null
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
        const dto = this.form.value;

        if (this.isEditMode && this.data?.id) {
            this.eventTypeService.update(this.data.id, dto).subscribe({
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
            this.eventTypeService.create(dto).subscribe({
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
