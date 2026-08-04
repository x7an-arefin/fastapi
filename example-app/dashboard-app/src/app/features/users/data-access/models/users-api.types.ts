/**
 * @author arefin
 * @description API DTO types for Users — used for HTTP requests
 */

export interface NewUsers {




  email: string;

  name: string;

  role: string;


}

export interface UpdateUsers extends Partial<NewUsers> {}

export interface UsersListResponse {
  items: import('./users.model').Users[];
  nextCursor?: string | null;
  hasMore?: boolean;
}
