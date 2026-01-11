# AfriTalk Data

Data ingestion and processing utilities. Expect locally-provided corpora; no scraping.

Pipeline:
- `ingest.ts` — detect language and format raw text into JSON
- `clean.ts` — deduplicate and basic cleaning

Dataset versioning: use folder names like `v1.0` and keep a `manifest.json` alongside processed data.
