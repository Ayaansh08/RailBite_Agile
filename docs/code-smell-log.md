# Code Smell Log

| Date | File | Smell | Fix |
|------|------|-------|-----|
| 2026-11-25 | backend/src/vendors/vendorService.js | Duplicate validation logic and non-deterministic array ordering in prototype | Centralized station code normalization/validation and extracted deterministic sortVendorsByName helper |
