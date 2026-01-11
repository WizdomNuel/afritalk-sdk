import os
import json
from typing import Iterator, List
import sentencepiece as spm

class StreamingDataset:
    def __init__(self, data_dir: str, tokenizer_model: str, seq_len: int = 1024):
        self.data_dir = data_dir
        self.tokenizer = spm.SentencePieceProcessor()
        self.tokenizer.load(tokenizer_model)
        self.seq_len = seq_len
        self.files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith('.json')]

    def tokenize_text(self, text: str) -> List[int]:
        ids = self.tokenizer.encode(text, out_type=int)
        return ids

    def __iter__(self) -> Iterator[List[int]]:
        for f in self.files:
            try:
                obj = json.load(open(f, 'r', encoding='utf8'))
                text = obj.get('text', '')
                ids = self.tokenize_text(text)
                # yield chunks
                for i in range(0, max(1, len(ids)), self.seq_len):
                    chunk = ids[i:i+self.seq_len]
                    if len(chunk) < 2: continue
                    yield chunk
            except Exception as e:
                print('Skipping', f, 'err', e)
