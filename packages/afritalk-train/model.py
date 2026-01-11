import torch
import torch.nn as nn
from transformers import GPT2Config, GPT2LMHeadModel

def build_model(config: dict) -> GPT2LMHeadModel:
    # Map experiment config to HF GPT2Config
    gconf = GPT2Config(
        vocab_size=config.get('vocab_size', 32000),
        n_embd=config.get('n_embd', 2048),
        n_layer=config.get('n_layer', 24),
        n_head=config.get('n_head', 16),
        n_positions=config.get('max_position_embeddings', 2048),
        bos_token_id=0,
        eos_token_id=1
    )

    model = GPT2LMHeadModel(gconf)

    # Enable gradient checkpointing for memory savings
    try:
        model.gradient_checkpointing_enable()
    except Exception:
        pass

    return model
