export const TASK_EVENTS = {

  CREATE_PRE: 'tasks.task.create.pre.v1',
  CREATE_PROCESS: 'tasks.task.create.process.v1',
  CREATE_POST: 'tasks.task.create.post.v1',

  CREATED: 'tasks.task.created.v1',

  GET_PRE: 'tasks.task.get.pre.v1',
  GET_PROCESS: 'tasks.task.get.process.v1',
  GET_POST: 'tasks.task.get.post.v1',

  GETD: 'tasks.task.retrieved.v1',

  LIST_PRE: 'tasks.task.list.pre.v1',
  LIST_PROCESS: 'tasks.task.list.process.v1',
  LIST_POST: 'tasks.task.list.post.v1',

  LISTD: 'tasks.task.listed.v1',

  UPDATE_PRE: 'tasks.task.update.pre.v1',
  UPDATE_PROCESS: 'tasks.task.update.process.v1',
  UPDATE_POST: 'tasks.task.update.post.v1',

  UPDATED: 'tasks.task.updated.v1',

  DELETE_PRE: 'tasks.task.delete.pre.v1',
  DELETE_PROCESS: 'tasks.task.delete.process.v1',
  DELETE_POST: 'tasks.task.delete.post.v1',

  DELETED: 'tasks.task.deleted.v1',

} as const;

export type TaskEventName = (typeof TASK_EVENTS)[keyof typeof TASK_EVENTS];
