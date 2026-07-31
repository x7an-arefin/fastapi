// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { Hono } from 'hono';
import type { Env } from '../generated/bindings.js';

import { createUserRoute } from '../modules/user/create/create-user.route.js';
import { getUserRoute } from '../modules/user/get/get-user.route.js';
import { listUserRoute } from '../modules/user/list/list-user.route.js';
import { createTaskRoute } from '../modules/task/create/create-task.route.js';
import { getTaskRoute } from '../modules/task/get/get-task.route.js';
import { listTaskRoute } from '../modules/task/list/list-task.route.js';
import { updateTaskRoute } from '../modules/task/update/update-task.route.js';
import { deleteTaskRoute } from '../modules/task/delete/delete-task.route.js';

import { uploadUrlRoute, completeUploadRoute } from '../modules/media/media.routes.js';

import { stripeWebhookHandler } from '../webhooks/stripe/handler.js';

export function registerRoutes(app: Hono<{ Bindings: Env }>): void {
  // User routes
  app.post('/api/v1/users', createUserRoute);
  app.get('/api/v1/users/:id', getUserRoute);
  app.get('/api/v1/users', listUserRoute);

  // Task routes
  app.post('/api/v1/tasks', createTaskRoute);
  app.get('/api/v1/tasks/:id', getTaskRoute);
  app.get('/api/v1/tasks', listTaskRoute);
  app.patch('/api/v1/tasks/:id', updateTaskRoute);
  app.delete('/api/v1/tasks/:id', deleteTaskRoute);


  // Media routes
  app.post('/api/v1/media/upload-url', uploadUrlRoute);
  app.post('/api/v1/media/complete', completeUploadRoute);

  // Webhook routes
  app.post('/webhooks/stripe', stripeWebhookHandler);

}
