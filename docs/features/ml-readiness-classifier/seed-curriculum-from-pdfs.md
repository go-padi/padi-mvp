---
id: KAN-67
title: "Part 3: Extract curriculum from PDFs and populate seed script"
type: task
status: done
priority: medium
feature: ml-readiness-classifier
epic: KAN-61
jira_ref: https://go-padi.atlassian.net/browse/KAN-67
created: 2026-03-06
updated: 2026-03-08
---

# KAN-67 — Part 3: Extract curriculum from PDFs and populate seed script

## Description

### Goal\\n\\nRewrite `scripts/seed-curriculum.ts` to contain all 328 modules extracted from the Group and Individual curriculum PDFs, with no phase hierarchy.\\n\\n### Requirements\\n\\n1. Read both PDFs and extract every module:\\n   - `docs/curriculum/group.pdf` — 172 modules across 16 lesson groups\\n   - `docs/curriculum/ind.pdf` — 156 modules across 16 lesson groups\\n2. Each module follows a table format with: Code + Title, Materials, Aim, Presentation, Extension, Summary/Notes\\n3. Rewrite seed script with flat structure:\\n   - Top level: array of `module_group` objects (no phase wrapper)\\n   - Each group contains its `modules` array\\n   - Group codes: `K_LS`, `K_RMG`, `K_WS`, `K_SYL`, `K_IS`, `K_FS`, `K_MS`, `K_CS`, `K_AL`, `K_P`, `K_R`, `K_RE`, `K_HW`, `K_S`, `K_SE`, `K_VCF` (group mode)\\n   - Individual codes: `K_IND_LS`, `K_IND_RMG`, etc.\\n   - Module codes: PDF codes directly for group (LS-1), prefixed IND\_ for individual (IND_LS-1)\\n4. Module `lesson` JSON format (use LS-1 as template):\\n   `json\n   {\n     \"materials\": [\"item1\", \"item2\"],\n     \"aims\": [\"aim1\", \"aim2\"],\n     \"presentation_steps\": [\"step1\", \"step2\"],\n     \"examples\": [\"word1\", \"word2\"],\n     \"extension\": [\"activity1\"]\n   }\n   `\\n5. Run `pnpm seed:curriculum` to verify\\n\\n### Module Counts\\n\\n**Group (172 total):**\\nLS: 11, RMG: 19, WS: 9, SYL: 17, IS: 17, FS: 7, MS: 2, CS: 6, AL: 22, P: 7, R: 8, RE: 9, HW: 11, S: 9, SE: 9, VCF: 9\\n\\n**Individual (156 total):**\\nLS: 6, RMG: 19, WS: 7, SYL: 15, IS: 14, FS: 6, MS: 2, CS: 4, AL: 22, P: 7, R: 8, RE: 9, HW: 10, S: 9, SE: 9, VCF: 9\\n\\n### Acceptance Criteria\\n\\nGiven `pnpm seed:curriculum` runs\\nWhen I query `module_group`\\nThen 32 groups exist (16 group-mode + 16 individual-mode)\\n\\nGiven I query modules for group code `K_RMG`\\nThen 19 modules exist: RMG-1 through RMG-19\\n\\nGiven I query any module\\nThen it has a non-null `lesson` JSONB with at minimum `materials` and `aims` arrays\\n\\n### Notes\\n\\n- See `docs/KAN-61-claude-code-prompt.md` for detailed extraction guide\\n- LS-1 in current seed script (lines 42-77) is the gold standard format\\n- If PDF extraction is imperfect, prioritize correct code/title/teaching_mode/display_order — lesson JSON can be iteratively improved\\n- Skip appendix content (Pictures, Phonogram Cards, Materials List, Lesson Planning)\\n- Depends on Part 1 (schema migration) being done first">

## Comments

_No comments in Jira at time of migration._
