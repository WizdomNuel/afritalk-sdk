import { getClient } from './instances.js';
import { AfriFeedbackRequest, AfriFeedbackResponse } from './types.js';

/**
 * Submit feedback for Reinforcement Learning (RLHF).
 */
export const afriFeedback = async (params: AfriFeedbackRequest): Promise<AfriFeedbackResponse> => {
  return getClient().feedback(params);
};
