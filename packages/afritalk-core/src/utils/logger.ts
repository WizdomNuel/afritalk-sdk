/**
 * Structured Logger for AfriTalk Core.
 * Outputs JSON logs to stdout/stderr for easy parsing by monitoring tools (CloudWatch, Datadog, etc).
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const formatLog = (level: LogLevel, message: string, meta: Record<string, any> = {}): string => {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatLog('info', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (message: string, meta?: any) => {
    console.error(formatLog('error', message, meta));
  },
  debug: (message: string, meta?: any) => {
    if (process.env.DEBUG === 'true') {
      console.debug(formatLog('debug', message, meta));
    }
  }
};
