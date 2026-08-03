import { Service } from 'honestjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, lt, desc, isNull, isNotNull } from 'drizzle-orm';
import type { UserEntity, NewUser, UpdateUser, IUserRepository, ListUserParams, ListUserResult } from './user.types.js';
import { userTable } from './user.schema.js';
import { AppError } from '@core/errors/application-error.js';

@Service()
export class UserRepository implements IUserRepository {

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
   * @description Find a single User entity by its unique identifier
   */
  async findById(id: string, hyperdrive?: Hyperdrive): Promise<UserEntity | null> {
    const rows = await this.getDb(hyperdrive)
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
   * @description Retrieve a paginated list of User entities with cursor-based pagination on createdAt
   */
  async findAll(params: ListUserParams, hyperdrive?: Hyperdrive): Promise<ListUserResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];


    if (params.cursor) {
      conditions.push(lt(userTable.createdAt, new Date(params.cursor)));
    }

    const rows = await this.getDb(hyperdrive)
      .select()
      .from(userTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userTable.createdAt))
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
   * @description Insert a new User entity into the database and return the created record
   */
  async create(data: NewUser, hyperdrive?: Hyperdrive): Promise<UserEntity> {
    const rows = await this.getDb(hyperdrive)
      .insert(userTable)
      .values(data as never)
      .returning();
    const row = rows[0];
    if (!row) throw new AppError('DB_INSERT_FAILED', `Failed to insert User`, 500);
    return row;
  }

  /**
   * @author arefin
   * @description Update an existing User entity and return the modified record
   */
  async update(data: UpdateUser, hyperdrive?: Hyperdrive): Promise<UserEntity | null> {
    const { id, ...rest } = data;
    const updateData = { ...rest, updatedAt: new Date() };
    const rows = await this.getDb(hyperdrive)
      .update(userTable)
      .set(updateData as never)
      .where(eq(userTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Hard-delete a User entity by its unique identifier
   */
  async delete(id: string, hyperdrive?: Hyperdrive): Promise<boolean> {

    const rows = await this.getDb(hyperdrive)
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();

    return rows.length > 0;
  }
}
