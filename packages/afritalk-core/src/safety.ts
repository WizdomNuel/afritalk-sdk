import { logger } from './utils/logger.js';

export interface SafetyResult { allowed: boolean; reason?: string }

const LANGUAGE_RULES: Record<string, { bannedWords?: string[] }> = {
  default: { bannedWords: [] },
  swahili: { bannedWords: [] },
  yoruba: { bannedWords: [] }
};

export function moderateContent(text: string, language: string): SafetyResult {
  const rules = LANGUAGE_RULES[language] || LANGUAGE_RULES['default'];
  if (!text || text.trim().length === 0) return { allowed: true };
  for (const b of rules.bannedWords || []) {
    if (text.toLowerCase().includes(b.toLowerCase())) {
      logger.warn('Blocked by language safety rule', { language, banned: b });
      return { allowed: false, reason: 'language_specific_policy' };
    }
  }
  return { allowed: true };
}
