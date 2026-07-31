import type { TaskSelect, TaskInsert } from './task.schema.js';

export type TaskEntity = TaskSelect;

export type NewTask = TaskInsert;

export type UpdateTask = Partial<Omit<TaskEntity, 'id'>> & {
  id: string;
};

export interface ITaskRepository {
  findById(id: string): Promise<TaskEntity | null>;
  findAll(params: ListTaskParams): Promise<ListTaskResult>;
  create(data: NewTask): Promise<TaskEntity>;
  update(data: UpdateTask): Promise<TaskEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface ListTaskParams {
  cursor?: string;
  limit?: number;
  status?: string;
  userId?: string;

}

export interface ListTaskResult {
  items: TaskEntity[];
  nextCursor: string | null;
  hasMore: boolean;
}
