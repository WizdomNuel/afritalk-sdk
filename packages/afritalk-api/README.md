# AfriTalk API

**The Universal African AI Layer.**

This REST API service exposes the AfriTalk core intelligence to developers working in **any programming language** (Python, JavaScript, Go, Rust, etc.). It provides culturally aware text generation and audio transcription.

## Authentication

All `v1` endpoints require a Bearer token.
`Authorization: Bearer <API_KEY>`

You can generate a secure local API key by running:
```bash
npm run generate-key
```

## Endpoints

### 1. Health Check
**`GET /health`**

Check if the API is running and responsive. Useful for load balancers and uptime monitoring.

**Response:**
```json
{
  "status": "ok",
  "service": "afritalk-api"
}
```

### 2. List Languages
**`GET /v1/languages`**

Retrieve the authoritative, programmatic list of supported languages.

**Overview:**
This endpoint provides a list of all language identifiers currently supported by the AfriTalk engine. This list includes 70+ languages from Africa, Asia, Europe, and the Middle East, optimized for cultural context.

**Why use this?**
*   **Dynamic UI:** Populate your frontend "Select Language" dropdowns dynamically. This ensures your app automatically supports new languages as we add them, without code changes.
*   **Validation:** Verify that a language code is valid before sending it to the `/v1/chat` endpoint.

**Response Structure:**
Returns a JSON object containing a `languages` array of strings. These strings are the canonical IDs used in the API.

```json
{
  "languages": [
    "yoruba",
    "igbo",
    "hausa",
    "swahili",
    "zulu",
    "mandarin",
    "english",
    "french",
    "arabic",
    "..."
  ]
}
```

### 3. Chat Generation
**`POST /v1/chat`**

Generate culturally aware African language responses.

**Body Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | **Yes** | The user's input text. |
| `language` | `string` | No | The target language (e.g., 'yoruba', 'swahili'). Required if `autoDetectLanguage` is false. |
| `autoDetectLanguage` | `boolean` | No | Set to `true` to let the AI identify the language automatically. Defaults to `false`. |
| `detectionThreshold` | `float` | No | (0.0 - 1.0) Minimum confidence score required for auto-detection. Defaults to `0.5`. |
| `model` | `string` | No | Advanced users: specify 'gpt-4' or similar. Defaults to 'gpt-4o-mini'. |

**Usage Scenarios:**

**A. Explicit Language (Recommended)**
Use this when your UI has a language selector.
```json
{
  "message": "Explain the importance of community",
  "language": "zulu" 
}
```

**B. Auto-Detection**
Use this for "universal" chat interfaces where the user can type in any language.
```json
{
  "message": "Bawoni, how family?",
  "autoDetectLanguage": true,
  "detectionThreshold": 0.8
}
```

**Response:**
```json
{
  "text": "...",
  "metadata": {
    "language": "yoruba",
    "model": "gpt-4o-mini",
    "detected": true,
    "confidence": 0.98,
    "timestamp": "2023-10-27T10:00:00Z"
  }
}
```

### 4. Audio Transcription (Voice)
**`POST /v1/voice`**

Transcribe audio files into text using the AfriTalk engine.

**Auto-Detection:**
This endpoint **automatically detects** the language spoken in the audio file. You do not need to specify the language. It uses the state-of-the-art Whisper model to handle code-switching and accents native to the African context.

**Headers:**
`Content-Type: multipart/form-data`

**Form Data:**
- `audio`: The audio file to transcribe (mp3, wav, m4a, etc.)

**Response:**
```json
{
  "text": "The transcribed text of the audio file..."
}
```

### 5. WhatsApp Webhook
**`POST /whatsapp`**

A configured webhook for Twilio integration.
- Point your Twilio Sandbox "When a message comes in" URL to this endpoint.
- **Behavior:** It automatically detects the language of the incoming WhatsApp message and replies in the same language with appropriate cultural nuance.

---

## Error Codes

The API returns standard HTTP status codes along with specific error codes in the JSON body.

| Status | Error Code | Description |
| :--- | :--- | :--- |
| 400 | `INVALID_INPUT` | Missing parameters (e.g., empty message). |
| 400 | `INVALID_CONFIG` | Invalid combination of parameters (e.g. missing language AND autoDetect=false). |
| 401 | `AUTH_ERROR` | Missing or invalid API Key. |
| 422 | `DETECTION_FAILED` | Auto-detection failed or confidence was below the configured `detectionThreshold`. |
| 429 | `RATE_LIMIT` | Too many requests. Please slow down. |
| 500 | `INTERNAL_ERROR` | Server-side processing error. |

**Error Response Example:**
```json
{
  "error": "DETECTION_FAILED",
  "message": "Language confidence (0.4) was below threshold (0.8)."
}
```

---

## 🌍 Client Examples

### Python (Chat with Auto-Detect)

```python
import requests

API_URL = "http://localhost:3000/v1/chat"
API_KEY = "afri_..."

payload = {
    "message": "Kedu?",
    "autoDetectLanguage": True
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(API_URL, json=payload, headers=headers)
print(response.json())
```

### cURL (Voice Transcription)

```bash
curl -X POST http://localhost:3000/v1/voice \
  -H "Authorization: Bearer afri_..." \
  -F "audio=@/path/to/recording.mp3"
```