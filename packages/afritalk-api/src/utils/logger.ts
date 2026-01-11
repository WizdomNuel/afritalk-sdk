type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatLog = (level: LogLevel, message: string, meta: Record<string, any> = {}) => {
  const entry = { level, message, timestamp: new Date().toISOString(), ...meta };
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, meta?: any) => console.log(formatLog('info', message, meta)),
  warn: (message: string, meta?: any) => console.warn(formatLog('warn', message, meta)),
  error: (message: string, meta?: any) => console.error(formatLog('error', message, meta)),
  debug: (message: string, meta?: any) => { if (process.env.DEBUG === 'true') console.debug(formatLog('debug', message, meta)); }
};
