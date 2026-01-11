import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import franc from 'franc-min';

const INPUT_DIR = process.env.INPUT_DIR || '../../data/raw';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './processed';

function detectLanguage(text: string) {
  const code = franc(text, { minLength: 10 });
  return code === 'und' ? 'unknown' : code;
}

function ingest() {
  const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.txt'));
  for (const f of files) {
    const p = join(INPUT_DIR, f);
    const txt = readFileSync(p, 'utf8');
    const lang = detectLanguage(txt);
    const outFile = join(OUTPUT_DIR, `${f}.json`);
    writeFileSync(outFile, JSON.stringify({ file: f, language: lang, text: txt }));
    console.log('Processed', f, '->', outFile);
  }
}

ingest();
