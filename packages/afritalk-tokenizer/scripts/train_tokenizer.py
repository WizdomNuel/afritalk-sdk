#!/usr/bin/env python3
import sys
from pathlib import Path
import sentencepiece as spm

def main():
    if len(sys.argv) < 4:
        print('Usage: train_tokenizer.py <corpus> <model_prefix> <output_dir>')
        sys.exit(1)
    corpus = sys.argv[1]
    prefix = sys.argv[2]
    out = Path(sys.argv[3])
    out.mkdir(parents=True, exist_ok=True)
    model_file = out / f"{prefix}.model"
    spm.SentencePieceTrainer.Train(f"--input={corpus} --model_prefix={out / prefix} --vocab_size=32000 --character_coverage=0.9995 --model_type=bpe")
    print('Trained model at', model_file)

if __name__ == '__main__':
    main()
