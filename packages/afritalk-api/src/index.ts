import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import twilio from 'twilio';
import swaggerUi from 'swagger-ui-express';
import { 
  afriChat, 
  afriChatStream, 
  afriVoice, 
  afriVoiceStream,
  afriSpeak, 
  afriTranslate, 
  afriVideo,
  afriDocumentQuery,
  afriFeedback,
  AfricanLanguage, 
  AfriTalkError 
} from 'afritalk-core';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { AnalyticsService } from './services/analytics.js';
import { swaggerSpec } from './config/swagger.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Base Middleware
app.use(helmet() as any);
app.use(cors({ origin: '*' }) as any);
app.use(express.json() as any);
app.use(express.urlencoded({ extended: true }) as any);

// Analytics Middleware
app.use((req: any, res: Response, next: any) => {
  const path = req.path;
  if (path && path.startsWith('/v1')) {
    AnalyticsService.trackRequest(path);
  }
  next();
});

app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', service: 'afritalk-api' });
});

// WhatsApp Webhook
app.post('/whatsapp', async (req: any, res: any) => {
  const { MessagingResponse } = twilio.twiml;
  const twiml = new MessagingResponse();
  
  // Twilio sends form-urlencoded data
  const incomingMsg = req.body.Body;
  const numMedia = parseInt(req.body.NumMedia || '0');
  const mediaUrl = req.body.MediaUrl0;
  const mediaType = req.body.MediaContentType0;
  
  // If no text and no media, send welcome message
  if (!incomingMsg && numMedia === 0) {
    twiml.message("Hello! Send me a message or voice note in any African language to start chatting.");
    res.type('text/xml').send(twiml.toString());
    return;
  }

  try {
    let audioBuffer: Buffer | undefined;

    // Handle Voice Notes / Audio Files
    if (numMedia > 0 && mediaUrl && mediaType && mediaType.startsWith('audio/')) {
        try {
            const audioRes = await fetch(mediaUrl);
            const arrayBuffer = await audioRes.arrayBuffer();
            audioBuffer = Buffer.from(arrayBuffer);
        } catch (err) {
            console.error("Failed to download WhatsApp media:", err);
            // Fallback to text processing if download fails
        }
    }

    // Call AfriChat with Auto-Detection enabled
    const aiResponse = await afriChat({ 
      message: incomingMsg, // Can be empty if audio is provided
      audio: audioBuffer,
      audioMimeType: mediaType,
      autoDetectLanguage: true
    });
    
    twiml.message(aiResponse.text);
    AnalyticsService.trackRequest('/whatsapp');
  } catch (error: any) {
    console.error("WhatsApp Error:", error.message);
    if (error.code === 'DETECTION_FAILED') {
        twiml.message("I'm sorry, I couldn't identify the language. Please try again or start your message with the language name (e.g., 'Swahili: Habari').");
    } else {
        twiml.message("Service temporarily unavailable. Please try again later.");
    }
  }
  res.type('text/xml').send(twiml.toString());
});

// --- Protected Routes ---
app.use('/v1', authMiddleware);
app.use('/v1', rateLimitMiddleware);

app.get('/v1/languages', (req: any, res: any) => {
  res.json({ languages: Object.values(AfricanLanguage) });
});

app.post('/v1/chat', upload.single('audio') as any, async (req: any, res: any) => {
  let filePath = '';
  try {
    const { message, language, dialect, model, autoDetectLanguage, detectionThreshold, enableReasoning } = req.body;
    let audioStream = undefined;
    let mimeType = undefined;

    if (req.file) {
      filePath = req.file.path;
      audioStream = fs.createReadStream(filePath);
      mimeType = req.file.mimetype;
    }

    const isAutoDetect = autoDetectLanguage === 'true' || autoDetectLanguage === true;
    const isReasoning = enableReasoning === 'true' || enableReasoning === true;
    const threshold = detectionThreshold ? parseFloat(detectionThreshold) : undefined;

    const response = await afriChat({ 
      message, 
      audio: audioStream,
      audioMimeType: mimeType,
      language, 
      dialect,
      model,
      autoDetectLanguage: isAutoDetect,
      detectionThreshold: threshold,
      enableReasoning: isReasoning
    });

    if (response.metadata && response.metadata.language) {
      AnalyticsService.trackLanguage(response.metadata.language);
    }
    
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json(response);
  } catch (error: any) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    handleApiError(error, res);
  }
});

