# AfriTalk Core SDK

The African-language AI engine.

## Installation

```bash
npm install afritalk-core
```

## Features

- **Prompt Abstraction:** Pre-built cultural personas for 70+ languages.
- **Auto-Detection:** Intelligent language identification with confidence scoring.
- **Robust Aliasing:** Handles inputs like "Kiswahili" mapping to "Swahili" automatically.
- **Typed Errors:** Predictable error handling for production environments.

## Usage

### Basic Usage
```typescript
import { afriChat, AfricanLanguage } from 'afritalk-core';

async function main() {
    const response = await afriChat({
        message: "Tell me a proverb about patience.",
        language: AfricanLanguage.HAUSA
    });
    
    console.log(response.text);
    // Returns Hausa text with cultural metadata
}
```

### Auto-Detection with Thresholds
You can let the SDK detect the language. For high-stakes environments, set a threshold to ensure the AI is confident before replying.

```typescript
try {
  const response = await afriChat({
    message: "Bawoni, how body?",
    autoDetectLanguage: true,
    detectionThreshold: 0.8 // Only proceed if 80% confident
  });
  
  console.log(`Detected: ${response.metadata.language} (Confidence: ${response.metadata.confidence})`);
} catch (error) {
  if (error.code === 'DETECTION_FAILED') {
    console.log("Could not confidently identify the language.");
  }
}
```

### Supported Languages & Aliases
The SDK accepts canonical IDs (e.g., `yoruba`) or common aliases:

- `Kiswahili` -> `swahili`
- `IsiZulu` -> `zulu`
- `Chinese` -> `mandarin`
- `Farsi` -> `persian`
- `Filipino` -> `tagalog`
- And many more...

## Error Handling

The SDK throws `AfriTalkError` objects with specific codes:

- `INVALID_INPUT` - Missing or malformed parameters.
- `DETECTION_FAILED` - Auto-detection failed or was below threshold.
- `AUTH_ERROR` - OpenAI API key missing or invalid.
- `RATE_LIMIT` - Upstream API limit reached.
