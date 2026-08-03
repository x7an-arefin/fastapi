export interface ClientOptions {
  baseUrl?: string;
  token?: string;
  fetch?: typeof fetch;
}

/**
 * @author arefin
 * @description Zero-dependency type-safe API Client for TaskMaster API
 */
export class TaskMasterAPIClient {
  private baseUrl: string;
  private token?: string;
  private customFetch: typeof fetch;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'http://localhost:8787').replace(/\/$/, '');
    this.token = options.token;
    this.customFetch = options.fetch ?? globalThis.fetch;
  }

  /**
   * @author arefin
   * @description Make an authenticated HTTP request to the API
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await this.customFetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return (await response.json()) as T;
  }


  /**
   * @author arefin
   * @description API operations for User entity
   */
  public user = {
    list: async (params?: Record<string, string>): Promise<unknown> => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/api/v1/users${query}`, { method: 'GET' });
    },
    get: async (id: string): Promise<unknown> => {
      return this.request(`/api/v1/users/${id}`, { method: 'GET' });
    },
    create: async (data: unknown): Promise<unknown> => {
      return this.request(`/api/v1/users`, { method: 'POST', body: JSON.stringify(data) });
    },
    update: async (id: string, data: unknown): Promise<unknown> => {
      return this.request(`/api/v1/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete: async (id: string): Promise<unknown> => {
      return this.request(`/api/v1/users/${id}`, { method: 'DELETE' });
    },
  };

  /**
   * @author arefin
   * @description API operations for Task entity
   */
  public task = {
    list: async (params?: Record<string, string>): Promise<unknown> => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/api/v1/tasks${query}`, { method: 'GET' });
    },
    get: async (id: string): Promise<unknown> => {
      return this.request(`/api/v1/tasks/${id}`, { method: 'GET' });
    },
    create: async (data: unknown): Promise<unknown> => {
      return this.request(`/api/v1/tasks`, { method: 'POST', body: JSON.stringify(data) });
    },
    update: async (id: string, data: unknown): Promise<unknown> => {
      return this.request(`/api/v1/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete: async (id: string): Promise<unknown> => {
      return this.request(`/api/v1/tasks/${id}`, { method: 'DELETE' });
    },
  };

}
