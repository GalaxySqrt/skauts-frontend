import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

import { PlayersPrizeService } from '../../../core/services/players-prize.service';
import { PlayersPrizeDto, PlayerDto, PrizeTypeDto, SalvarPlayersPrizeDto } from '../../../core/models/api-models';

export interface PlayersPrizeFormData {
    prize: PlayersPrizeDto | null;
    players: PlayerDto[];
    prizeTypes: PrizeTypeDto[];
}

@Component({
    selector: 'app-players-prize-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        TranslateModule
    ],
    templateUrl: './players-prize-form.component.html',
    styleUrls: ['./players-prize-form.component.scss']
})
export class PlayersPrizeFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = false;
    players: PlayerDto[] = [];
    prizeTypes: PrizeTypeDto[] = [];

    constructor(
        private fb: FormBuilder,
        private playersPrizeService: PlayersPrizeService,
        public dialogRef: MatDialogRef<PlayersPrizeFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PlayersPrizeFormData
    ) {
        this.players = data.players;
        this.prizeTypes = data.prizeTypes;
        this.isEditMode = !!data.prize;

        this.form = this.fb.group({
            playerId: [data.prize?.playerId || '', Validators.required],
            prizeTypeId: [data.prize?.prizeTypeId || '', Validators.required],
            receiveDate: [data.prize?.receiveDate || new Date(), Validators.required]
        });
    }

    ngOnInit() {
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value;

            // Format date to YYYY-MM-DD
            const date = new Date(formValue.receiveDate);
            const formattedDate = date.toISOString().split('T')[0];

            const dto: SalvarPlayersPrizeDto = {
                playerId: formValue.playerId,
                prizeTypeId: formValue.prizeTypeId,
                receiveDate: formattedDate
            };

            if (this.isEditMode && this.data.prize?.id) {
                this.playersPrizeService.update(this.data.prize.id, dto).subscribe({
                    next: () => this.dialogRef.close(true),
                    error: (err) => console.error('Failed to update prize', err)
                });
            } else {
                this.playersPrizeService.create(dto).subscribe({
                    next: () => this.dialogRef.close(true),
                    error: (err) => console.error('Failed to create prize', err)
                });
            }
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
