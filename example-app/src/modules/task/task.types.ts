// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task                                                   ║
// ╚══════════════════════════════════════════════════════════════════════╝
import type { TaskSelect, TaskInsert } from './task.schema.js';

/**
 * Full database record — all columns returned from the database.
 */
export type TaskEntity = TaskSelect;

/**
 * Insert payload — used for new record creation.
 */
export type NewTask = TaskInsert;

/**
 * Partial update payload — all fields optional except the primary key.
 */
export type UpdateTask = Partial<Omit<TaskEntity, 'id'>> & {
  id: string;
};

/**
 * Repository interface — implemented by TaskRepository.
 */
export interface ITaskRepository {
  findById(id: string): Promise<TaskEntity | null>;
  findAll(params: ListTaskParams): Promise<ListTaskResult>;
  create(data: NewTask): Promise<TaskEntity>;
  update(data: UpdateTask): Promise<TaskEntity | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * List query parameters.
 */
export interface ListTaskParams {
  cursor?: string;
  limit?: number;
  status?: string;
  userId?: string;

}

/**
 * List query result with cursor pagination.
 */
export interface ListTaskResult {
  items: TaskEntity[];
  nextCursor: string | null;
  hasMore: boolean;
}
