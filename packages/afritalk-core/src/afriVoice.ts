import { getClient } from './instances.js';
import { AfriVoiceRequest, AfriVoiceResponse, AfriVoiceStreamChunk } from './types.js';

/**
 * Transcribes audio input to text.
 * @param params AfriVoiceRequest containing the audio file/blob
 * @returns AfriVoiceResponse with transcribed text
 */
export const afriVoice = async (params: AfriVoiceRequest): Promise<AfriVoiceResponse> => {
  return getClient().voice(params);
};

/**
 * Streaming audio transcription (simulated using segments).
 * @param params AfriVoiceRequest
 * @returns AsyncIterable<AfriVoiceStreamChunk>
 */
export const afriVoiceStream = (params: AfriVoiceRequest): AsyncIterable<AfriVoiceStreamChunk> => {
  return getClient().voiceStream(params);
};