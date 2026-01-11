import { getClient } from './instances.js';
import { AfriSpeakRequest, AfriSpeakResponse } from './types.js';

/**
 * Converts text to spoken audio (TTS).
 * @param params AfriSpeakRequest
 * @returns AfriSpeakResponse containing the audio buffer
 */
export const afriSpeak = async (params: AfriSpeakRequest): Promise<AfriSpeakResponse> => {
  return getClient().speak(params);
};