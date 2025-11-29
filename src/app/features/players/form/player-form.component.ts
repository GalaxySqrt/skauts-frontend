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
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '../../../core/services/player.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerDto, RoleDto } from '../../../core/models/api-models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-player-form',
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
        MatIconModule,
        TranslateModule
    ],
    templateUrl: './player-form.component.html',
    styleUrls: ['./player-form.component.scss']
})
export class PlayerFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    isLoading = false;
    roles: RoleDto[] = [];
    imagePreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private playerService: PlayerService,
        private roleService: RoleService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<PlayerFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PlayerDto | null
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            roleId: ['', Validators.required],
            skill: [null, [Validators.min(0), Validators.max(100)]],
            physique: [null, [Validators.min(0), Validators.max(100)]],
            phone: [''],
            email: ['', [Validators.email]],
            birthDate: [null],
            imagePath: ['']
        });
    }

    ngOnInit() {
        this.loadRoles();
        if (this.data) {
            this.isEditMode = true;
            this.form.patchValue({
                name: this.data.name,
                roleId: this.data.roleId,
                skill: this.data.skill,
                physique: this.data.physique,
                phone: this.data.phone,
                email: this.data.email,
                birthDate: this.data.birthDate,
                imagePath: this.data.imagePath
            });
            // Set image preview if imagePath exists
            if (this.data.imagePath) {
                this.imagePreview = this.data.imagePath;
            }
        }
    }

    loadRoles() {
        this.roleService.getAll().subscribe({
            next: (data) => this.roles = data,
            error: (err) => console.error('Failed to load roles', err)
        });
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
            birthDate: this.formatDate(this.form.value.birthDate)
        };

        if (this.isEditMode && this.data?.id) {
            this.playerService.update(this.data.id, dto).subscribe({
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
            this.playerService.create(dto).subscribe({
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

    onImagePathChange() {
        const imagePath = this.form.get('imagePath')?.value;
        this.imagePreview = imagePath && imagePath.trim() !== '' ? imagePath : null;
    }

    onImageError() {
        this.imagePreview = null;
    }

    getRoleAcronym(roleId: number): string {
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.acronym || '' : '';
    }

    private formatDate(date: Date | string): string | null {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return date.toISOString().split('T')[0];
    }
}
