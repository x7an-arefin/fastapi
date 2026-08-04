import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity, removeEntity, addEntity } from '@ngrx/signals/entities';
import { inject, computed } from '@angular/core';
import type { RequestState } from '@core/types/request-state.type';
import type { Tasks } from '../models/tasks.model';
import type { NewTasks, UpdateTasks } from '../models/tasks-api.types';
import { TasksApiService } from '../services/tasks-api.service';

type DrawerMode = 'add' | 'edit' | 'detail' | null;

interface TasksState {
  requestState: RequestState<void>;
  selectedId: string | null;
  drawerMode: DrawerMode;
  deleteConfirmId: string | null;
  cursor: string | null;
  hasMore: boolean;
}

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withEntities<Tasks>(),
  withState<TasksState>({
    requestState: { status: 'idle' },
    selectedId: null,
    drawerMode: null,
    deleteConfirmId: null,
    cursor: null,
    hasMore: false,
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.requestState().status === 'loading'),
    hasError: computed(() => store.requestState().status === 'error'),
    errorMessage: computed(() => {
      const state = store.requestState();
      return state.status === 'error' ? state.error : null;
    }),
    selected: computed(() => {
      const id = store.selectedId();
      return id ? store.entityMap()[id] ?? null : null;
    }),
    isDrawerOpen: computed(() => store.drawerMode() !== null),
  })),
  withMethods((store, api = inject(TasksApiService)) => ({
    openAddDrawer(): void { patchState(store, { drawerMode: 'add', selectedId: null }); },
    openEditDrawer(id: string): void { patchState(store, { drawerMode: 'edit', selectedId: id }); },
    openDetailDrawer(id: string): void { patchState(store, { drawerMode: 'detail', selectedId: id }); },
    closeDrawer(): void { patchState(store, { drawerMode: null, selectedId: null }); },
    requestDeleteConfirm(id: string): void { patchState(store, { deleteConfirmId: id }); },
    cancelDelete(): void { patchState(store, { deleteConfirmId: null }); },

    async loadAll(): Promise<void> {
      patchState(store, { requestState: { status: 'loading' } });
      const result = await api.list();
      if (result.ok) {
        patchState(store, setAllEntities(result.data.items), {
          requestState: { status: 'success' },
          cursor: result.data.nextCursor ?? null,
          hasMore: result.data.hasMore ?? false,
        });
      } else {
        patchState(store, { requestState: { status: 'error', error: result.error } });
      }
    },


    async create(dto: NewTasks): Promise<void> {
      patchState(store, { requestState: { status: 'loading' } });
      const result = await api.create(dto);
      if (result.ok) {
        patchState(store, addEntity(result.data), { requestState: { status: 'success' } });
        patchState(store, { drawerMode: null, selectedId: null });
      } else {
        patchState(store, { requestState: { status: 'error', error: result.error } });
      }
    },


    async update(id: string, dto: UpdateTasks): Promise<void> {
      patchState(store, { requestState: { status: 'loading' } });
      const result = await api.update(id, dto);
      if (result.ok) {
        patchState(store, updateEntity({ id, changes: result.data }), { requestState: { status: 'success' } });
        patchState(store, { drawerMode: null, selectedId: null });
      } else {
        patchState(store, { requestState: { status: 'error', error: result.error } });
      }
    },


    async remove(id: string): Promise<void> {
      patchState(store, { requestState: { status: 'loading' } });
      const result = await api.remove(id);
      if (result.ok) {
        patchState(store, removeEntity(id), { requestState: { status: 'success' }, deleteConfirmId: null });
      } else {
        patchState(store, { requestState: { status: 'error', error: result.error } });
      }
    },

  }))
);
