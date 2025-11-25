import { Routes } from '@angular/router';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { EmailComponent } from './components/email/email.component';  // Asegurarnos que existe este componente
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/login',  // Cambiar a /login
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'contactos',
    component: ContactListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'contactos/nuevo',
    component: ContactFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'contactos/editar/:id',
    component: ContactFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'email',
    component: EmailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
];
