# padi-design

Design Lead and research synthesis engine for padi. Anchors every decision to the north star: enable teachers and parents to determine if a child is first-grade ready, needs help, or needs serious intervention.

## What it does

This plugin gives Claude the role of Design Lead for the padi app. It processes user research, reviews designs (staging URLs, PR previews, screenshots), spars on roadmap priorities with padi-pm, and prepares engineering handoff briefs — all through the lens of padi's north star.

## Commands

| Command | Description |
|---------|-------------|
| `/padi-design:synthesize` | Synthesize a user research transcript into a structured design brief |
| `/padi-design:design-review` | Review a staging URL, PR preview, screenshot, or user flow against the north star |
| `/padi-design:roadmap-spar` | Spar with padi-pm on roadmap priorities using the file-based board at `docs/features/` |
| `/padi-design:eng-brief` | Generate a complete engineering handoff brief for a feature |
| `/padi-design:status` | Snapshot of research, designs, roadmap state, and open questions |

## Skills

| Skill | Trigger |
|-------|---------|
| **north-star** | Always active when evaluating any feature, screen, or roadmap item |
| **research-synthesis** | Automatically when a research transcript or feedback document is shared |
| **design-review** | Automatically when a staging URL, PR preview URL, screenshot, or flow description is shared |
| **pm-sparring** | When discussing roadmap priorities, epic sequencing, or ticket scope |
| **eng-handoff** | When preparing a feature for development handoff |

## Setup

- **Board** — `pm-sparring` and `/padi-design:roadmap-spar` read `padi-app-starter/docs/features/` directly. No external tracker.
- **Claude in Chrome** — `design-review` opens staging / PR preview URLs with Claude in Chrome. Ensure the Chrome extension is connected.
- **Codebase source of truth** — comparisons run against `github.com/go-padi/padi-mvp` (main branch), fetched via `raw.githubusercontent.com` or the GitHub tree API.

## Usage

Upload a research transcript and the research-synthesis skill activates automatically. Or use commands directly:

- `/padi-design:synthesize` with an attached transcript
- `/padi-design:design-review https://staging.padi.whatever/teacher/curriculum` — walks the page and reviews it against the codebase
- `/padi-design:design-review` with an attached screenshot or flow description
- `/padi-design:roadmap-spar KAN-42` to evaluate a specific ticket
- `/padi-design:eng-brief student progress dashboard` to generate a handoff brief
- `/padi-design:status` for a session overview
