type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogRecord = Record<string, unknown>;

/**
 * @author arefin
 * @description Write a structured JSON log entry with timestamp, level, and service name to console output
 */
function log(level: LogLevel, data: LogRecord): void {
  const entry = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    service: 'TaskMaster API',
    ...data,
  });

  /**
   * @author arefin
   * @description Write a structured JSON log entry with timestamp, level, and service name to console output
   */
  switch (level) {
    case 'debug': console.debug(entry); break;
    case 'info': console.log(entry); break;
    case 'warn': console.warn(entry); break;
    case 'error': console.error(entry); break;
  }
}

export const logger = {
  debug: (data: LogRecord) => log('debug', data),
  info: (data: LogRecord) => log('info', data),
  warn: (data: LogRecord) => log('warn', data),
  error: (data: LogRecord) => log('error', data),
};
