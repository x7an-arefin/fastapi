import { Service } from 'honestjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, gt, desc, asc } from 'drizzle-orm';
import type { UserEntity, NewUser, UpdateUser, IUserRepository, ListUserParams, ListUserResult } from './user.types.js';
import { userTable } from './user.schema.js';
import { AppError } from '@core/errors/application-error.js';


@Service()
export class UserRepository implements IUserRepository {
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
   * @description Retrieve a paginated list of User entities with optional filters
   */
  async findAll(params: ListUserParams, hyperdrive?: Hyperdrive): Promise<ListUserResult> {
    const limit = Math.min(params.limit ?? 20, 100);
    const conditions = [];


    if (params.cursor) {
      conditions.push(gt(userTable.id, params.cursor));
    }

    const rows = await this.getDb(hyperdrive)
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
   * @description Insert a new User entity into the database and return the created record
   */
  async create(data: NewUser, hyperdrive?: Hyperdrive): Promise<UserEntity> {
    const rows = await this.getDb(hyperdrive)
      .insert(userTable)
      .values(data as any)
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

    const updateData = rest;

    const rows = await this.getDb(hyperdrive)
      .update(userTable)
      .set(updateData as any)
      .where(eq(userTable.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * @author arefin
   * @description Delete a User entity by its unique identifier
   */
  async delete(id: string, hyperdrive?: Hyperdrive): Promise<boolean> {

    const rows = await this.getDb(hyperdrive)
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();
    return rows.length > 0;

  }
}
