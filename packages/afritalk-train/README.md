# AfriTalk Training Experiment

This package contains a reproducible, low-cost experiment to train a small decoder-only Transformer from random initialization focused on African languages.

See `TRAINING_NOTES.md`, `COST_ESTIMATE.md`, and `FAILURE_MODES.md` for design rationale and operational notes.

Main scripts:
- `train.py` — training entrypoint
- `infer_server.py` — lightweight FastAPI inference server (used by `afritalk-core` provider when `provider=afritalk-local`)
- `eval_after_train.py` — run `afritalk-eval` against the local model
