import type { Context } from 'hono';
import type { IFilter } from 'honestjs';
import { AppError } from '@core/errors/application-error.js';
import { logger } from '@core/observability/logger.js';

/**
 * @author arefin
 * @description Catch any thrown AppError or unhandled exception and format a structured JSON error response
 */
export class AppExceptionFilter implements IFilter {
  async catch(exception: Error, c: Context): Promise<Response | undefined> {
    if (exception instanceof AppError) {
      logger.error({ code: exception.code, message: exception.message });
      return c.json(
        { error: exception.code, message: exception.message },
        exception.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 500,
      );
    }
    logger.error({ error: String(exception), stack: exception.stack });
    return c.json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }, 500);
  }
}
