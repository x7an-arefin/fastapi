import type { Tasks } from '../models/tasks.model';

/**
 * @author arefin
 * @description Maps raw API DTOs to domain models for Tasks
 */
export function mapToTasks(raw: Record<string, unknown>): Tasks {
  return raw as Tasks;
}

export function mapToTasksList(raws: Record<string, unknown>[]): Tasks[] {
  return raws.map(mapToTasks);
}
