# padi-pm

A personal product management assistant for Nisha, built around the Padi file-based board at `padi-app-starter/docs/features/`.

## What It Does

Embeds Padi's product context, ticket standards, and PM workflow into every Claude session — so you get a board-aware PM assistant that writes tickets correctly without having to re-explain the rules each time.

## Components

### Skill: padi-pm

Loads automatically when you're doing Padi product work. Contains:
- Product north star and PM philosophy
- Board location (`docs/features/`) and ticket file conventions
- Tech stack reference
- Key product rules (tenant scoping, student/group exclusivity, section sequencing, etc.)
- Links to detailed ticket and UAT standards in references/

### Commands

| Command | What it does |
|---------|-------------|
| `/board-review` | Walks `docs/features/`, summarizes Done / In Progress / Backlog, flags blockers and open items, asks roadmap questions |
| `/write-ticket [description]` | Interactively drafts a Story, Task, Bug, or Epic as a file under `docs/features/<feature>/`, following Padi's ticket format |
| `/write-uat [KAN-XX]` | Generates a `*-uat.md` file next to the parent ticket with Given/When/Then scenarios grouped by Happy Path, Empty State, Error State, and Auth State |
| `/design-review [description]` | Two-phase review: first understands the design intent, then surfaces new tickets, modifications, and deprioritizations against the current board |

## Setup

No configuration required. The board lives in this repo at `padi-app-starter/docs/features/`.

## Usage

Use commands directly:
- `/board-review` — start any PM session with a board overview
- `/write-ticket Add a student progress export feature` — start drafting a ticket
- `/write-uat KAN-42` — generate a UAT file next to an existing ticket
- `/design-review` — paste or describe a design to get a ticket delta

The `padi-pm` skill also activates automatically when you ask about the Padi roadmap, KAN tickets, or product planning.
