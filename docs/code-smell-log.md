# Code Smell Log

| Date | File | Smell | Fix |
|---|---|---|---|
| 2026-11-22 | backend/src/journey/pnrValidator.js | Loose trimming before regex test in prototype (`PNR_REGEX.test(pnr.trim())`) allowing leading/trailing spaces | Disallowed whitespace by checking exact length and applying strict regex without `.trim()` |
