export type AnyBinary = any;

export class AfriTalkError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AfriTalkError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export interface AfriTalkClientConfig { apiKey?: string; maxRetries?: number; timeout?: number }
export interface AfriChatRequest { message?: string; audio?: any; audioMimeType?: string; language?: string; dialect?: string; autoDetectLanguage?: boolean; detectionThreshold?: number; model?: string; enableReasoning?: boolean }
export interface AfriChatResponse { text: string; metadata: { language: string; dialect?: string; model: string; detected: boolean; confidence: number; timestamp: string; inputType: 'text'|'audio' } }
export type AfriChatStreamChunk = | { type: 'metadata'; data: AfriChatResponse['metadata'] } | { type: 'content'; delta: string }
export interface AfriVoiceRequest { audioFile: AnyBinary; mimeType?: string }
export interface AfriVoiceResponse { text: string }
export type AfriVoiceStreamChunk = | { type: 'transcription'; text: string; start: number; end: number } | { type: 'done' }
export interface AfriSpeakRequest { text: string; voice?: string; speed?: number }
export interface AfriSpeakResponse { audioData: Buffer | Uint8Array; contentType: string }
export interface AfriTranslateRequest { text: string; targetLanguage: string; sourceLanguage?: string; useReasoning?: boolean }
export interface AfriTranslateResponse { translatedText: string; sourceLanguage: string; targetLanguage: string }
export interface AfriVideoAnalysisRequest { videoFile: AnyBinary; mimeType: string; prompt?: string; language?: string }
export interface AfriVideoAnalysisResponse { description: string; metadata: { language: string; model: string } }
export interface AfriFeedbackRequest { requestId?: string; input: string; output: string; rating: 'positive'|'negative'; correction?: string; language: string }
export interface AfriFeedbackResponse { success: boolean; id: string }
export interface AfriRAGRequest { document: AnyBinary; mimeType: string; query: string; language?: string }
export interface AfriRAGResponse { answer: string; citations?: string[] }
export interface AfriLiveConfig { model?: string; systemInstruction?: string; voiceName?: string; callbacks: { onOpen?: () => void; onMessage?: (m: any) => void; onError?: (e: any) => void; onClose?: () => void } }
