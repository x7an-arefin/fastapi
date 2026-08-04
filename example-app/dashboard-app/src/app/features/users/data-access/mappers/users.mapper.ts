import type { Users } from '../models/users.model';

/**
 * @author arefin
 * @description Maps raw API DTOs to domain models for Users
 */
export function mapToUsers(raw: Record<string, unknown>): Users {
  return raw as Users;
}

export function mapToUsersList(raws: Record<string, unknown>[]): Users[] {
  return raws.map(mapToUsers);
}
