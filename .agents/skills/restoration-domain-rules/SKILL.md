---
name: restoration-domain-rules
description: Domain rules for property restoration / water-damage apps (RestorFlow, SERVPRO-style). Use when building or editing room scoping, chamber volume, air mover or LGR dehumidifier sizing, IICRC S500 drying calcs, Work Authorization (EWA) or Direction to Pay (DOP) sign-off, or estimator vs client portal views.
---

# Restoration Industry Domain Rules

## When to use
- Calculating room/chamber metrics or drying equipment counts.
- Building client sign-off documents (EWA, DOP).
- Structuring the estimator (technician) and client (homeowner) views.

## Volumetric sizing
- Floor SF = Length × Width. Volume (CF) = Length × Width × Ceiling Height.
- Air movers = 1 per affected wall + 1 per 50–70 SF of wet floor. Use 70 SF as the default divisor unless the user picks otherwise; round each term up (`ceil`) — undersizing slows drying and fails S500 review.
- LGR dehumidifier pints/day = Volume ÷ class factor:

| Water class | Factor |
| --- | --- |
| Class 1 | 100 |
| Class 2 | 40 |
| Class 3 | 30 |
| Class 4 | 30 |

Example: 22 × 18 × 8 room = 396 SF, 3,168 CF. Class 2 → 3,168 ÷ 40 = 79.2 pints/day.

Keep these formulas in one pure module and cover each with a unit test; they drive billed quantities.

## Legal sign-off requirements
- **Work Authorization (EWA)** is valid only with: client signature, signing timestamp, and an IP reference. Block "signed" status if any is missing.
- **Direction to Pay (DOP)** is valid only with: carrier name, claim number, and an explicit carrier billing assignment statement (client directs carrier to pay the contractor). Block submission if any is missing.
- Mock IP references are acceptable in demo apps but must be shown on the signed record.

## Architecture
- Never add login screens or auth barriers unless the user explicitly asks — persona switching replaces auth.
- Keep one client-side shared state (context/store) consumed by both Estimator and Client views, so a change in one (scope edits, signatures) appears instantly in the other. Don't fork per-view copies of incident data.
