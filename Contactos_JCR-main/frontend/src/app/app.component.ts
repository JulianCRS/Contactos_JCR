import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    RouterLink  // Añadir RouterLink para que funcione el routerLink del sidebar
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string | null = null;
  isLoggedIn = false;
  theme: 'light' | 'dark' = 'light';
  currentYear = new Date().getFullYear(); // Añadir esta línea
  isSidebarOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    const savedTheme = localStorage.getItem('theme');
    this.theme = (savedTheme === 'dark' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  ngOnInit() {
    // Verificar estado de autenticación y suscribirse a cambios
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user?.username || null;
    });

    // Verificar sesión existente
    this.authService.checkAndRestoreSession();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
