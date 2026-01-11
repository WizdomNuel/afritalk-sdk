import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index';

// We need to define the error class for mocking purposes
class MockAfriTalkError extends Error {
  code: string;
  statusCode: number;
  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Mock the afritalk-core module entirely
jest.mock('afritalk-core', () => {
  return {
    afriChat: jest.fn(),
    afriChatStream: jest.fn(),
    afriVoice: jest.fn(),
    afriVoiceStream: jest.fn(),
    afriSpeak: jest.fn(),
    afriTranslate: jest.fn(),
    AfricanLanguage: {
      YORUBA: 'yoruba',
      IGBO: 'igbo'
    },
    AfriTalkError: MockAfriTalkError
  };
});

// Mock Auth Middleware to bypass key check for tests
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next()
}));

const { afriChat, afriVoice, afriChatStream, afriVoiceStream } = require('afritalk-core');

// Helper to create an async iterable for mocking streams
async function* mockAsyncIterable(data: any[]) {
    for (const item of data) {
        yield item;
    }
}

describe('AfriTalk API', () => {
  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', service: 'afritalk-api' });
    });
  });

  describe('POST /v1/chat Error Handling', () => {
    it('should return 400 for INVALID_INPUT', async () => {
      afriChat.mockRejectedValueOnce(new MockAfriTalkError("INVALID_INPUT", "Missing message", 400));
      const res = await request(app).post('/v1/chat').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_INPUT");
    });

    it('should return 401 for AUTH_ERROR (Mocked from Core)', async () => {
      afriChat.mockRejectedValueOnce(new MockAfriTalkError("AUTH_ERROR", "Invalid API Key", 401));
      const res = await request(app).post('/v1/chat').send({ message: "hi" });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("AUTH_ERROR");
    });

    it('should return 422 for DETECTION_FAILED', async () => {
      afriChat.mockRejectedValueOnce(new MockAfriTalkError("DETECTION_FAILED", "Low confidence", 422));
      const res = await request(app).post('/v1/chat').send({ message: "xyz", autoDetectLanguage: true });
      expect(res.status).toBe(422);
      expect(res.body.error).toBe("DETECTION_FAILED");
    });

    it('should return 429 for RATE_LIMIT', async () => {
      afriChat.mockRejectedValueOnce(new MockAfriTalkError("RATE_LIMIT", "Too many requests", 429));
      const res = await request(app).post('/v1/chat').send({ message: "hi" });
      expect(res.status).toBe(429);
      expect(res.body.error).toBe("RATE_LIMIT");
    });

    it('should return 500 for INTERNAL_ERROR', async () => {
      afriChat.mockRejectedValueOnce(new MockAfriTalkError("INTERNAL_ERROR", "Server exploded", 500));
      const res = await request(app).post('/v1/chat').send({ message: "hi" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("INTERNAL_ERROR");
    });
  });

  describe('POST /v1/chat (Success)', () => {
    it('should return chat response successfully', async () => {
      afriChat.mockResolvedValueOnce({
        text: "Mok wa o.",
        metadata: {
          language: "yoruba",
          model: "gpt-4o-mini",
          detected: true,
          confidence: 0.95,
          timestamp: "2024-01-01T00:00:00Z"
        }
      });

      const res = await request(app)
        .post('/v1/chat')
        .send({ message: "Bawo ni?", autoDetectLanguage: true });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe("Mok wa o.");
    });
  });

  describe('POST /v1/chat/stream', () => {
    it('should stream chunks successfully', async () => {
      const mockChunks = [
        { type: 'metadata', data: { language: 'yoruba' } },
        { type: 'content', delta: 'Bawo' },
        { type: 'content', delta: ' ni' }
      ];
      
      afriChatStream.mockReturnValue(mockAsyncIterable(mockChunks));

      const res = await request(app)
        .post('/v1/chat/stream')
        .send({ message: "Hello", language: "yoruba" });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/event-stream/);
      expect(res.text).toContain('data: {"type":"metadata"');
      expect(res.text).toContain('data: {"type":"content","delta":"Bawo"}');
      expect(res.text).toContain('[DONE]');
    });

    it('should handle streaming errors by sending an error event', async () => {
      // Mock generator that throws immediately
      async function* mockError() {
          throw new MockAfriTalkError("RATE_LIMIT", "Too fast", 429);
      }
      afriChatStream.mockReturnValue(mockError());

      const res = await request(app)
        .post('/v1/chat/stream')
        .send({ message: "Hello" });

      expect(res.status).toBe(200); // SSE starts with 200
      expect(res.text).toContain('event: error');
      expect(res.text).toContain('Too fast');
    });
  });

  describe('POST /v1/voice', () => {
     it('should return 400 if no file provided', async () => {
       const res = await request(app).post('/v1/voice');
       expect(res.status).toBe(400);
       expect(res.body.error).toBe("INVALID_INPUT");
     });
  });

  describe('POST /v1/voice/stream', () => {
    it('should return 400 if no file provided', async () => {
      const res = await request(app).post('/v1/voice/stream');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_INPUT");
    });

    // Note: Testing actual file uploads requires mocking fs or passing buffers to supertest .attach()
    // but without a real file path mocked in Multer, deep testing here depends on Multer mocks.
    // We assume Multer is working via middleware and test logic flow.
  });
});
