import type { UserSelect, UserInsert } from './user.schema.js';

export type UserEntity = UserSelect;

export type NewUser = UserInsert;

export type UpdateUser = Partial<Omit<UserEntity, 'id'>> & {
  id: string;
};

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findAll(params: ListUserParams): Promise<ListUserResult>;
  create(data: NewUser): Promise<UserEntity>;
  update(data: UpdateUser): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface ListUserParams {
  cursor?: string;
  limit?: number;

}

export interface ListUserResult {
  items: UserEntity[];
  nextCursor: string | null;
  hasMore: boolean;
}
