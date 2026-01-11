import os
import sys
import yaml
import math
import time
import torch
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.cuda.amp import GradScaler, autocast

from model import build_model
from dataset import StreamingDataset

def load_config(path):
    with open(path, 'r', encoding='utf8') as f:
        return yaml.safe_load(f)

def collate_fn(batch):
    # pad to max length in batch
    max_len = max(len(b) for b in batch)
    input_ids = [b + [0]*(max_len - len(b)) for b in batch]
    attention_mask = [[1]*len(b) + [0]*(max_len - len(b)) for b in batch]
    return torch.tensor(input_ids, dtype=torch.long), torch.tensor(attention_mask, dtype=torch.long)

def main():
    cfg = load_config(os.environ.get('TRAIN_CONFIG', 'configs/train_config.yaml'))
    model_cfg = cfg['model']
    train_cfg = cfg['training']
    data_cfg = cfg['data']

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    print('Building model...')
    model = build_model(model_cfg)
    model.to(device)

    tokenizer_model = data_cfg['tokenizer_model']
    dataset = StreamingDataset(data_cfg['train_data_dir'], tokenizer_model, seq_len=1024)

    # simple train/val split by file indices (streaming-friendly)
    files = list(dataset.files)
    split = max(1, int(len(files) * data_cfg.get('val_split_ratio', 0.01)))

    train_files = files[split:]
    val_files = files[:split]

    train_dataset = StreamingDataset(data_cfg['train_data_dir'], tokenizer_model, seq_len=1024)

    batch_size = train_cfg['micro_batch_size']
    grad_accum = train_cfg.get('gradient_accumulation_steps', 1)

    optimizer = AdamW(model.parameters(), lr=train_cfg['lr'], weight_decay=train_cfg.get('weight_decay', 0.0))
    scaler = GradScaler()

    model.train()

    step = 0
    total_steps = train_cfg.get('epochs', 1) * 100000

    accum_steps = train_cfg.get('gradient_accumulation_steps', 1)

    for epoch in range(train_cfg.get('epochs', 1)):
        t0 = time.time()
        batch = []
        for chunk in train_dataset:
            batch.append(chunk)
            if len(batch) >= batch_size:
                input_ids, attention_mask = collate_fn(batch)
                input_ids = input_ids.to(device)
                attention_mask = attention_mask.to(device)

                with autocast(enabled=device.type=='cuda'):
                    outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=input_ids)
                    loss = outputs.loss / accum_steps

                scaler.scale(loss).backward()

                if (step + 1) % accum_steps == 0:
                    scaler.unscale_(optimizer)
                    torch.nn.utils.clip_grad_norm_(model.parameters(), train_cfg.get('max_grad_norm', 1.0))
                    scaler.step(optimizer)
                    scaler.update()
                    optimizer.zero_grad()

                if step % train_cfg.get('save_every_steps', 1000) == 0 and step > 0:
                    ckpt = {'model_state_dict': model.state_dict(), 'optimizer_state_dict': optimizer.state_dict(), 'step': step}
                    torch.save(ckpt, f'checkpoint_{step}.pt')
                    print('Saved checkpoint', step)

                if step % train_cfg.get('eval_steps', 500) == 0 and step > 0:
                    # quick eval: compute loss on a small sample
                    model.eval()
                    try:
                        v = next(iter(train_dataset))
                        vi, vm = collate_fn([v])
                        vi = vi.to(device); vm = vm.to(device)
                        with torch.no_grad():
                            out = model(input_ids=vi, attention_mask=vm, labels=vi)
                            print('Eval step', step, 'loss', out.loss.item())
                    except Exception:
                        pass
                    model.train()

                step += 1
                batch = []

        print(f'Epoch {epoch} finished in {time.time()-t0:.1f}s')

    # final save
    torch.save({'model_state_dict': model.state_dict(), 'step': step}, 'final_checkpoint.pt')
    print('Training finished, saved final_checkpoint.pt')

if __name__ == '__main__':
    main()
