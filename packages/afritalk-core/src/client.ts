import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createProviderFromConfig } from './provider.js';
import { moderateContent } from './safety.js';
import {
  AfriChatRequest,
  AfriChatResponse,
  AfriTalkClientConfig,
  AfriTalkError,
  AfriChatStreamChunk,
  AfriVoiceRequest,
  AfriVoiceResponse,
  AfriVoiceStreamChunk,
  AfriSpeakRequest,
  AfriSpeakResponse,
  AfriTranslateRequest,
  AfriTranslateResponse,
  AfriVideoAnalysisRequest,
  AfriVideoAnalysisResponse,
  AfriFeedbackRequest,
  AfriFeedbackResponse,
  AfriRAGRequest,
  AfriRAGResponse,
  AfriLiveConfig,
} from './types.fixed.js';
import { getPromptForLanguage, resolveLanguageAlias } from './prompts/index.js';
import { withRetry } from './utils/retry.js';
import { logger } from './utils/logger.js';

// Gemini Models Configuration
const MODEL_TEXT_BASIC = 'gemini-3-flash-preview';
const MODEL_REASONING = 'gemini-3-pro-preview';
const MODEL_AUDIO_REALTIME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
// Use Flash Preview for video analysis (multimodal input), not the image generation model
const MODEL_VIDEO = 'gemini-3-flash-preview';
const MODEL_RAG = 'gemini-3-flash-preview'; // Large context window for docs

interface DetectionResult {
  language: string;
  confidence: number;
}

// Isomorphic helpers for binary data
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64');
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return (globalThis as any).btoa ? (globalThis as any).btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64');
  }
  const binaryString = (globalThis as any).atob ? (globalThis as any).atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function streamToBase64(input: any): Promise<string> {
  if (!input) return '';

  // Buffer (Node)
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) return input.toString('base64');

  // ArrayBuffer / Uint8Array
  if (input instanceof ArrayBuffer) return arrayBufferToBase64(input);
  if (input instanceof Uint8Array) return arrayBufferToBase64(input.buffer);

  // Async Iterator / Streams (Node or Web)
  if (input && (typeof input[Symbol.asyncIterator] === 'function' || typeof input.on === 'function')) {
    const chunks: any[] = [];
    if (typeof input[Symbol.asyncIterator] === 'function') {
      for await (const chunk of input) chunks.push(chunk);
    } else {
      await new Promise((resolve, reject) => {
        input.on('data', (chunk: any) => chunks.push(chunk));
        input.on('error', (err: any) => reject(err));
        input.on('end', () => resolve(true));
      });
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.concat(chunks.map(c => (Buffer.isBuffer(c) ? c : Buffer.from(c)))).toString('base64');
    }

    // Fallback for non-Node environments
    const totalLength = chunks.reduce((acc, c) => acc + (c.length || 0), 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      const c = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      result.set(c, offset);
      offset += c.length;
    }
    return arrayBufferToBase64(result.buffer);
  }

  // Blob-like / File-like objects that provide arrayBuffer()
  if (input && typeof (input as any).arrayBuffer === 'function') {
    const arrayBuffer = await (input as any).arrayBuffer();
    return arrayBufferToBase64(arrayBuffer);
  }

  throw new Error('Unsupported input format. Must be Buffer, ReadableStream, ArrayBuffer, or Blob.');
}

export class AfriTalkClient {
  private ai: GoogleGenAI;
  private config: Required<AfriTalkClientConfig>;

  constructor(config: AfriTalkClientConfig = {}) {
    const apiKey = config.apiKey || process.env.API_KEY;

    if (!apiKey) {
      throw new AfriTalkError('AUTH_ERROR', 'Missing API Key. Pass it in constructor or set process.env.API_KEY.', 401);
    }

    this.config = {
      apiKey: apiKey,
      maxRetries: config.maxRetries ?? 3,
      timeout: config.timeout ?? 30000,
    };
    this.ai = createProviderFromConfig({ provider: (config as any).provider, apiKey: this.config.apiKey });
  }

