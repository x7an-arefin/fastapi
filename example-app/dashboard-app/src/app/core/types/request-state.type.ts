export type RequestState<T = void> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data?: T }
  | { status: 'error'; error: string };
