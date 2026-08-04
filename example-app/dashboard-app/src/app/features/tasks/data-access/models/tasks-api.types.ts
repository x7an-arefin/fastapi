/**
 * @author arefin
 * @description API DTO types for Tasks — used for HTTP requests
 */

export interface NewTasks {




  title: string;

  description?: string;

  status: string;

  priority: string;

  userId: string;


}

export interface UpdateTasks extends Partial<NewTasks> {}

export interface TasksListResponse {
  items: import('./tasks.model').Tasks[];
  nextCursor?: string | null;
  hasMore?: boolean;
}
