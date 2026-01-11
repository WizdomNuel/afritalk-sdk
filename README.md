# AfriTalk AI Platform

**African AI Infrastructure.**

This monorepo contains the foundational AI layer for African languages.

## Packages

### 1. `afritalk-core` (SDK)
The brain of the operation. A Node.js TypeScript SDK that abstracts prompt engineering for 10 distinct Nigerian languages using OpenAI `gpt-4o-mini`.

**Features:**
- Native-speaker tone enforcement
- Cultural context injection
- Abstraction of LLM complexity
- **Voice Support:** Audio transcription via `afriVoice`

### 2. `afritalk-api` (API Service)
A hosted REST API allowing other developers to consume `afritalk-core` via simple HTTP requests.

**Features:**
- Bearer Token Auth
- Rate Limiting
- Standardized JSON responses
- **WhatsApp Webhook:** Native Twilio integration
- **Voice API:** `/v1/voice` endpoint for audio transcription

## Getting Started

### Prerequisites
- Node.js (v18+)
- OpenAI API Key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build all packages:
   ```bash
   npm run build
   ```

3. Configure Environment:
   Create a `.env` file in root (or specifically in package folders):
   ```env
   # In packages/afritalk-core/.env
   OPENAI_API_KEY=sk-your-openai-key
   
   # In packages/afritalk-api/.env
   API_KEYS=test-key-123,admin-key-456
   PORT=3000
   ```

### Running the API locally

```bash
cd packages/afritalk-api
npm run start
```

## Usage Example (SDK)

```typescript
import { afriChat } from 'afritalk-core';

const res = await afriChat({
  message: "Explain the concept of respect",
  language: "yoruba"
});
console.log(res.text);
```

## Usage Example (API)

```bash
curl -X POST http://localhost:3000/v1/chat \
  -H "Authorization: Bearer test-key-123" \
  -H "Content-Type: application/json" \
  -d '{ "message": "How do I save money?", "language": "igbo" }'
```

## Platform Overview

This monorepo is organized as a monorepo with focused packages:

- `afritalk-core`: SDK and provider abstraction for LLM backends, safety hooks, logging.
- `afritalk-api`: HTTP surface with auth and rate limiting.
- `afritalk-eval`: Evaluation harness for language quality metrics and human-in-the-loop scoring.
- `afritalk-tokenizer`: Tokenizer training scripts (SentencePiece) and evaluation helpers.
- `afritalk-data`: Local ingestion and processing pipeline for dataset preparation.

### Evaluation & Tokenizer

We include an evaluation harness that emits JSON results for fluency, cultural correctness, literal-translation errors, tone, and hallucinations. Tokenizer scripts are provided to train a SentencePiece/BPE model from local corpora; the tokenizer package is intended to feed later pretraining jobs.

### Safety & Observability

Basic language-specific safety rules and structured JSON logging are included. These are lightweight and configurable; no external telemetry is baked in.

For detailed developer docs, see packages/*/README.md.
