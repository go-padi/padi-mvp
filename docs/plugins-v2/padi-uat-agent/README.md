# Padi UAT Agent

A ruthlessly critical UAT testing agent for the Padi app. It tests deployed features against their acceptance criteria, files detailed bug tickets as files under `docs/features/`, and hands findings off to engineering and design.

## Components

### Command: `/run-uat`
Kicks off a UAT session for a Padi ticket. Locates the ticket by id in `docs/features/`, builds a test plan, executes scenarios, files bugs as files, and delivers a pass/fail verdict.

Usage: `/run-uat KAN-42` (or pass a UAT filename directly).

### Agent: uat-tester
The autonomous execution engine. Opens the Padi app in Chrome, tests every scenario, falls back to code review when needed, and documents everything with evidence directly in the UAT file.

### Skill: uat-testing
Domain knowledge for UAT testing — Padi product rules, severity classification, testing checklists, the bug ticket template, and the critical evaluation mindset.

## How It Works

1. You invoke `/run-uat KAN-42` or point at a `<slug>-uat.md` file.
2. The agent locates the UAT file and its parent ticket in `docs/features/`, extracts all acceptance criteria.
3. It builds a test plan — including scenarios the ticket author missed.
4. You approve the test plan.
5. The agent executes every scenario against the live app via Chrome.
6. For anything Chrome can't verify, it reviews the source code.
7. Every failure becomes a new bug file under the feature folder (or `docs/features/bugs/` if foundational), drafted via `/write-ticket`.
8. The agent edits the UAT file in place: flips each scenario's `Status:`, adds evidence, and appends a `## Run history` entry.
9. You get a verdict: PASS, FAIL, or BLOCKED.

## Requirements

- Access to `padi-app-starter/docs/features/` (the board).
- Claude in Chrome (for live app testing).
- Access to the Padi codebase (for code review fallback).

## Bug Filing Logic

- **Feature folder** (`docs/features/<feature>/`): bugs specific to the feature being tested.
- **`docs/features/bugs/`**: foundational issues (auth, tenant scoping, routing, shared components).
