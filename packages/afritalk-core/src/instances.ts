import { AfriTalkClient } from './client.js';

let instance: AfriTalkClient | null = null;

// Lazy singleton accessor to ensure process.env is ready when called.
export const getClient = (): AfriTalkClient => {
  if (!instance) {
    instance = new AfriTalkClient();
  }
  return instance;
};