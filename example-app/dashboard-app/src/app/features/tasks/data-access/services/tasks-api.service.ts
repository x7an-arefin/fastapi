import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import type { Tasks } from '../models/tasks.model';
import type { NewTasks, UpdateTasks, TasksListResponse } from '../models/tasks-api.types';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/taskses`;
  

  async list(cursor?: string, limit = 20): Promise<{ ok: true; data: TasksListResponse } | { ok: false; error: string }> {
    try {
      let params = new HttpParams().set('limit', limit);
      if (cursor) params = params.set('cursor', cursor);
      const data = await firstValueFrom(this.http.get<TasksListResponse>(this.baseUrl, { params }));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async getById(id: string): Promise<{ ok: true; data: Tasks } | { ok: false; error: string }> {
    try {
      const data = await firstValueFrom(this.http.get<Tasks>(`${this.baseUrl}/${id}`));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async create(dto: NewTasks): Promise<{ ok: true; data: Tasks } | { ok: false; error: string }> {
    try {
      const data = await firstValueFrom(this.http.post<Tasks>(this.baseUrl, dto));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async update(id: string, dto: UpdateTasks): Promise<{ ok: true; data: Tasks } | { ok: false; error: string }> {
    try {
      const data = await firstValueFrom(this.http.patch<Tasks>(`${this.baseUrl}/${id}`, dto));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async remove(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

}
