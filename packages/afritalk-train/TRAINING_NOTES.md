# TRAINING_NOTES

This experiment trains a decoder-only Transformer from random initialization to validate tokenizer, data pipeline, and training stability.

Key design choices:
- Small GPT2-style model via `transformers.GPT2LMHeadModel` (~150M-300M depending on config).
- Streaming dataset using `sentencepiece` tokenization of `afritalk-data` outputs.
- Mixed precision with `torch.cuda.amp` and gradient accumulation for single-GPU runs.
- Checkpointing every `save_every_steps` and final `final_checkpoint.pt` saved.

How to run (example):

```
python -m venv .venv
pip install -r packages/afritalk-train/requirements.txt
export TRAIN_CONFIG=packages/afritalk-train/configs/train_config.yaml
python packages/afritalk-train/train.py
```

To serve the trained model locally for evaluation:

```
python packages/afritalk-train/infer_server.py
```
