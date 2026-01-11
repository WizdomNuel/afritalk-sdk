import { getClient } from './instances.js';
import { AfriTranslateRequest, AfriTranslateResponse } from './types.js';

/**
 * Performs strict translation.
 * @param params AfriTranslateRequest
 */
export const afriTranslate = async (params: AfriTranslateRequest): Promise<AfriTranslateResponse> => {
  return getClient().translate(params);
};