# Code Smell Log

| Date | File | Smell | Fix |
|------|------|-------|-----|
| 2026-11-22 | backend/src/orders/orderStateMachine.js | Magic status strings and in-place order object mutation without audit trail | Extracted canonical status constants, enforced pure immutable transitions, and added deterministic statusHistory tracking |
