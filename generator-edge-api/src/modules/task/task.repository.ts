import { Service } from 'honestjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, lt, desc, isNull } from 'drizzle-orm';
import type { TaskEntity, NewTask, UpdateTask, ITaskRepository, ListTaskParams, ListTaskResult } from './task.types.js';
import { taskTable } from './task.schema.js';
import { AppError } from '@core/errors/application-error.js';

@Service()
export class TaskRepository implements ITaskRepository {

  /**
   * @author arefin
   * @description Get a Drizzle database client from the Cloudflare Hyperdrive connection
   */
  private getDb(hyperdrive?: Hyperdrive): ReturnType<typeof drizzle> {
    if (!hyperdrive?.connectionString) {
      throw new AppError('MISSING_BINDING', 'Hyperdrive binding is required. Ensure HYPERDRIVE is configured in wrangler.jsonc.', 500);
    }
    return drizzle(hyperdrive.connectionString, { logger: false });
  }

  /**
   * @author arefin
   * @description Find a single Task entity by its unique identifier
   */
  async findById(id: string, hyperdrive?: Hyperdrive): Promise<TaskEntity | null> {
    const rows = await this.getDb(hyperdrive)
      .select()
      .from(taskTable)
      .where(
        and(
          eq(taskTable.id, id),
          isNull(taskTable.deletedAt)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Retrieve a paginated list of Task entities with cursor-based pagination on createdAt
   */
  async findAll(params: ListTaskParams, hyperdrive?: Hyperdrive): Promise<ListTaskResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];


    conditions.push(isNull(taskTable.deletedAt));

    if (params.cursor) {
      conditions.push(lt(taskTable.createdAt, new Date(params.cursor)));
    }

    const rows = await this.getDb(hyperdrive)
      .select()
      .from(taskTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(taskTable.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items[items.length - 1] as Record<string, unknown> | undefined;
    const nextCursor = hasMore && lastItem?.['createdAt'] instanceof Date
      ? (lastItem['createdAt'] as Date).toISOString()
      : null;

    return { items, nextCursor, hasMore };
  }

  /**
   * @author arefin
   * @description Insert a new Task entity into the database and return the created record
   */
  async create(data: NewTask, hyperdrive?: Hyperdrive): Promise<TaskEntity> {
    const rows = await this.getDb(hyperdrive)
      .insert(taskTable)
      .values(data as never)
      .returning();
    const row = rows[0];
    if (!row) throw new AppError('DB_INSERT_FAILED', `Failed to insert Task`, 500);
    return row;
  }

  /**
   * @author arefin
   * @description Update an existing Task entity and return the modified record
   */
  async update(data: UpdateTask, hyperdrive?: Hyperdrive): Promise<TaskEntity | null> {
    const { id, ...rest } = data;
    const updateData = { ...rest, updatedAt: new Date() };
    const rows = await this.getDb(hyperdrive)
      .update(taskTable)
      .set(updateData as never)
      .where(eq(taskTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Soft-delete a Task entity by setting deletedAt timestamp
   */
  async delete(id: string, hyperdrive?: Hyperdrive): Promise<boolean> {

    const rows = await this.getDb(hyperdrive)
      .update(taskTable)
      .set({ deletedAt: new Date() } as never)
      .where(and(eq(taskTable.id, id), isNull(taskTable.deletedAt)))
      .returning();

    return rows.length > 0;
  }
}
