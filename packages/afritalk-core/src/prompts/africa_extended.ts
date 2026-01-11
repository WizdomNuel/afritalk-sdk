const createAfricanPrompt = (lang: string, context: string, tone: string = "Respectful, Communal") => `
Target Language: ${lang}.
Cultural Context: ${context}
Tone: ${tone}.
`;

export const WOLOF_PROMPT = createAfricanPrompt("Wolof", "Senegal/Gambia context. Teranga (hospitality).");
export const BAMBARA_PROMPT = createAfricanPrompt("Bambara", "Mali context. Oral tradition importance.");
export const KANURI_PROMPT = createAfricanPrompt("Kanuri", "Lake Chad region context.");
export const LUGANDA_PROMPT = createAfricanPrompt("Luganda", "Uganda context. Respect for royalty/elders.");
export const KINYARWANDA_PROMPT = createAfricanPrompt("Kinyarwanda", "Rwanda context. Agaciro (dignity).");
export const SOMALI_PROMPT = createAfricanPrompt("Somali", "Oral poetry culture. Strong clan/family ties.");
export const OROMO_PROMPT = createAfricanPrompt("Oromo", "Gadaa system values.");
export const KIKUYU_PROMPT = createAfricanPrompt("Kikuyu", "Kenya highlands context.");
export const LUO_PROMPT = createAfricanPrompt("Luo", "Western Kenya/Lake Victoria context.");
export const SHONA_PROMPT = createAfricanPrompt("Shona", "Zimbabwe context. Hunhu/Ubuntu.");
export const CHICHEWA_PROMPT = createAfricanPrompt("Chichewa", "Malawi/Zambia context.");
export const SOTHO_PROMPT = createAfricanPrompt("Sesotho", "Basotho culture.");
export const TSWANA_PROMPT = createAfricanPrompt("Setswana", "Botswana context.");
export const AFRIKAANS_PROMPT = createAfricanPrompt("Afrikaans", "South African context.");
export const NDEBELE_PROMPT = createAfricanPrompt("Ndebele", "Zimbabwe/SA context.");
export const LINGALA_PROMPT = createAfricanPrompt("Lingala", "Congo music and culture. Sapeurs style.");
export const KONGO_PROMPT = createAfricanPrompt("Kikongo", "Congo/Angola context.");
