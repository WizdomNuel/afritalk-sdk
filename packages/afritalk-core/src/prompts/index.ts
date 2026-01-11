import { SupportedLanguage } from '../types.js';
import { BASE_INSTRUCTION } from './base.js';

// Configuration: Grouping languages by their source file.
// This reduces repetition and makes it easier to see which languages are bundled together.
const SOURCE_FILES: Record<string, SupportedLanguage[]> = {
  'yoruba.js': [SupportedLanguage.YORUBA],
  'igbo.js': [SupportedLanguage.IGBO],
  'hausa.js': [SupportedLanguage.HAUSA],
  'tiv.js': [SupportedLanguage.TIV],
  'efik.js': [SupportedLanguage.EFIK],
  'ibibio.js': [SupportedLanguage.IBIBIO],
  'edo.js': [SupportedLanguage.EDO],
  'urhobo.js': [SupportedLanguage.URHOBO],
  'ijaw.js': [SupportedLanguage.IJAW],
  'fulfulde.js': [SupportedLanguage.FULFULDE],
  'swahili.js': [SupportedLanguage.SWAHILI],
  'amharic.js': [SupportedLanguage.AMHARIC],
  'zulu.js': [SupportedLanguage.ZULU],
  'xhosa.js': [SupportedLanguage.XHOSA],
  'twi.js': [SupportedLanguage.TWI],

  'africa_extended.js': [
    SupportedLanguage.WOLOF, SupportedLanguage.BAMBARA, SupportedLanguage.KANURI,
    SupportedLanguage.LUGANDA, SupportedLanguage.KINYARWANDA, SupportedLanguage.SOMALI,
    SupportedLanguage.OROMO, SupportedLanguage.KIKUYU, SupportedLanguage.LUO,
    SupportedLanguage.SHONA, SupportedLanguage.CHICHEWA, SupportedLanguage.SOTHO,
    SupportedLanguage.TSWANA, SupportedLanguage.AFRIKAANS, SupportedLanguage.NDEBELE,
    SupportedLanguage.LINGALA, SupportedLanguage.KONGO
  ],

  'global.js': [
    SupportedLanguage.MANDARIN, SupportedLanguage.HINDI, SupportedLanguage.JAPANESE,
    SupportedLanguage.KOREAN, SupportedLanguage.VIETNAMESE, SupportedLanguage.THAI,
    SupportedLanguage.INDONESIAN, SupportedLanguage.BENGALI, SupportedLanguage.PUNJABI,
    SupportedLanguage.TAMIL, SupportedLanguage.URDU, SupportedLanguage.MALAY,
    SupportedLanguage.TAGALOG, SupportedLanguage.GUJARATI, SupportedLanguage.TELUGU,
    SupportedLanguage.MARATHI,
    SupportedLanguage.ENGLISH, SupportedLanguage.SPANISH, SupportedLanguage.FRENCH,
    SupportedLanguage.GERMAN, SupportedLanguage.PORTUGUESE, SupportedLanguage.ITALIAN,
    SupportedLanguage.RUSSIAN, SupportedLanguage.DUTCH, SupportedLanguage.POLISH,
    SupportedLanguage.GREEK, SupportedLanguage.UKRAINIAN, SupportedLanguage.SWEDISH,
    SupportedLanguage.TURKISH,
    SupportedLanguage.ARABIC, SupportedLanguage.PERSIAN, SupportedLanguage.HEBREW,
    SupportedLanguage.KURDISH
  ]
};

/**
 * A robust mapping of common variations, endonyms, and misspellings to the canonical SupportedLanguage ID.
 * This ensures the SDK is forgiving of user input.
 */
