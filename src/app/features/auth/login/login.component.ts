import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        TranslateModule,
        LanguageSelectorComponent,
        MatIconModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;

    isDarkTheme = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.isLoading = true;
        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: () => {
                // Fetch user details to get ID
                this.userService.getByEmail(email).subscribe({
                    next: (user) => {
                        // Store user info if needed, or just rely on email/token
                        // For now, navigate to org selection
                        // We might want to store the user ID in AuthService or localStorage
                        if (user.id) {
                            this.authService.setUserId(user.id.toString());
                        }
                        this.router.navigate(['/auth/org-selection']);
                    },
                    error: () => {
                        this.isLoading = false;
                        this.snackBar.open('Failed to fetch user details.', 'Close', { duration: 3000 });
                    }
                });
            },
            error: (err) => {
                this.isLoading = false;
                // Error handled by interceptor, but we can show specific message if needed
                console.error('Login failed', err);
            }
        });
    }
}
