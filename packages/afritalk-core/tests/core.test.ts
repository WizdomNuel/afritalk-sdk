import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { resolveLanguageAlias, getPromptForLanguage } from '../src/prompts/index';
import { AfricanLanguage } from '../src/types';
import { AfriTalkClient } from '../src/client';

// Mock @google/genai
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: jest.fn().mockImplementation(() => Promise.resolve({
          text: 'Test response',
          candidates: [{ content: { parts: [{ inlineData: { data: 'base64audio' } }] } }]
        })),
        generateContentStream: jest.fn().mockReturnValue((async function* () {
             yield { text: 'Test chunk' };
        })())
      }
    })),
    Modality: {
        AUDIO: 'AUDIO'
    },
    Type: {
        OBJECT: 'OBJECT',
        STRING: 'STRING',
        NUMBER: 'NUMBER'
    }
  };
});

describe('AfriTalk Core SDK', () => {
  describe('Language Resolution', () => {
    it('should resolve exact language codes', () => {
      expect(resolveLanguageAlias('yoruba')).toBe(AfricanLanguage.YORUBA);
      expect(resolveLanguageAlias('swahili')).toBe(AfricanLanguage.SWAHILI);
    });

    it('should resolve aliases', () => {
      expect(resolveLanguageAlias('Kiswahili')).toBe(AfricanLanguage.SWAHILI);
      expect(resolveLanguageAlias('isizulu')).toBe(AfricanLanguage.ZULU);
      expect(resolveLanguageAlias('chinese')).toBe(AfricanLanguage.MANDARIN);
    });

    it('should return null for unknown languages', () => {
      expect(resolveLanguageAlias('valyrian')).toBeNull();
    });
  });

  describe('Prompt Loading', () => {
    it('should load a prompt for a supported language', async () => {
      const prompt = await getPromptForLanguage('yoruba');
      expect(prompt).toContain('Target Language: Yoruba');
      expect(prompt).toContain('Omoluabi');
    });

    it('should fallback gracefully for unknown languages', async () => {
      const prompt = await getPromptForLanguage('klingon');
      expect(prompt).toContain('Target Language: klingon');
    });
  });

  describe('AfriTalkClient', () => {
    let client: AfriTalkClient;

    beforeEach(() => {
      process.env.API_KEY = 'test-key';
      client = new AfriTalkClient({ apiKey: 'test-key' });
    });

    it('should initialize correctly', () => {
      expect(client).toBeDefined();
    });

    it('should fail if message is empty', async () => {
      await expect(client.chat.create({ message: '', language: 'yoruba' }))
        .rejects
        .toThrow('INVALID_INPUT');
    });

    it('should fail if language is missing and autoDetect is false', async () => {
      await expect(client.chat.create({ message: 'Hello' }))
        .rejects
        .toThrow('INVALID_CONFIG');
    });
  });
});