import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const INPUT_DIR = process.env.INPUT_DIR || './processed';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './cleaned';

function dedupe(text: string) {
  const seen = new Set<string>();
  return text
    .split('\n')
    .filter(l => { if (!l) return false; if (seen.has(l)) return false; seen.add(l); return true; })
    .join('\n');
}

function clean() {
  const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const p = join(INPUT_DIR, f);
    const obj = JSON.parse(readFileSync(p, 'utf8'));
    obj.text = dedupe(obj.text || '');
    const outFile = join(OUTPUT_DIR, f);
    writeFileSync(outFile, JSON.stringify(obj, null, 2));
    console.log('Cleaned', f, '->', outFile);
  }
}

clean();