const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  // African Variants
  'kiswahili': SupportedLanguage.SWAHILI,
  'isizulu': SupportedLanguage.ZULU,
  'isixhosa': SupportedLanguage.XHOSA,
  'akan': SupportedLanguage.TWI,
  'fante': SupportedLanguage.TWI,
  'sesotho': SupportedLanguage.SOTHO,
  'setswana': SupportedLanguage.TSWANA,
  'kikongo': SupportedLanguage.KONGO,
  'bini': SupportedLanguage.EDO,
  'fulani': SupportedLanguage.FULFULDE,
  'fula': SupportedLanguage.FULFULDE,
  'peul': SupportedLanguage.FULFULDE,
  
  // Asian/Global Variants
  'chinese': SupportedLanguage.MANDARIN,
  'putonghua': SupportedLanguage.MANDARIN,
  'farsi': SupportedLanguage.PERSIAN,
  'filipino': SupportedLanguage.TAGALOG,
  'bahasa': SupportedLanguage.INDONESIAN, // Ambiguous but usually implies Indonesia in this context
  'bahasa indonesia': SupportedLanguage.INDONESIAN,
  'bahasa melayu': SupportedLanguage.MALAY,
};

// Generate efficient lookup map (Language -> Filename) at initialization
const LANGUAGE_TO_FILE: Record<string, string> = {};
Object.entries(SOURCE_FILES).forEach(([filename, languages]) => {
  languages.forEach(lang => {
    LANGUAGE_TO_FILE[lang] = filename;
  });
});

/**
 * Resolves a language string to its canonical supported ID, handling aliases and case insensitivity.
 * @param input The raw language string input.
 * @returns The SupportedLanguage enum value or null if not found.
 */
export const resolveLanguageAlias = (input: string): SupportedLanguage | null => {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();

  // Check strict support first
  const validLanguages = Object.values(SupportedLanguage) as string[];
  if (validLanguages.includes(normalized)) {
    return normalized as SupportedLanguage;
  }

  // Check aliases
  if (LANGUAGE_ALIASES[normalized]) {
    return LANGUAGE_ALIASES[normalized];
  }

  return null;
};

/**
 * Dynamically loads the specific prompt for a requested language.
 * Uses dynamic imports import() to load files at runtime.
 */
export const getPromptForLanguage = async (language: string): Promise<string> => {
  // Attempt to resolve the input to a canonical language ID
  const canonicalLang = resolveLanguageAlias(language);
  const lookupKey = canonicalLang || language.toLowerCase();
  
  const filename = LANGUAGE_TO_FILE[lookupKey];
  
  // Enhanced Fallback Logic
  if (!filename) {
    return `${BASE_INSTRUCTION}
    
    Target Language: ${language}.
    
    Note: The system detected that specific cultural prompt guidelines for '${language}' are not yet loaded. 
    However, you are a world-class linguist.
    
    INSTRUCTIONS:
    1. Adopt the natural persona of a native speaker of ${language}.
    2. Use culturally appropriate idioms and politeness levels standard for this language.
    3. Ensure high fidelity in translation and tone.
    `;
  }

  // Convention: Export names are always UPPERCASE_LANGUAGE_PROMPT (e.g., YORUBA_PROMPT)
  const safeLangKey = lookupKey.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const exportName = `${safeLangKey}_PROMPT`;

  try {
    // Dynamic import
    const module = await import(`./${filename}`);
    const specificPrompt = module[exportName];
    
    if (typeof specificPrompt !== 'string') {
      console.warn(`[AfriTalk] Warning: Prompt export '${exportName}' in '${filename}' is missing or invalid.`);
      // Fallback if export is missing
      return `${BASE_INSTRUCTION}\n\nTarget Language: ${language}. Maintain native fluency.`;
    }

    return `${BASE_INSTRUCTION}\n\n${specificPrompt}`;
  } catch (error) {
    console.error(`[AfriTalk] Error loading prompt for language '${language}' from file '${filename}':`, error);
    // Safe fallback so the SDK doesn't crash on file read errors
    return `${BASE_INSTRUCTION}\n\nTarget Language: ${language}. Maintain native fluency.`;
  }
};