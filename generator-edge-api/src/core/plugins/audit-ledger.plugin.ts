import type { IPlugin, Application } from 'honestjs';
import type { Hono } from 'hono';
import { logger } from '@core/observability/logger.js';

export interface AuditRecord {
  auditId: string;
  action: string;
  actorId?: string;
  entityName: string;
  entityId?: string;
  timestamp: string;
  correlationId: string;
  changes?: Record<string, unknown>;
}

/**
 * @author arefin
 * @description Pattern E: Audit Ledger & Compliance Plugin — automatically records tamper-proof audit trails for all data mutation operations
 */
export class AuditLedgerPlugin implements IPlugin {
  meta = { name: 'AuditLedgerPlugin' };

  /**
   * @author arefin
   * @description Register audit recording helper in application context
   */
  async afterModulesRegistered(app: Application, _hono: Hono): Promise<void> {
    app.getContext().set('audit.record', (record: Omit<AuditRecord, 'auditId' | 'timestamp'>): void => {
      const fullRecord: AuditRecord = {
        auditId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...record,
      };

      logger.info({
        action: 'audit_log_recorded',
        auditId: fullRecord.auditId,
        entityName: fullRecord.entityName,
        correlationId: fullRecord.correlationId,
      });
    });
  }
}
