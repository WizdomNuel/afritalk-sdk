import { AfriTalkError } from '../types.js';
import { logger } from './logger.js';

interface RetryConfig {
  maxRetries: number;
  baseDelay?: number;
}

/**
 * Executes a function with exponential backoff retries for transient errors.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> => {
  let attempt = 0;
  const { maxRetries, baseDelay = 1000 } = config;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt >= maxRetries) {
        throw error;
      }

      // Determine if error is retryable
      const status = error?.status || error?.statusCode;
      const code = error?.code;
      
      // Retry on 429 (Rate Limit), 5xx (Server Error), or Network Errors (ECONNRESET, ETIMEDOUT)
      const isRetryable = 
        status === 429 || 
        (status >= 500 && status < 600) || 
        code === 'ECONNRESET' || 
        code === 'ETIMEDOUT' ||
        (error instanceof AfriTalkError && (error.statusCode === 429 || error.statusCode >= 500));

      // Specific check for AbortError - never retry cancelled requests
      if (error.name === 'AbortError' || code === 'ABORT_ERR') {
        throw error;
      }

      if (!isRetryable) {
        throw error;
      }

      attempt++;
      
      // Exponential backoff: 1s, 2s, 4s... with jitter
      const jitter = Math.random() * 200;
      const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
      
      logger.warn(`Transient error encountered. Retrying request (Attempt ${attempt}/${maxRetries}) after ${Math.round(delay)}ms`, { 
        error: error.message,
        code: code || status
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
