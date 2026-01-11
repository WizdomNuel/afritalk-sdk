import { getClient } from './instances.js';
import { AfriRAGRequest, AfriRAGResponse } from './types.js';

/**
 * Query a document (PDF, Text) with context awareness.
 */
export const afriDocumentQuery = async (params: AfriRAGRequest): Promise<AfriRAGResponse> => {
  return getClient().askDocument(params);
};
