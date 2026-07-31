import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, gt, desc, asc } from 'drizzle-orm';
import type { TaskEntity, NewTask, UpdateTask, ITaskRepository, ListTaskParams, ListTaskResult } from './task.types.js';
import { taskTable } from './task.schema.js';
import { AppError } from '../../core/errors/application-error.js';

export class TaskRepository implements ITaskRepository {
  private readonly db: ReturnType<typeof drizzle>;

  /**
   * @author arefin
   * @description Initialize the class instance with required dependencies and configuration
   */
  constructor(hyperdrive: Hyperdrive) {
    this.db = drizzle(hyperdrive.connectionString, { logger: false });
  }

  /**
   * @author arefin
   * @description Find a single task entity by its unique identifier
   */
  async findById(id: string): Promise<TaskEntity | null> {
    const rows = await this.db
      .select()
      .from(taskTable)
      .where(
        and(
          eq(taskTable.id, id)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Retrieve a paginated list of task entities with optional filters
   */
  async findAll(params: ListTaskParams): Promise<ListTaskResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];

    if (params.status) {
      conditions.push(eq(taskTable.status, params.status as any));
    }

    if (params.userId) {
      conditions.push(eq(taskTable.userId, params.userId as any));
    }

    if (params.cursor) {
      conditions.push(gt(taskTable.id, params.cursor));
    }

    const rows = await this.db
      .select()
      .from(taskTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(taskTable.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? ((items[items.length - 1] as Record<string, unknown>)?.['id'] as string ?? null) : null;

    return { items, nextCursor: nextCursor as string | null, hasMore };
  }

  /**
   * @author arefin
   * @description Insert a new task entity into the database and return the created record
   */
  async create(data: NewTask): Promise<TaskEntity> {
    const rows = await this.db
      .insert(taskTable)
      .values(data as any)
      .returning();
    const row = rows[0];
    if (!row) throw new AppError('DB_INSERT_FAILED', `Failed to insert task`, 500);
    return row;
  }

  /**
   * @author arefin
   * @description Update an existing task entity and return the modified record
   */
  async update(data: UpdateTask): Promise<TaskEntity | null> {
    const { id, ...rest } = data;

    const updateData = { ...rest, updatedAt: new Date() };

    const rows = await this.db
      .update(taskTable)
      .set(updateData as any)
      .where(eq(taskTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Delete a task entity by its unique identifier and return whether the operation succeeded
   */
  async delete(id: string): Promise<boolean> {

    const rows = await this.db
      .delete(taskTable)
      .where(eq(taskTable.id, id))
      .returning();
    return rows.length > 0;

  }
}
