import { Routes } from '@angular/router';

export const TasksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ui/tasks-page.component').then(m => m.TasksPageComponent),
    title: 'Tasks',
  },
];
