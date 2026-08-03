export const TASK_EVENTS = {

  CREATE_PRE: 'taskmaster-api.task.create.pre.v1',
  CREATE_PROCESS: 'taskmaster-api.task.create.process.v1',
  CREATE_POST: 'taskmaster-api.task.create.post.v1',
  CREATED: 'taskmaster-api.task.created.v1',


  GET_PRE: 'taskmaster-api.task.get.pre.v1',
  GET_PROCESS: 'taskmaster-api.task.get.process.v1',
  GET_POST: 'taskmaster-api.task.get.post.v1',
  GETD: 'taskmaster-api.task.retrieved.v1',


  LIST_PRE: 'taskmaster-api.task.list.pre.v1',
  LIST_PROCESS: 'taskmaster-api.task.list.process.v1',
  LIST_POST: 'taskmaster-api.task.list.post.v1',
  LISTD: 'taskmaster-api.task.listed.v1',


  UPDATE_PRE: 'taskmaster-api.task.update.pre.v1',
  UPDATE_PROCESS: 'taskmaster-api.task.update.process.v1',
  UPDATE_POST: 'taskmaster-api.task.update.post.v1',
  UPDATED: 'taskmaster-api.task.updated.v1',


  DELETE_PRE: 'taskmaster-api.task.delete.pre.v1',
  DELETE_PROCESS: 'taskmaster-api.task.delete.process.v1',
  DELETE_POST: 'taskmaster-api.task.delete.post.v1',
  DELETED: 'taskmaster-api.task.deleted.v1',

} as const;

export type TaskEventName = (typeof TASK_EVENTS)[keyof typeof TASK_EVENTS];
