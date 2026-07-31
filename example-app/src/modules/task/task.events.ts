// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task — Event Name Constants                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

/**
 * All event names for the Task entity.
 * Format: {domain}.{entity}.{operation}.{stage}.v{version}
 */
export const TASK_EVENTS = {
  // CREATE lifecycle events
  CREATE_PRE: 'tasks.task.create.pre.v1',
  CREATE_PROCESS: 'tasks.task.create.process.v1',
  CREATE_POST: 'tasks.task.create.post.v1',
  // Domain fact event (past tense)
  CREATED: 'tasks.task.created.v1',

  // GET lifecycle events
  GET_PRE: 'tasks.task.get.pre.v1',
  GET_PROCESS: 'tasks.task.get.process.v1',
  GET_POST: 'tasks.task.get.post.v1',
  // Domain fact event (past tense)
  GETD: 'tasks.task.retrieved.v1',

  // LIST lifecycle events
  LIST_PRE: 'tasks.task.list.pre.v1',
  LIST_PROCESS: 'tasks.task.list.process.v1',
  LIST_POST: 'tasks.task.list.post.v1',
  // Domain fact event (past tense)
  LISTD: 'tasks.task.listed.v1',

  // UPDATE lifecycle events
  UPDATE_PRE: 'tasks.task.update.pre.v1',
  UPDATE_PROCESS: 'tasks.task.update.process.v1',
  UPDATE_POST: 'tasks.task.update.post.v1',
  // Domain fact event (past tense)
  UPDATED: 'tasks.task.updated.v1',

  // DELETE lifecycle events
  DELETE_PRE: 'tasks.task.delete.pre.v1',
  DELETE_PROCESS: 'tasks.task.delete.process.v1',
  DELETE_POST: 'tasks.task.delete.post.v1',
  // Domain fact event (past tense)
  DELETED: 'tasks.task.deleted.v1',

} as const;

export type TaskEventName = (typeof TASK_EVENTS)[keyof typeof TASK_EVENTS];
