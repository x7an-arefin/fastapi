import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Ctx, UseGuards } from 'honestjs';
import { z } from 'zod';
import type { Context } from 'hono';
import { UserService } from './user.service.js';
import { AuthGuard } from '@core/guards/auth.guard.js';
import { Public } from '@core/decorators/public.decorator.js';

import { CreateUserInputSchema } from './create/create-user.input.js';

import { GetUserInputSchema } from './get/get-user.input.js';

import { ListUserInputSchema } from './list/list-user.input.js';


/**
 * @author arefin
 * @description HTTP controller that maps User CRUD endpoints and delegates execution to UserService
 */
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}



  /**
   * @author arefin
   * @description Handle POST /api/v1/users — validate input and delegate to create lifecycle
   */
  @Post('')
  async create(
    @Body() body: unknown,
    @Ctx() c: Context,
  ): Promise<Response> {
    const inputResult = CreateUserInputSchema.safeParse(body);
    if (!inputResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', details: inputResult.error.flatten().fieldErrors }, 422);
    }
    return this.service.create(inputResult.data, c);
  }




  /**
   * @author arefin
   * @description Handle GET /api/v1/users/:id — validate input and delegate to get lifecycle
   */
  @Get('/:id')
  async get(
    @Param('id') id: string,
    @Ctx() c: Context,
  ): Promise<Response> {
    const uuidResult = z.string().uuid().safeParse(id);
    if (!uuidResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', message: 'Invalid ID format — expected a UUID' }, 400);
    }
    return this.service.get({ id }, c);
  }




  /**
   * @author arefin
   * @description Handle GET /api/v1/users — validate input and delegate to list lifecycle
   */
  @Get('')
  async list(
    @Query() query: Record<string, string>,
    @Ctx() c: Context,
  ): Promise<Response> {
    const inputResult = ListUserInputSchema.safeParse(query);
    if (!inputResult.success) {
      return c.json({ error: 'VALIDATION_ERROR', details: inputResult.error.flatten().fieldErrors }, 422);
    }
    return this.service.list(inputResult.data, c);
  }


}
