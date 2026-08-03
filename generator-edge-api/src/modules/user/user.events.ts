export const USER_EVENTS = {

  CREATE_PRE: 'taskmaster-api.user.create.pre.v1',
  CREATE_PROCESS: 'taskmaster-api.user.create.process.v1',
  CREATE_POST: 'taskmaster-api.user.create.post.v1',
  CREATED: 'taskmaster-api.user.created.v1',


  GET_PRE: 'taskmaster-api.user.get.pre.v1',
  GET_PROCESS: 'taskmaster-api.user.get.process.v1',
  GET_POST: 'taskmaster-api.user.get.post.v1',
  GETD: 'taskmaster-api.user.retrieved.v1',


  LIST_PRE: 'taskmaster-api.user.list.pre.v1',
  LIST_PROCESS: 'taskmaster-api.user.list.process.v1',
  LIST_POST: 'taskmaster-api.user.list.post.v1',
  LISTD: 'taskmaster-api.user.listed.v1',

} as const;

export type UserEventName = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
