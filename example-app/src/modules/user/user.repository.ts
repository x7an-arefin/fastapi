import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, gt, desc, asc } from 'drizzle-orm';
import type { UserEntity, NewUser, UpdateUser, IUserRepository, ListUserParams, ListUserResult } from './user.types.js';
import { userTable } from './user.schema.js';
import { AppError } from '../../core/errors/application-error.js';

export class UserRepository implements IUserRepository {
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
   * @description Find a single user entity by its unique identifier
   */
  async findById(id: string): Promise<UserEntity | null> {
    const rows = await this.db
      .select()
      .from(userTable)
      .where(
        and(
          eq(userTable.id, id)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Retrieve a paginated list of user entities with optional filters
   */
  async findAll(params: ListUserParams): Promise<ListUserResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];

    if (params.cursor) {
      conditions.push(gt(userTable.id, params.cursor));
    }

    const rows = await this.db
      .select()
      .from(userTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userTable.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? ((items[items.length - 1] as Record<string, unknown>)?.['id'] as string ?? null) : null;

    return { items, nextCursor: nextCursor as string | null, hasMore };
  }

  /**
   * @author arefin
   * @description Insert a new user entity into the database and return the created record
   */
  async create(data: NewUser): Promise<UserEntity> {
    const rows = await this.db
      .insert(userTable)
      .values(data as any)
      .returning();
    const row = rows[0];
    if (!row) throw new AppError('DB_INSERT_FAILED', `Failed to insert user`, 500);
    return row;
  }

  /**
   * @author arefin
   * @description Update an existing user entity and return the modified record
   */
  async update(data: UpdateUser): Promise<UserEntity | null> {
    const { id, ...rest } = data;

    const updateData = rest;

    const rows = await this.db
      .update(userTable)
      .set(updateData as any)
      .where(eq(userTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Delete a user entity by its unique identifier and return whether the operation succeeded
   */
  async delete(id: string): Promise<boolean> {

    const rows = await this.db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();
    return rows.length > 0;

  }
}
