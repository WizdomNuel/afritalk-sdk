import { getClient } from './instances.js';
import { AfriChatRequest, AfriChatResponse, AfriChatStreamChunk } from './types.js';

/**
 * Standard Chat Generation (Wrapper for AfriTalkClient).
 * 
 * @param params configuration parameters
 * @returns Promise<AfriChatResponse>
 */
export const afriChat = (params: AfriChatRequest): Promise<AfriChatResponse> => {
  return getClient().chat.create(params);
};

/**
 * Streaming Chat Generation.
 * 
 * @param params configuration parameters
 * @returns AsyncIterable<AfriChatStreamChunk>
 */
export const afriChatStream = (params: AfriChatRequest): AsyncIterable<AfriChatStreamChunk> => {
  return getClient().chat.stream(params);
};