app.post('/v1/chat/stream', upload.single('audio') as any, async (req: any, res: any) => {
  let filePath = '';
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { message, language, dialect, model, autoDetectLanguage, detectionThreshold, enableReasoning } = req.body;
    let audioStream = undefined;
    let mimeType = undefined;

    if (req.file) {
      filePath = req.file.path;
      audioStream = fs.createReadStream(filePath);
      mimeType = req.file.mimetype;
    }

    const isAutoDetect = autoDetectLanguage === 'true' || autoDetectLanguage === true;
    const isReasoning = enableReasoning === 'true' || enableReasoning === true;
    const threshold = detectionThreshold ? parseFloat(detectionThreshold) : undefined;
    
    const stream = afriChatStream({ 
      message, 
      audio: audioStream,
      audioMimeType: mimeType,
      language, 
      dialect,
      model,
      autoDetectLanguage: isAutoDetect,
      detectionThreshold: threshold,
      enableReasoning: isReasoning
    });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("Stream API Error:", error.message);
    if (!res.headersSent) {
      handleApiError(error, res);
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

app.post('/v1/voice', upload.single('audio') as any, async (req: any, res: any) => {
  try {
    if (!req.file) throw new AfriTalkError("INVALID_INPUT", "Missing audio file.", 400);
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const mimeType = req.file.mimetype;

    const response = await afriVoice({ audioFile: fileStream, mimeType });
    fs.unlinkSync(filePath);
    res.json(response);
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    handleApiError(error, res);
  }
});

app.post('/v1/voice/stream', upload.single('audio') as any, async (req: any, res: any) => {
  let filePath = '';
  try {
    if (!req.file) throw new AfriTalkError("INVALID_INPUT", "Missing audio file.", 400);
    res.setHeader('Content-Type', 'text/event-stream');
    filePath = req.file.path;
    const stream = afriVoiceStream({ audioFile: fs.createReadStream(filePath), mimeType: req.file.mimetype });
    for await (const chunk of stream) res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    if (!res.headersSent) handleApiError(error, res);
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

app.post('/v1/speak', async (req: any, res: any) => {
  try {
    const { text, voice, speed } = req.body;
    const response = await afriSpeak({ text, voice, speed });
    res.setHeader('Content-Type', response.contentType);
    res.send(response.audioData);
  } catch (error: any) {
    handleApiError(error, res);
  }
});

app.post('/v1/translate', async (req: any, res: any) => {
  try {
    const { text, targetLanguage, sourceLanguage, useReasoning } = req.body;
    const response = await afriTranslate({ text, targetLanguage, sourceLanguage, useReasoning });
    res.json(response);
  } catch (error: any) {
    handleApiError(error, res);
  }
});

// --- New Phase 1 & 2 Endpoints ---

/**
 * @openapi
 * /video/analyze:
 *   post:
 *     summary: Analyze video content
 *     tags: [Multimodal]
 */
app.post('/v1/video/analyze', upload.single('video') as any, async (req: any, res: any) => {
    try {
        if (!req.file) throw new AfriTalkError("INVALID_INPUT", "Missing video file.", 400);
        const { prompt, language } = req.body;
        const filePath = req.file.path;
        
        const response = await afriVideo({ 
            videoFile: fs.createReadStream(filePath), 
            mimeType: req.file.mimetype,
            prompt, 
            language 
        });
        
        fs.unlinkSync(filePath);
        res.json(response);
    } catch (error: any) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        handleApiError(error, res);
    }
});

/**
 * @openapi
 * /rag:
 *   post:
 *     summary: Query documents (PDF/Text)
 *     tags: [Enterprise]
 */
app.post('/v1/rag', upload.single('document') as any, async (req: any, res: any) => {
    try {
        if (!req.file) throw new AfriTalkError("INVALID_INPUT", "Missing document file.", 400);
        const { query, language } = req.body;
        const filePath = req.file.path;
        
        const response = await afriDocumentQuery({
            document: fs.createReadStream(filePath),
            mimeType: req.file.mimetype,
            query,
            language
        });
        
        fs.unlinkSync(filePath);
        res.json(response);
    } catch (error: any) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        handleApiError(error, res);
    }
});

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Submit RLHF Feedback
 *     tags: [Data]
 */
app.post('/v1/feedback', async (req: any, res: any) => {
    try {
        const { input, output, rating, correction, language } = req.body;
        const response = await afriFeedback({ input, output, rating, correction, language });
        res.json(response);
    } catch (error: any) {
        handleApiError(error, res);
    }
});

const handleApiError = (error: any, res: any) => {
  console.error("API Error:", error.message);
  if (error instanceof AfriTalkError) {
    res.status(error.statusCode).json({ error: error.code, message: error.message });
    return;
  }
  res.status(500).json({ error: "INTERNAL_ERROR", message: "An unexpected error occurred." });
};

app.get('/v1/analytics', (req: any, res: any) => {
  const stats = AnalyticsService.getStats();
  res.json({ status: 'success', data: stats });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AfriTalk API running on port ${PORT}`);
  });
}
