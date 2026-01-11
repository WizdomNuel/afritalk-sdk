# FAILURE_MODES

Common failure modes and mitigations:

- Out of Memory: reduce `n_layer`, `n_embd`, enable smaller micro-batches, or use gradient checkpointing.
- Tokenizer mismatch: ensure `tokenizer_model` in `train_config.yaml` points to the correct `sentencepiece` model and `vocab_size` matches.
- Data skew: run language-balance checks before training. Remove over-represented files.
- Training instability: reduce LR, enable smaller warmup or increase warmup steps.
