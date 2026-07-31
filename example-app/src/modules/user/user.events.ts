export const USER_EVENTS = {

  CREATE_PRE: 'tasks.user.create.pre.v1',
  CREATE_PROCESS: 'tasks.user.create.process.v1',
  CREATE_POST: 'tasks.user.create.post.v1',

  CREATED: 'tasks.user.created.v1',

  GET_PRE: 'tasks.user.get.pre.v1',
  GET_PROCESS: 'tasks.user.get.process.v1',
  GET_POST: 'tasks.user.get.post.v1',

  GETD: 'tasks.user.retrieved.v1',

  LIST_PRE: 'tasks.user.list.pre.v1',
  LIST_PROCESS: 'tasks.user.list.process.v1',
  LIST_POST: 'tasks.user.list.post.v1',

  LISTD: 'tasks.user.listed.v1',

} as const;

export type UserEventName = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
