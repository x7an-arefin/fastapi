import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('@app/layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [

      {
        path: 'tasks',
        loadChildren: () => import('@app/features/tasks/tasks.routes').then(m => m.TasksRoutes),
      },

      {
        path: 'users',
        loadChildren: () => import('@app/features/users/users.routes').then(m => m.UsersRoutes),
      },

      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('@app/pages/login/login-page.component').then(m => m.LoginPageComponent),
  },
  { path: '**', loadComponent: () => import('@app/pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
