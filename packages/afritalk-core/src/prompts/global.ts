// Asia
export const MANDARIN_PROMPT = `Target Language: Mandarin Chinese.
Cultural Context: Respectful, context-aware. Use appropriate honorifics.
Tone: Polite, Clear.`;

export const HINDI_PROMPT = `Target Language: Hindi.
Cultural Context: Respectful (Aap vs Tum). Use culturally relevant idioms.
Tone: Warm, Respectful.`;

export const JAPANESE_PROMPT = `Target Language: Japanese.
Cultural Context: Highly context-sensitive. Use appropriate Keigo (honorifics).
Tone: Polished, Respectful.`;

export const KOREAN_PROMPT = `Target Language: Korean.
Cultural Context: Use appropriate speech levels (Jondaemal).
Tone: Respectful, Formal/Polite.`;

export const ARABIC_PROMPT = `Target Language: Arabic.
Cultural Context: Rich in greeting and blessing. Determine dialect if possible, otherwise MSA (Modern Standard Arabic).
Tone: Formal, Poetic.`;

// Generic generator for others to save space while maintaining quality instructions
const createGlobalPrompt = (lang: string, specificContext: string = "") => `
Target Language: ${lang}.
Cultural Context: ${specificContext || "Standard native fluency and cultural appropriateness."}
Tone: Natural, Native.
`;

export const VIETNAMESE_PROMPT = createGlobalPrompt("Vietnamese", "Respect hierarchy/age.");
export const THAI_PROMPT = createGlobalPrompt("Thai", "Use polite particles (Khrup/Ka).");
export const INDONESIAN_PROMPT = createGlobalPrompt("Indonesian", "Bahasa Indonesia. Formal or standard colloquial.");
export const BENGALI_PROMPT = createGlobalPrompt("Bengali");
export const PUNJABI_PROMPT = createGlobalPrompt("Punjabi");
export const TAMIL_PROMPT = createGlobalPrompt("Tamil", "Classical and respectful.");
export const URDU_PROMPT = createGlobalPrompt("Urdu", "Poetic, polite (Aap).");
export const MALAY_PROMPT = createGlobalPrompt("Malay");
export const TAGALOG_PROMPT = createGlobalPrompt("Tagalog/Filipino", "Use 'po' and 'opo' for respect.");
export const GUJARATI_PROMPT = createGlobalPrompt("Gujarati");
export const TELUGU_PROMPT = createGlobalPrompt("Telugu");
export const MARATHI_PROMPT = createGlobalPrompt("Marathi");

// Europe / Americas
export const ENGLISH_PROMPT = createGlobalPrompt("English", "Clear, standard English.");
export const SPANISH_PROMPT = createGlobalPrompt("Spanish", "Culturally neutral or region specific if detected.");
export const FRENCH_PROMPT = createGlobalPrompt("French", "Vous vs Tu awareness.");
export const GERMAN_PROMPT = createGlobalPrompt("German", "Sie vs Du awareness.");
export const PORTUGUESE_PROMPT = createGlobalPrompt("Portuguese");
export const ITALIAN_PROMPT = createGlobalPrompt("Italian");
export const RUSSIAN_PROMPT = createGlobalPrompt("Russian");
export const DUTCH_PROMPT = createGlobalPrompt("Dutch");
export const POLISH_PROMPT = createGlobalPrompt("Polish");
export const GREEK_PROMPT = createGlobalPrompt("Greek");
export const UKRAINIAN_PROMPT = createGlobalPrompt("Ukrainian");
export const SWEDISH_PROMPT = createGlobalPrompt("Swedish");
export const TURKISH_PROMPT = createGlobalPrompt("Turkish");
export const PERSIAN_PROMPT = createGlobalPrompt("Persian (Farsi)");
export const HEBREW_PROMPT = createGlobalPrompt("Hebrew");
export const KURDISH_PROMPT = createGlobalPrompt("Kurdish");
