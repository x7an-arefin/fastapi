import { Injectable, inject } from '@angular/core';
import { TasksStore } from './store/tasks.store';
import type { NewTasks, UpdateTasks } from './models/tasks-api.types';

/**
 * @author arefin
 * @description Facade for Tasks module. Components should only interact with the facade.
 */
@Injectable({ providedIn: 'root' })
export class TasksFacade {
  private readonly store = inject(TasksStore);

  // State
  readonly items = this.store.entities;
  readonly selected = this.store.selected;
  readonly isLoading = this.store.isLoading;
  readonly hasError = this.store.hasError;
  readonly errorMessage = this.store.errorMessage;
  
  // Drawer State
  readonly isDrawerOpen = this.store.isDrawerOpen;
  readonly drawerMode = this.store.drawerMode;
  
  // Delete State
  readonly deleteConfirmId = this.store.deleteConfirmId;
  
  // Actions
  loadAll(): void {
    
    this.store.loadAll();
    
  }
  
  openAddDrawer(): void {
    this.store.openAddDrawer();
  }
  
  openEditDrawer(id: string): void {
    this.store.openEditDrawer(id);
  }
  
  openDetailDrawer(id: string): void {
    this.store.openDetailDrawer(id);
  }
  
  closeDrawer(): void {
    this.store.closeDrawer();
  }
  
  requestDeleteConfirm(id: string): void {
    this.store.requestDeleteConfirm(id);
  }
  
  cancelDelete(): void {
    this.store.cancelDelete();
  }
  
  create(dto: NewTasks): void {
    
    this.store.create(dto);
    
  }
  
  update(id: string, dto: UpdateTasks): void {
    
    this.store.update(id, dto);
    
  }
  
  remove(id: string): void {
    
    this.store.remove(id);
    
  }
}