  // --- Chat ---
  public chat = {
    create: (req: AfriChatRequest) => this.handleChat(req),
    stream: (req: AfriChatRequest) => this.handleChatStream(req),
  };

  // --- Voice (Audio -> Text) ---
  public async voice(req: AfriVoiceRequest): Promise<AfriVoiceResponse> {
    const { audioFile, mimeType = 'audio/mp3' } = req;
    return withRetry(async () => {
      try {
        const base64Audio = await streamToBase64(audioFile);
        const response = await this.ai.models.generateContent({
          model: MODEL_AUDIO_REALTIME,
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } },
              { text: 'Transcribe this audio accurately. Output ONLY the transcription.' },
            ],
          },
        });
        return { text: response.text || '' };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  public async *voiceStream(req: AfriVoiceRequest): AsyncIterable<AfriVoiceStreamChunk> {
    const { audioFile, mimeType = 'audio/mp3' } = req;
    try {
      const base64Audio = await streamToBase64(audioFile);
      const responseStream = await withRetry(async () => {
        return await this.ai.models.generateContentStream({
          model: MODEL_AUDIO_REALTIME,
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Audio } },
              { text: 'Transcribe this audio.' },
            ],
          },
        });
      }, { maxRetries: this.config.maxRetries });

      for await (const chunk of responseStream) {
        if (chunk.text) yield { type: 'transcription', text: chunk.text, start: 0, end: 0 };
      }
      yield { type: 'done' };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // --- Speak (Text -> Audio) ---
  public async speak(req: AfriSpeakRequest): Promise<AfriSpeakResponse> {
    const { text, voice = 'alloy', speed = 1.0 } = req;
    if (!text) throw new AfriTalkError('INVALID_INPUT', 'Text is required.', 400);

    const voiceMap: Record<string, string> = { alloy: 'Kore', echo: 'Fenrir', fable: 'Puck', onyx: 'Charon', nova: 'Zephyr', shimmer: 'Kore' };
    const geminiVoice = voiceMap[voice] || 'Kore';

    return withRetry(async () => {
      try {
        const response = await this.ai.models.generateContent({
          model: MODEL_TTS,
          contents: { parts: [{ text }] },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice } } },
          },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error('No audio data returned.');

        return { audioData: base64ToUint8Array(base64Audio), contentType: 'audio/pcm' };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  // --- Translate ---
  public async translate(req: AfriTranslateRequest): Promise<AfriTranslateResponse> {
    const { text, targetLanguage, sourceLanguage, useReasoning = false } = req;
    if (!text || !targetLanguage) throw new AfriTalkError('INVALID_INPUT', 'Text and targetLanguage are required.', 400);

    const resolvedTarget = resolveLanguageAlias(targetLanguage) || targetLanguage;
    const systemPrompt = `Translate to ${resolvedTarget}. Output ONLY the translated text. No pleasantries. ${sourceLanguage ? `Source: ${sourceLanguage}` : ''}`;

    const model = useReasoning ? MODEL_REASONING : MODEL_TEXT_BASIC;
    const config: any = { systemInstruction: systemPrompt, temperature: 0.3 };
    if (useReasoning) config.thinkingConfig = { thinkingBudget: 1024 };

    return withRetry(async () => {
      try {
        const response = await this.ai.models.generateContent({ model, contents: text, config });
        return { translatedText: response.text || '', sourceLanguage: sourceLanguage || 'auto', targetLanguage: resolvedTarget };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  // --- Phase 1: Video Analysis ---
  public async video(req: AfriVideoAnalysisRequest): Promise<AfriVideoAnalysisResponse> {
    const { videoFile, mimeType, prompt, language = 'english' } = req;

    if (!videoFile || !mimeType) throw new AfriTalkError('INVALID_INPUT', 'Video file and MIME type are required.', 400);

    return withRetry(async () => {
      try {
        logger.info('Processing Video Analysis');
        const base64Video = await streamToBase64(videoFile);

        const langPrompt = language !== 'english' ? `Respond in ${language}. ` : '';
        const userPrompt = prompt || 'Describe what is happening in this video in detail, focusing on cultural elements.';

        const response = await this.ai.models.generateContent({
          model: MODEL_VIDEO,
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Video } },
              { text: `${langPrompt}${userPrompt}` },
            ],
          },
        });

        return {
          description: response.text || 'No description generated.',
          metadata: { language: language as string, model: MODEL_VIDEO },
        };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  // --- Phase 2: Feedback Loop (RLHF) ---
  public async feedback(req: AfriFeedbackRequest): Promise<AfriFeedbackResponse> {
    logger.info('Feedback received', { rating: req.rating, language: req.language, correctionLength: req.correction?.length });
    return { success: true, id: req.requestId || Math.random().toString(36).substring(7) };
  }

  // --- Phase 3: Enterprise RAG ---
  public async askDocument(req: AfriRAGRequest): Promise<AfriRAGResponse> {
    const { document, mimeType, query, language = 'english' } = req;
    return withRetry(async () => {
      try {
        const base64Doc = await streamToBase64(document);
        const langPrompt = language !== 'english' ? `Answer in ${language}.` : '';

        const response = await this.ai.models.generateContent({
          model: MODEL_RAG,
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Doc } },
              { text: `Based on the attached document, answer this query: ${query}. ${langPrompt} If the answer is not in the document, say so.` },
            ],
          },
        });

        return { answer: response.text || '', citations: [] };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  // --- Phase 3: Live API (Real-time Voice) ---
  public async live(config: AfriLiveConfig): Promise<any> {
    return this.ai.live.connect({
      model: config.model || MODEL_AUDIO_REALTIME,
      callbacks: {
        onopen: config.callbacks.onOpen,
        onmessage: config.callbacks.onMessage,
        onerror: config.callbacks.onError,
        onclose: config.callbacks.onClose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Zephyr' } } },
        systemInstruction: config.systemInstruction,
      },
    });
  }

  // --- Internal Methods ---

  private async detectLanguage(message: string, model: string): Promise<DetectionResult> {
    return withRetry(async () => {
      try {
        const response = await this.ai.models.generateContent({
          model: model,
          contents: message,
          config: {
            systemInstruction: `Analyze the text. Return JSON: { "language": "string", "confidence": number }`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: { language: { type: Type.STRING }, confidence: { type: Type.NUMBER } },
              required: ['language', 'confidence'],
            },
            temperature: 0,
          },
        });

        let result: any = { language: 'unknown', confidence: 0.0 };
        try { if (response.text) result = JSON.parse(response.text); } catch (e) { }

        const canonical = resolveLanguageAlias(result.language);
        return { language: canonical || result.language || 'unknown', confidence: result.confidence || 0.0 };
      } catch (error: any) {
        return { language: 'unknown', confidence: 0.0 };
      }
    }, { maxRetries: this.config.maxRetries });
  }

  private async prepareRequest(params: AfriChatRequest, requestId: string) {
    const { message, audio, audioMimeType, model: customModel, autoDetectLanguage, detectionThreshold, enableReasoning, dialect } = params;

    let finalMessage = message;
    let inputType: 'text' | 'audio' = 'text';

    if (audio) {
      const voiceRes = await this.voice({ audioFile: audio, mimeType: audioMimeType });
      const transcription = voiceRes.text;

      if (finalMessage && finalMessage.trim().length > 0) {
        finalMessage = `${finalMessage}\n\n[Context from Audio]: ${transcription}`;
      } else {
        finalMessage = transcription;
      }
      inputType = 'audio';
    }

    if (!finalMessage || typeof finalMessage !== 'string' || finalMessage.trim().length === 0) {
      throw new AfriTalkError('INVALID_INPUT', 'Message required.', 400);
    }

    let { language } = params as any;
    let isAutoDetected = false;
    let detectionConfidence = 1.0;

    let targetModel = (customModel as string) || (enableReasoning ? MODEL_REASONING : MODEL_TEXT_BASIC);

    if (autoDetectLanguage || (language === 'auto' && !dialect)) {
      const result = await this.detectLanguage(finalMessage, targetModel);
      detectionConfidence = result.confidence;
      if (detectionThreshold && detectionConfidence < detectionThreshold) {
        throw new AfriTalkError('DETECTION_FAILED', 'Confidence too low.', 422);
      }
      language = result.language;
      isAutoDetected = true;
    } else if (!language) {
      throw new AfriTalkError('INVALID_CONFIG', 'Language required.', 400);
    }

    const resolvedLang = resolveLanguageAlias(language!) || language!;
    let systemPrompt = await getPromptForLanguage(resolvedLang);

    const safety = moderateContent(finalMessage as string, resolvedLang);
    if (!safety.allowed) {
      throw new AfriTalkError('SAFETY_BLOCK', `Message blocked by safety rules: ${safety.reason}`, 422);
    }

    if (dialect) {
      systemPrompt += `\nIMPORTANT: Use the ${dialect} dialect/variety of ${resolvedLang}. Ensure vocabulary and tone matches this specific region.`;
    }

    return { language: resolvedLang, dialect, isAutoDetected, detectionConfidence, targetModel, systemPrompt, finalMessage, inputType, enableReasoning };
  }

  private async handleChat(params: AfriChatRequest): Promise<AfriChatResponse> {
    const requestId = Math.random().toString(36).substring(7);
    const { language, dialect, isAutoDetected, detectionConfidence, targetModel, systemPrompt, finalMessage, inputType, enableReasoning } = await this.prepareRequest(params, requestId);

    return withRetry(async () => {
      try {
        const config: any = { systemInstruction: systemPrompt, temperature: 0.7 };
        if (enableReasoning) { config.thinkingConfig = { thinkingBudget: 2048 }; config.maxOutputTokens = 4096; }

        const response = await this.ai.models.generateContent({ model: targetModel, contents: finalMessage, config });
        const responseText = response.text || '';
        if (!responseText) throw new AfriTalkError('EMPTY_RESPONSE', 'Empty AI response.', 502);

        return {
          text: responseText,
          metadata: { language, dialect, model: targetModel, detected: isAutoDetected, confidence: detectionConfidence, timestamp: new Date().toISOString(), inputType }
        };
      } catch (error: any) {
        this.handleError(error);
        throw error;
      }
    }, { maxRetries: this.config.maxRetries });
  }

  private async *handleChatStream(params: AfriChatRequest): AsyncIterable<AfriChatStreamChunk> {
    const { language, dialect, isAutoDetected, detectionConfidence, targetModel, systemPrompt, finalMessage, inputType, enableReasoning } = await this.prepareRequest(params, 'stream');

    yield { type: 'metadata', data: { language, dialect, model: targetModel, detected: isAutoDetected, confidence: detectionConfidence, timestamp: new Date().toISOString(), inputType } };

    try {
      const config: any = { systemInstruction: systemPrompt, temperature: 0.7 };
      if (enableReasoning) { config.thinkingConfig = { thinkingBudget: 2048 }; config.maxOutputTokens = 4096; }

      const responseStream = await withRetry(() => this.ai.models.generateContentStream({ model: targetModel, contents: finalMessage, config }), { maxRetries: this.config.maxRetries });

      for await (const chunk of responseStream) {
        if (chunk.text) yield { type: 'content', delta: chunk.text };
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof AfriTalkError) throw error;
    if (error?.message?.includes?.('401')) throw new AfriTalkError('AUTH_ERROR', 'Invalid API Key.', 500);
    if (error?.message?.includes?.('429')) throw new AfriTalkError('RATE_LIMIT', 'Rate limit exceeded.', 429);
    throw new AfriTalkError('INTERNAL_ERROR', error?.message || String(error), 500);
  }
}