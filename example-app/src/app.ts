import 'reflect-metadata';
import { Application } from 'honestjs';
import { AppModule } from './app.module.js';
import { CorrelationMiddleware } from '@core/middleware/correlation.middleware.js';
import { AppExceptionFilter } from '@core/filters/app-exception.filter.js';

import { CloudflareEnvironmentPlugin } from '@core/plugins/cloudflare-environment.plugin.js';
import { HealthAndMetricsPlugin } from '@core/plugins/health-metrics.plugin.js';
import { OpenApiDocsPlugin } from '@core/plugins/openapi-docs.plugin.js';
import { PaymentGatewayPlugin } from '@core/plugins/payment-gateway.plugin.js';
import { MultiTenancyPlugin } from '@core/plugins/multi-tenancy.plugin.js';
import { EdgeCachePlugin } from '@core/plugins/edge-cache.plugin.js';
import { CircuitBreakerPlugin } from '@core/plugins/circuit-breaker.plugin.js';
import { FeatureFlagPlugin } from '@core/plugins/feature-flag.plugin.js';
import { AuditLedgerPlugin } from '@core/plugins/audit-ledger.plugin.js';
import { BetterAuthPlugin } from '@core/plugins/auth.plugin.js';

/**
 * @author arefin
 * @description Bootstrap the HonestJS application with global middleware, exception filter, plugins, and routing configuration
 */
async function bootstrap() {
  const { hono } = await Application.create(AppModule, {
    routing: {
      prefix: 'api',
      version: 1,
    },
    plugins: [
      new CloudflareEnvironmentPlugin(),
      new HealthAndMetricsPlugin(),
      new OpenApiDocsPlugin(),
      new PaymentGatewayPlugin(),
      new MultiTenancyPlugin(),
      new EdgeCachePlugin(),
      new CircuitBreakerPlugin(),
      new FeatureFlagPlugin(),
      new AuditLedgerPlugin(),
      new BetterAuthPlugin(),
    ],
    components: {
      middleware: [new CorrelationMiddleware()],
      filters: [new AppExceptionFilter()],
    },
    notFound: (c) =>
      c.json(
        {
          error: 'NOT_FOUND',
          message: `Route ${c.req.method} ${c.req.path} not found`,
        },
        404,
      ),
  });
  return hono;
}

export const hono = await bootstrap();
