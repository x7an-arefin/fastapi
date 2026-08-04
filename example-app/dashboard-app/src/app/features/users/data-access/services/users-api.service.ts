import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import type { Users } from '../models/users.model';
import type { NewUsers, UpdateUsers, UsersListResponse } from '../models/users-api.types';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/userses`;
  

  async list(cursor?: string, limit = 20): Promise<{ ok: true; data: UsersListResponse } | { ok: false; error: string }> {
    try {
      let params = new HttpParams().set('limit', limit);
      if (cursor) params = params.set('cursor', cursor);
      const data = await firstValueFrom(this.http.get<UsersListResponse>(this.baseUrl, { params }));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async getById(id: string): Promise<{ ok: true; data: Users } | { ok: false; error: string }> {
    try {
      const data = await firstValueFrom(this.http.get<Users>(`${this.baseUrl}/${id}`));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }


  async create(dto: NewUsers): Promise<{ ok: true; data: Users } | { ok: false; error: string }> {
    try {
      const data = await firstValueFrom(this.http.post<Users>(this.baseUrl, dto));
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }



}
