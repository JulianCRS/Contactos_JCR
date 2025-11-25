import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  authForm: FormGroup;
  isSignup = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(g: FormGroup) {
    // Solo validar si estamos en modo signup
    if (!g.get('confirmPassword')?.value) return null;

    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { 'mismatch': true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  toggleMode(signup: boolean) {
    this.isSignup = signup;
    this.error = null;
    this.successMessage = null;

    // Resetear el formulario
    this.authForm.reset();

    if (signup) {
      this.authForm.get('username')?.setValidators(Validators.required);
      this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('username')?.clearValidators();
      this.authForm.get('confirmPassword')?.clearValidators();
      // Remover el validador de coincidencia de contraseñas en modo login
      this.authForm.setValidators(null);
    }

    // Actualizar validaciones
    this.authForm.get('username')?.updateValueAndValidity();
    this.authForm.get('confirmPassword')?.updateValueAndValidity();
    this.authForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      const credentials = this.authForm.value;

      if (this.isSignup) {
        this.authService.signup(credentials).subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = 'Registro exitoso. Por favor, inicia sesión.';
            // Limpiar el formulario y cambiar a modo login
            this.authForm.reset();
            this.isSignup = false;
            this.toggleMode(false);
          },
          error: (err) => {
            this.error = err.error?.detail || 'Error en el registro';
            this.loading = false;
          }
        });
      } else {
        this.authService.login(credentials).subscribe({
          next: () => {
            this.router.navigate(['/contactos']);
          },
          error: (err) => {
            this.error = err.error?.detail || 'Error en la autenticación';
            this.loading = false;
          }
        });
      }
    }
  }
}
