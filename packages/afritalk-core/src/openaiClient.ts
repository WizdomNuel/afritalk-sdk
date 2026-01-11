// Deprecated: All OpenAI client logic is now centralized in Client.ts
// This file is kept to prevent import errors during transition if any custom implementation depended on it,
// though internal SDK usage has been migrated.
export const getOpenAIClient = () => {
    throw new Error("getOpenAIClient is deprecated. Please use AfriTalkClient.");
}
