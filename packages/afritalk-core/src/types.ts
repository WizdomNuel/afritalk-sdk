export enum SupportedLanguage {
  // --- West Africa ---
  YORUBA = 'yoruba',
  IGBO = 'igbo',
  HAUSA = 'hausa',
  TIV = 'tiv',
  EFIK = 'efik',
  IBIBIO = 'ibibio',
  EDO = 'edo',
  URHOBO = 'urhobo',
  IJAW = 'ijaw',
  FULFULDE = 'fulfulde',
  TWI = 'twi',
  WOLOF = 'wolof',
  BAMBARA = 'bambara',
  KANURI = 'kanuri',

  // --- East Africa ---
  SWAHILI = 'swahili',
  AMHARIC = 'amharic',
  LUGANDA = 'luganda',
  KINYARWANDA = 'kinyarwanda',
  SOMALI = 'somali',
  OROMO = 'oromo',
  KIKUYU = 'kikuyu',
  LUO = 'luo',

  // --- Southern Africa ---
  ZULU = 'zulu',
  XHOSA = 'xhosa',
  SHONA = 'shona',
  CHICHEWA = 'chichewa',
  SOTHO = 'sotho',
  TSWANA = 'tswana',
  AFRIKAANS = 'afrikaans',
  NDEBELE = 'ndebele',
  
  // --- Central Africa ---
  LINGALA = 'lingala',
  KONGO = 'kongo',

  // --- Asia ---
  MANDARIN = 'mandarin',
  HINDI = 'hindi',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  VIETNAMESE = 'vietnamese',
  THAI = 'thai',
  INDONESIAN = 'indonesian',
  BENGALI = 'bengali',
  PUNJABI = 'punjabi',
  TAMIL = 'tamil',
  URDU = 'urdu',
  MALAY = 'malay',
  TAGALOG = 'tagalog',
  GUJARATI = 'gujarati',
  TELUGU = 'telugu',
  MARATHI = 'marathi',

  // --- Europe / Americas ---
  ENGLISH = 'english',
  SPANISH = 'spanish',
  FRENCH = 'french',
  GERMAN = 'german',
  PORTUGUESE = 'portuguese',
  ITALIAN = 'italian',
  RUSSIAN = 'russian',
  DUTCH = 'dutch',
  POLISH = 'polish',
  GREEK = 'greek',
  UKRAINIAN = 'ukrainian',
  SWEDISH = 'swedish',
  TURKISH = 'turkish',
  
  // --- Middle East ---
  ARABIC = 'arabic',
  PERSIAN = 'persian',
  HEBREW = 'hebrew',
  KURDISH = 'kurdish'
}

// Dialect Support
export enum SupportedDialect {
    YORUBA_OYO = 'oyo',
    YORUBA_IJEBU = 'ijebu',
    IGBO_CENTRAL = 'central',
    IGBO_WAAWA = 'waawa',
    HAUSA_KANO = 'kano',
    HAUSA_SOKOTO = 'sokoto',
    SWAHILI_UNGUJA = 'unguja',
    SWAHILI_MVITA = 'mvita'
}

// Backward compatibility alias for legacy integrations
export type AfricanLanguage = SupportedLanguage;
export const AfricanLanguage = SupportedLanguage;

/**
 * Custom Error class for AfriTalk SDK.
 */
export class AfriTalkError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AfriTalkError';
    this.code = code;
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AfriTalkError);
    }
  }
}

/**
 * Configuration for the AfriTalk Client.
 */
