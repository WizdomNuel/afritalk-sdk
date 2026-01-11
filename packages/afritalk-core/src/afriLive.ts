import { getClient } from './instances.js';
import { AfriLiveConfig } from './types.js';

/**
 * Establish a real-time voice session.
 * NOTE: This returns a Promise that resolves to the LiveSession object.
 * You must interact with the session directly (sendRealtimeInput) in your application logic.
 */
export const afriLive = async (config: AfriLiveConfig): Promise<any> => {
  return getClient().live(config);
};