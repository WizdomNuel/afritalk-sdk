import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AfriTalk API',
      version: '1.0.0',
      description: 'The Universal African AI Layer. Build culturally aware applications with a simple REST API.',
      contact: {
        name: 'AfriTalk Platform Support',
        url: 'https://afritalk.com/support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/v1',
        description: 'Local Development Server',
      },
      {
        url: 'https://api.afritalk.com/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API_KEY',
        },
      },
      schemas: {
        ChatRequest: {
          oneOf: [
            {
              type: 'object',
              required: ['message'],
              properties: {
                message: {
                  type: 'string',
                  description: 'The user input text.',
                  example: 'Bawo ni?',
                },
                language: {
                  type: 'string',
                  description: 'Target language code (e.g., yoruba, swahili).',
                  example: 'yoruba',
                },
                autoDetectLanguage: {
                  type: 'boolean',
                  description: 'Enable AI language detection.',
                  default: false,
                },
                detectionThreshold: {
                  type: 'number',
                  format: 'float',
                  description: 'Minimum confidence (0-1) for detection.',
                  default: 0.5,
                },
                model: {
                  type: 'string',
                  description: 'Optional model override.',
                  example: 'gpt-4o',
                }
              },
            },
            {
              type: 'object',
              description: 'Multipart request for audio input',
              properties: {
                message: { type: 'string', description: 'Optional text backup' },
                audio: { type: 'string', format: 'binary', description: 'Audio file to transcribe and chat' },
                language: { type: 'string' },
                autoDetectLanguage: { type: 'boolean' }
              }
            }
          ]
        },
        ChatResponse: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Generated AI response.',
            },
            metadata: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                model: { type: 'string' },
                detected: { 
                  type: 'boolean',
                  description: 'True if language was auto-detected.'
                },
                confidence: { 
                  type: 'number',
                  description: 'Confidence score (0.0-1.0) of the detection.'
                },
                timestamp: { type: 'string' },
                inputType: { 
                  type: 'string', 
                  enum: ['text', 'audio'] 
                }
              },
            },
          },
        },
        SpeakRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', example: 'E kaaro ma' },
            voice: { type: 'string', enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'], default: 'alloy' },
            speed: { type: 'number', default: 1.0 }
          }
        },
        TranslateRequest: {
          type: 'object',
          required: ['text', 'targetLanguage'],
          properties: {
            text: { type: 'string', example: 'Hello my friend' },
            targetLanguage: { type: 'string', example: 'yoruba' },
            sourceLanguage: { type: 'string', example: 'english' }
          }
        },
        TranslateResponse: {
          type: 'object',
          properties: {
            translatedText: { type: 'string' },
            sourceLanguage: { type: 'string' },
            targetLanguage: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'INVALID_INPUT'
            },
            message: {
              type: 'string',
              example: 'The message parameter is required.'
            }
          }
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/index.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);