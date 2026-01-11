# COST_ESTIMATE

This experiment is designed to be low-cost and runnable on a single GPU (A100/80GB or A10/24GB). Estimated costs:

- Single GPU (A10 24GB) spot instance: ~$0.30–0.75/hr
- Expected wallclock (small corpus, 3 epochs): 6–24 hours depending on corpus size
- Estimated cost: $5–$20 (spot) to validate pipeline

Notes:
- Use small vocab and pruning for quick iteration. Increase epochs only after validating stability.
