import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Ctx, UseGuards } from 'honestjs';
import type { Context } from 'hono';
import { TaskService } from './task.service.js';
import { AuthGuard } from '@core/guards/auth.guard.js';

import { CreateTaskInputSchema } from './create/create-task.input.js';
import { GetTaskInputSchema } from './get/get-task.input.js';
import { ListTaskInputSchema } from './list/list-task.input.js';
import { UpdateTaskInputSchema } from './update/update-task.input.js';
import { DeleteTaskInputSchema } from './delete/delete-task.input.js';


/**
 * @author arefin
 * @description HTTP controller that maps Task CRUD endpoints and delegates execution to TaskService
 */
@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  /**
   * @author arefin
   * @description Handle POST /api/v1/tasks — validate input and delegate to create lifecycle
   */
  @Post('')
  async create(
    @Body() body: unknown,
    @Ctx() c: Context,
  ): Promise<Response> {
    const inputResult = CreateTaskInputSchema.safeParse(body);
    if (!inputResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', details: inputResult.error.flatten().fieldErrors }, 422);
    }
    return this.service.create(inputResult.data, c);
    }

  /**
   * @author arefin
   * @description Handle GET /api/v1/tasks/:id — validate input and delegate to get lifecycle
   */
  @Get('/:id')
  async get(
    @Param('id') id: string,
    @Ctx() c: Context,
  ): Promise<Response> {
    return this.service.get({ id }, c);
    }

  /**
   * @author arefin
   * @description Handle GET /api/v1/tasks — validate input and delegate to list lifecycle
   */
  @Get('')
  async list(
    @Query() query: Record<string, string>,
    @Ctx() c: Context,
  ): Promise<Response> {
    const inputResult = ListTaskInputSchema.safeParse(query);
    if (!inputResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', details: inputResult.error.flatten().fieldErrors }, 422);
    }
    return this.service.list(inputResult.data, c);
    }

  /**
   * @author arefin
   * @description Handle PATCH /api/v1/tasks/:id — validate input and delegate to update lifecycle
   */
  @Patch('/:id')
  async update(
    @Body() body: unknown,
    @Param('id') id: string,
    @Ctx() c: Context,
  ): Promise<Response> {
    const inputResult = UpdateTaskInputSchema.safeParse(body);
    if (!inputResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', details: inputResult.error.flatten().fieldErrors }, 422);
    }
    return this.service.update(inputResult.data, c);
    }

  /**
   * @author arefin
   * @description Handle DELETE /api/v1/tasks/:id — validate input and delegate to delete lifecycle
   */
  @Delete('/:id')
  async delete(
    @Param('id') id: string,
    @Ctx() c: Context,
  ): Promise<Response> {
    return this.service.delete({ id }, c);
    }
}
