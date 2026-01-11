import { getClient } from './instances.js';
import { AfriVideoAnalysisRequest, AfriVideoAnalysisResponse } from './types.js';

/**
 * Analyze a video file to get a cultural description or transcription.
 * @param params AfriVideoAnalysisRequest
 */
export const afriVideo = async (params: AfriVideoAnalysisRequest): Promise<AfriVideoAnalysisResponse> => {
  return getClient().video(params);
};
