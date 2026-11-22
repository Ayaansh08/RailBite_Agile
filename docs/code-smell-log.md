# Code Smell Log

| Date | File | Smell | Fix |
|------|------|-------|-----|
| 2026-11-22 | backend/src/orders/orderStateMachine.js | Magic status strings and in-place order object mutation without audit trail | Extracted canonical status constants, enforced pure immutable transitions, and added deterministic statusHistory tracking |
|---|---|---|---|
| 2026-11-22 | backend/src/journey/pnrValidator.js | Loose trimming before regex test in prototype (`PNR_REGEX.test(pnr.trim())`) allowing leading/trailing spaces | Disallowed whitespace by checking exact length and applying strict regex without `.trim()` |
| 2026-11-22 | backend/src/journey/journeyRouter.js | Prototype used ad-hoc mock calculation based on last digit modulo (`pnr.slice(-1) % MOCK_TRAINS.length`) coupled directly inside HTTP handler | Extracted domain lookups to `journeyService` with typed domain errors (`ValidationError`, `NotFoundError`) and structured lookup |
| 2026-11-22 | backend/src/journey/routeEngine.js | Prototype frontend hardcoded current and next stations to indices `[0]` and `[1]` (`journey.journeyStations[0]`) with no dynamic or time-based engine | Implemented pure `getUpcomingStations(journey, currentTime)` receiving an injected `currentTime`, supporting multi-day/midnight crossings and decomposing station status checks into clear helper functions |
