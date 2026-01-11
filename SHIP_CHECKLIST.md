# SHIP CHECKLIST — AfriTalk Platform v1

What works:

- Core SDK (`afritalk-core`) with provider abstraction and Google provider fallback.
- REST API (`afritalk-api`) with bearer token auth and rate limiting.
- Eval harness (`afritalk-eval`) producing JSON output for language evaluations.
- Tokenizer scripts (`afritalk-tokenizer`) to train SentencePiece/BPE models from local corpora.
- Data ingestion & cleaning (`afritalk-data`) for local datasets, language detection, deduplication.
- Structured JSON logging across SDK, API, and eval runs.

Experimental:

- Language-specific safety rules included as configurable policies — initial rules are placeholders and should be extended by linguists.
- Provider abstraction supports Google GenAI out of the box; OpenAI/local providers are pluggable targets for future work.

Not supported yet:

- Production-grade tokenizer training infra (GPU orchestration) — scripts assume local Python + sentencepiece.
- Built-in dataset hosting or scraping (data must be provided locally).
- A built-in model training pipeline (model pretraining must be done separately).

Next steps before public release:

1. Populate language evaluation prompts and references for each supported language.
2. Extend safety rules and moderation lists per language with domain experts.
3. Add CI steps to run evals and linters on PRs.
4. Add automated tokenizer evaluation comparing token efficiency to GPT-style tokenizers.
