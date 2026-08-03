import { Service } from 'honestjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, gt, desc, asc } from 'drizzle-orm';
import type { TaskEntity, NewTask, UpdateTask, ITaskRepository, ListTaskParams, ListTaskResult } from './task.types.js';
import { taskTable } from './task.schema.js';
import { AppError } from '@core/errors/application-error.js';


@Service()
export class TaskRepository implements ITaskRepository {
  private readonly defaultDb: ReturnType<typeof drizzle>;

  /**
   * @author arefin
   * @description Initialize the repository
   */
  constructor() {
    this.defaultDb = drizzle('postgresql://placeholder:placeholder@localhost:5432/placeholder', { logger: false });
  }

  /**
   * @author arefin
   * @description Get Drizzle database instance, using Hyperdrive connection when available
   */
  private getDb(hyperdrive?: Hyperdrive): ReturnType<typeof drizzle> {
    if (hyperdrive?.connectionString) {
      return drizzle(hyperdrive.connectionString, { logger: false });
    }
    return this.defaultDb;
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
          eq(taskTable.id, id)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Retrieve a paginated list of Task entities with optional filters
   */
  async findAll(params: ListTaskParams, hyperdrive?: Hyperdrive): Promise<ListTaskResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];


    if (params.cursor) {
      conditions.push(gt(taskTable.id, params.cursor));
    }

    const rows = await this.getDb(hyperdrive)
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
   * @description Insert a new Task entity into the database and return the created record
   */
  async create(data: NewTask, hyperdrive?: Hyperdrive): Promise<TaskEntity> {
    const rows = await this.getDb(hyperdrive)
      .insert(taskTable)
      .values(data as any)
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
      .set(updateData as any)
      .where(eq(taskTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Delete a Task entity by its unique identifier
   */
  async delete(id: string, hyperdrive?: Hyperdrive): Promise<boolean> {

    const rows = await this.getDb(hyperdrive)
      .delete(taskTable)
      .where(eq(taskTable.id, id))
      .returning();
    return rows.length > 0;

  }
}
