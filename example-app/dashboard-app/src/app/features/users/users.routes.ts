import { Routes } from '@angular/router';

export const UsersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/users-page.component').then(m => m.UsersPageComponent),
    title: 'Users',
  },
];