export interface AfriTalkClientConfig {
  apiKey?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AfriChatRequest {
  message?: string;
  audio?: any;
  audioMimeType?: string;
  language?: SupportedLanguage | string;
  dialect?: SupportedDialect | string; // Phase 2: Dialect Support
  autoDetectLanguage?: boolean;
  detectionThreshold?: number;
  model?: string;
  enableReasoning?: boolean;
}

export interface AfriChatResponse {
  text: string;
  metadata: {
    language: string;
    dialect?: string;
    model: string;
    detected: boolean;
    confidence: number;
    timestamp: string;
    inputType: 'text' | 'audio';
  };
}

export type AfriChatStreamChunk = 
  | { type: 'metadata'; data: AfriChatResponse['metadata'] }
  | { type: 'content'; delta: string };

export interface AfriVoiceRequest {
  audioFile: any;
  mimeType?: string;
}

export interface AfriVoiceResponse {
  text: string;
}

export type AfriVoiceStreamChunk = 
  | { type: 'transcription'; text: string; start: number; end: number }
  | { type: 'done' };

export interface AfriSpeakRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export interface AfriSpeakResponse {
  audioData: Buffer | Uint8Array;
  contentType: string;
}

export interface AfriTranslateRequest {
  text: string;
  targetLanguage: SupportedLanguage | string;
  sourceLanguage?: string;
  useReasoning?: boolean;
}

export interface AfriTranslateResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// --- Phase 1: Video Analysis ---
export interface AfriVideoAnalysisRequest {
  videoFile: any;
  mimeType: string; // e.g., 'video/mp4'
  prompt?: string;
  language?: SupportedLanguage | string;
}

export interface AfriVideoAnalysisResponse {
    description: string;
    metadata: {
        language: string;
        model: string;
    };
}

// --- Phase 2: Feedback (RLHF) ---
export interface AfriFeedbackRequest {
    requestId?: string; // Optional correlation ID
    input: string;
    output: string;
    rating: 'positive' | 'negative';
    correction?: string; // User corrected text
    language: string;
}

export interface AfriFeedbackResponse {
    success: boolean;
    id: string;
}

// --- Phase 3: Enterprise RAG ---
export interface AfriRAGRequest {
  document: any; // PDF, Text
  mimeType: string; // 'application/pdf', 'text/plain'
  query: string;
  language?: SupportedLanguage | string;
}

export interface AfriRAGResponse {
    answer: string;
    citations?: string[];
}

// --- Phase 3: Live API Config ---
export interface AfriLiveConfig {
    model?: string;
    systemInstruction?: string;
    voiceName?: string;
    callbacks: {
        onOpen?: () => void;
        onMessage?: (message: any) => void;
        onError?: (error: any) => void;
        onClose?: () => void;
    }
}


export enum SupportedLanguage {
  // --- West Africa ---
  YORUBA = 'yoruba',
  IGBO = 'igbo',
  HAUSA = 'hausa',
  TIV = 'tiv',
  EFIK = 'efik',
  IBIBIO = 'ibibio',
  EDO = 'edo',
  URHOBO = 'urhobo',
  IJAW = 'ijaw',
  FULFULDE = 'fulfulde',
  TWI = 'twi',
  WOLOF = 'wolof',
  BAMBARA = 'bambara',
  KANURI = 'kanuri',

  // --- East Africa ---
  SWAHILI = 'swahili',
  AMHARIC = 'amharic',
  LUGANDA = 'luganda',
  KINYARWANDA = 'kinyarwanda',
  SOMALI = 'somali',
  OROMO = 'oromo',
  KIKUYU = 'kikuyu',
  LUO = 'luo',

  // --- Southern Africa ---
  ZULU = 'zulu',
  XHOSA = 'xhosa',
  SHONA = 'shona',
  CHICHEWA = 'chichewa',
  SOTHO = 'sotho',
  TSWANA = 'tswana',
  AFRIKAANS = 'afrikaans',
  NDEBELE = 'ndebele',
  
  // --- Central Africa ---
  LINGALA = 'lingala',
  KONGO = 'kongo',

  // --- Asia ---
  MANDARIN = 'mandarin',
  HINDI = 'hindi',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  VIETNAMESE = 'vietnamese',
  THAI = 'thai',
  INDONESIAN = 'indonesian',
  BENGALI = 'bengali',
  PUNJABI = 'punjabi',
  TAMIL = 'tamil',
  URDU = 'urdu',
  MALAY = 'malay',
  TAGALOG = 'tagalog',
  GUJARATI = 'gujarati',
  TELUGU = 'telugu',
  MARATHI = 'marathi',

