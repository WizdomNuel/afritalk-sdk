import { AfriTalkClient } from 'afritalk-core';

export interface EvalRunnerConfig { provider?: string }

const LANG_PROMPTS: Record<string, string[]> = {
  swahili: [
    'Translate the following sentence into Swahili: "The market opens at dawn."',
    'Rewrite the following in a polite, formal Swahili tone: "Send me the file."'
  ],
  yoruba: [
    'Translate into Yoruba: "Where is the nearest hospital?"',
    'Is this sentence natural in Yoruba: "Mo fe ra akara loni"? Respond with a short comment.'
  ]
};

export class EvalRunner {
  config: EvalRunnerConfig;
  client: any;
  constructor(config: EvalRunnerConfig = {}){
    this.config = config;
    this.client = new AfriTalkClient({ apiKey: process.env.API_KEY, provider: config.provider });
  }

  async scoreResponse(reference: string, candidate: string, language: string) {
    // Basic heuristics + placeholder for human-in-the-loop
    const scores = {
      fluency: 4,
      cultural: 4,
      literal_translation: 5,
      tone: 4,
      hallucination: 5
    };
    return scores;
  }

  async runLanguageEval(language: string) {
    const prompts = LANG_PROMPTS[language] || LANG_PROMPTS['swahili'];
    const metadata: any = { language, provider: this.config.provider || process.env.PROVIDER || 'google', results: [] };

    for (const p of prompts) {
      console.log(JSON.stringify({ level: 'info', message: 'Running eval prompt', language, prompt: p }));
      const res = await this.client.chat.create({ message: p, language });
      const score = await this.scoreResponse('reference', res.text || '', language);
      metadata.results.push({ prompt: p, response: res.text, score });
    }

    return metadata;
  }
}
