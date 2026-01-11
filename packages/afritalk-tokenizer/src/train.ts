import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || '../../data';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './models';

function trainSentencePiece(corpusPath: string, modelPrefix: string) {
  // This script expects Python and sentencepiece installed in the environment.
  const cmd = 'python';
  const args = ['-u', 'scripts/train_tokenizer.py', corpusPath, modelPrefix, OUTPUT_DIR];
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.status !== 0) throw new Error('SentencePiece training failed');
}

function main() {
  const corpus = process.argv[2] || join(DATA_DIR, 'corpus.txt');
  if (!existsSync(corpus)) {
    console.error('Corpus not found:', corpus);
    process.exit(1);
  }
  trainSentencePiece(corpus, 'afritalk_spm');
}

main();