  // --- Europe / Americas ---
  ENGLISH = 'english',
  SPANISH = 'spanish',
  FRENCH = 'french',
  GERMAN = 'german',
  PORTUGUESE = 'portuguese',
  ITALIAN = 'italian',
  RUSSIAN = 'russian',
  DUTCH = 'dutch',
  POLISH = 'polish',
  GREEK = 'greek',
  UKRAINIAN = 'ukrainian',
  SWEDISH = 'swedish',
  TURKISH = 'turkish',
  
  // --- Middle East ---
  ARABIC = 'arabic',
  PERSIAN = 'persian',
  HEBREW = 'hebrew',
  KURDISH = 'kurdish'
}

// Dialect Support
export enum SupportedDialect {
    YORUBA_OYO = 'oyo',
    YORUBA_IJEBU = 'ijebu',
    IGBO_CENTRAL = 'central',
    IGBO_WAAWA = 'waawa',
    HAUSA_KANO = 'kano',
    HAUSA_SOKOTO = 'sokoto',
    SWAHILI_UNGUJA = 'unguja',
    SWAHILI_MVITA = 'mvita'
}

// Backward compatibility alias for legacy integrations
export type AfricanLanguage = SupportedLanguage;
export const AfricanLanguage = SupportedLanguage;

/**
 * Custom Error class for AfriTalk SDK.
 */
export class AfriTalkError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AfriTalkError';
    this.code = code;
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AfriTalkError);
    }
  }
}

/**
 * Configuration for the AfriTalk Client.
 */
export interface AfriTalkClientConfig {
  apiKey?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AfriChatRequest {
  message?: string;
  audio?: any;
  audioMimeType?: string;
  language?: SupportedLanguage | string;
  dialect?: SupportedDialect | string; // Phase 2: Dialect Support
  autoDetectLanguage?: boolean;
  detectionThreshold?: number;
  model?: string;
  enableReasoning?: boolean;
}

export interface AfriChatResponse {
  text: string;
  metadata: {
    language: string;
    dialect?: string;
    model: string;
    detected: boolean;
    confidence: number;
    timestamp: string;
    inputType: 'text' | 'audio';
  };
}

export type AfriChatStreamChunk = 
  | { type: 'metadata'; data: AfriChatResponse['metadata'] }
  | { type: 'content'; delta: string };

export interface AfriVoiceRequest {
  audioFile: File | Blob | Buffer | any;
  mimeType?: string;
}

export interface AfriVoiceResponse {
  text: string;
}

export type AfriVoiceStreamChunk = 
  | { type: 'transcription'; text: string; start: number; end: number }
  | { type: 'done' };

export interface AfriSpeakRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export interface AfriSpeakResponse {
  audioData: Buffer | Uint8Array;
  contentType: string;
}

export interface AfriTranslateRequest {
  text: string;
  targetLanguage: SupportedLanguage | string;
  sourceLanguage?: string;
  useReasoning?: boolean;
}

export interface AfriTranslateResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// --- Phase 1: Video Analysis ---
export interface AfriVideoAnalysisRequest {
    videoFile: File | Blob | Buffer | any;
    mimeType: string; // e.g., 'video/mp4'
    prompt?: string;
    language?: SupportedLanguage | string;
}

export interface AfriVideoAnalysisResponse {
    description: string;
    metadata: {
        language: string;
        model: string;
    };
}

// --- Phase 2: Feedback (RLHF) ---
export interface AfriFeedbackRequest {
    requestId?: string; // Optional correlation ID
    input: string;
    output: string;
    rating: 'positive' | 'negative';
    correction?: string; // User corrected text
    language: string;
}

export interface AfriFeedbackResponse {
    success: boolean;
    id: string;
}

// --- Phase 3: Enterprise RAG ---
export interface AfriRAGRequest {
    document: File | Blob | Buffer | any; // PDF, Text
    mimeType: string; // 'application/pdf', 'text/plain'
    query: string;
    language?: SupportedLanguage | string;
}

export interface AfriRAGResponse {
    answer: string;
    citations?: string[];
}

// --- Phase 3: Live API Config ---
export interface AfriLiveConfig {
    model?: string;
    systemInstruction?: string;
    voiceName?: string;
    callbacks: {
        onOpen?: () => void;
        onMessage?: (message: any) => void;
        onError?: (error: any) => void;
        onClose?: () => void;
    }
}
