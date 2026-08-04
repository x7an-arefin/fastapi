import { Injectable, inject } from '@angular/core';
import { UsersStore } from './store/users.store';
import type { NewUsers, UpdateUsers } from './models/users-api.types';

/**
 * @author arefin
 * @description Facade for Users module. Components should only interact with the facade.
 */
@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private readonly store = inject(UsersStore);

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
  
  create(dto: NewUsers): void {
    
    this.store.create(dto);
    
  }
  
  update(id: string, dto: UpdateUsers): void {
    
  }
  
  remove(id: string): void {
    
  }
}
