// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: User                                                   ║
// ╚══════════════════════════════════════════════════════════════════════╝
import type { UserSelect, UserInsert } from './user.schema.js';

/**
 * Full database record — all columns returned from the database.
 */
export type UserEntity = UserSelect;

/**
 * Insert payload — used for new record creation.
 */
export type NewUser = UserInsert;

/**
 * Partial update payload — all fields optional except the primary key.
 */
export type UpdateUser = Partial<Omit<UserEntity, 'id'>> & {
  id: string;
};

/**
 * Repository interface — implemented by UserRepository.
 */
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findAll(params: ListUserParams): Promise<ListUserResult>;
  create(data: NewUser): Promise<UserEntity>;
  update(data: UpdateUser): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * List query parameters.
 */
export interface ListUserParams {
  cursor?: string;
  limit?: number;

}

/**
 * List query result with cursor pagination.
 */
export interface ListUserResult {
  items: UserEntity[];
  nextCursor: string | null;
  hasMore: boolean;
}
