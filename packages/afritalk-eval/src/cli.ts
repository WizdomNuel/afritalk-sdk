#!/usr/bin/env node
import { EvalRunner } from './evalRunner';

async function main() {
  const args = process.argv.slice(2);
  const lang = args[0] || 'swahili';
  const provider = args[1] || process.env.PROVIDER || 'google';

  const runner = new EvalRunner({ provider });
  const results = await runner.runLanguageEval(lang);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
