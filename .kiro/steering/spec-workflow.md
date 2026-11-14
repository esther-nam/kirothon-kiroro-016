# Spec-Driven Development Workflow

## Approach: requirements-first
For each feature, work in this order and stop for user approval between phases:
1. `requirements.md`: user stories with acceptance criteria
2. `design.md`: architecture, data model, API, edge-case handling
3. `tasks.md`: small, ordered, testable implementation tasks

No application code is written before the feature's requirements and design are approved.

## Requirements format
- User stories: "As a <role>, I want <goal>, so that <benefit>."
- Acceptance criteria in EARS style: "WHEN <condition> THEN the system SHALL <behavior>."
- Every requirements doc ends with an **Edge Cases** section and an **Out of Scope** section.
- Each criterion must be testable and uniquely numbered (e.g. R3.2).

## Mandatory edge-case checklist
Every feature spec must explicitly address, or mark not-applicable:
- Overlapping or adjacent intervals (half-open `[start, end)` semantics)
- Time zones and DST transitions (spring-forward gap, fall-back repeat), and members in different zones
- Concurrent actions (two members confirming overlapping slots, simultaneous edits)
- Team size limits (2 to 6) and membership changes mid-flow
- Privacy: what each role can and cannot see
- Empty states and invalid input
- Retries and idempotency

## Definition of done (per task)
- Code matches the approved design
- Tests for the relevant acceptance criteria exist and pass
- Build and lint pass
- Steering conventions followed

## Scope discipline
- MVP first. Anything not required by the MVP goes to "Out of Scope" and is logged for a later spec.
- Cross-feature rules belong in steering, not duplicated in feature specs. Feature specs link to steering instead.
