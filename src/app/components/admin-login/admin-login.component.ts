import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  private router = inject(Router);

  // Credentials
  username = '';
  password = '';

  // UI State
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // Animation state
  shakeError = signal(false);

  // Credenciales hardcodeadas (temporal - después puedes usar Firebase Auth)
  private readonly ADMIN_USERNAME = 'dona';
  private readonly ADMIN_PASSWORD = '123';

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  async onSubmit(): Promise<void> {
    // Reset error
    this.errorMessage.set('');
    this.shakeError.set(false);

    // Validaciones
    if (!this.username || !this.password) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);

    // Simular delay de autenticación (más realista)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar credenciales
    if (this.username === this.ADMIN_USERNAME && this.password === this.ADMIN_PASSWORD) {
      // Login exitoso
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminUser', this.username);

      // Navegar al panel admin
      this.router.navigate(['/admin']);
    } else {
      // Login fallido
      this.showError('Usuario o contraseña incorrectos');
      this.password = ''; // Limpiar password
    }

    this.isLoading.set(false);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    this.shakeError.set(true);

    // Remover animación después de que termine
    setTimeout(() => {
      this.shakeError.set(false);
    }, 500);
  }

  // Easter egg: presionar Enter para submit
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }
}
