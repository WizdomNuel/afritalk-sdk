import { GoogleGenAI } from "@google/genai";
import { logger } from "./utils/logger.js";

export interface ProviderConfig { provider?: string; apiKey?: string }

// Minimal provider wrapper that exposes the same `models` and `live` surfaces
export function createProviderFromConfig(cfg: ProviderConfig) {
  const providerName = (cfg.provider || process.env.PROVIDER || 'google').toLowerCase();
  const apiKey = cfg.apiKey || process.env.API_KEY;

  function makeGoogle() {
    logger.info('Initializing Google provider');
    return new GoogleGenAI({ apiKey });
  }

  try {
    if (providerName === 'google') return makeGoogle();
    if (providerName === 'afritalk-local') {
      // Local model is expected to expose a simple HTTP `/generate` endpoint.
      const localUrl = process.env.LOCAL_MODEL_URL || `http://localhost:${process.env.LOCAL_MODEL_PORT || '8000'}`;
      logger.info('Using local model provider', { url: localUrl });

      // Minimal wrapper around a local HTTP inference server
      const fetch = (globalThis as any).fetch || require('node-fetch');
      return {
        models: {
          async generateContent(opts: any) {
            const prompt = typeof opts.contents === 'string' ? opts.contents : (opts.contents?.text || opts.contents?.parts?.map((p:any)=>p.text||'').join('\n') || '');
            const resp = await fetch(`${localUrl}/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, max_new_tokens: opts.max_new_tokens || 128, temperature: opts.config?.temperature || 0.8, top_k: opts.config?.top_k || 50, top_p: opts.config?.top_p || 0.95 })
            });
            const j = await resp.json();
            return { text: j.text };
          },
          async generateContentStream() {
            throw new Error('Streaming not supported for local provider');
          }
        }
      };
    }
    // Future: wire up OpenAI here
    logger.warn('Requested provider not implemented, falling back to Google', { requested: providerName });
    return makeGoogle();
  } catch (err: any) {
    logger.error('Provider init failed, fallback to builtin', { error: err?.message });
    return makeGoogle();
  }
}
