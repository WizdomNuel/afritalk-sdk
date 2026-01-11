from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import torch
import sentencepiece as spm
from model import build_model

class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 64
    temperature: float = 0.8
    top_k: int = 50
    top_p: float = 0.95

app = FastAPI()

# Lazy-loaded model/tokenizer
MODEL = None
TOKENIZER = None

def load_local(model_path='final_checkpoint.pt', tokenizer_model='../../packages/afritalk-tokenizer/models/afritalk_spm.model'):
    global MODEL, TOKENIZER
    cfg = {'vocab_size': 32000, 'n_embd': 2048, 'n_layer': 24, 'n_head': 16, 'max_position_embeddings': 2048}
    model = build_model(cfg)
    if torch.cuda.is_available():
        model.to('cuda')
    if os.path.exists(model_path):
        ckpt = torch.load(model_path, map_location='cpu')
        model.load_state_dict(ckpt['model_state_dict'])
    sp = spm.SentencePieceProcessor(); sp.load(tokenizer_model)
    MODEL = model
    TOKENIZER = sp

@app.post('/generate')
def generate(req: GenerateRequest):
    global MODEL, TOKENIZER
    if MODEL is None or TOKENIZER is None:
        load_local()

    inputs = TOKENIZER.encode(req.prompt, out_type=int)
    input_ids = torch.tensor([inputs], dtype=torch.long)
    if torch.cuda.is_available(): input_ids = input_ids.cuda()

    MODEL.eval()
    with torch.no_grad():
        out = MODEL.generate(input_ids=input_ids, max_new_tokens=req.max_new_tokens, do_sample=True, temperature=req.temperature, top_k=req.top_k, top_p=req.top_p)
    tokens = out[0].cpu().tolist()
    text = TOKENIZER.decode(tokens)
    return {'text': text}

if __name__ == '__main__':
    import os
    uvicorn.run('infer_server:app', host='0.0.0.0', port=int(os.environ.get('LOCAL_MODEL_PORT', 8000)), log_level='info')
