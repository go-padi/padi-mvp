# Lovable Update 8 — Start Teaching page sync

The Start Teaching page (`/start-teaching`) needs one structural addition to match the deployed codebase. Everything else across the app is aligned. This is the only remaining gap.

---

## What to add

At the very bottom of the Start Teaching page (below the demo student and group cards), add a **"Ready for the full workspace?"** CTA card. This card should appear in the logged-out / preview state only.

### Card structure

A white card (`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm`) displayed as a horizontal flexbox row with space-between alignment:

**Left side (text):**
- Title: **"Ready for the full workspace?"** — `text-sm font-semibold text-gray-900`
- Subtitle: "Sign in to see your roster, take notes, and track assessments." — `text-xs text-gray-600`

**Right side (button):**
- Button text: **"Log in to unlock"**
- Style: `rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700`
- On click: opens the Sign In modal (same behavior as the "Add Students" and "Add Groups" buttons)

### Placement

Put this card as the last element on the page, after the demo student cards and demo group cards. It should be full-width within the content area, not inside a grid.

### Visual reference

```
┌──────────────────────────────────────────────────────────────┐
│  Ready for the full workspace?              [ Log in to unlock ]  │
│  Sign in to see your roster, take notes,                          │
│  and track assessments.                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## What NOT to change

Everything else on the Start Teaching page is correct:
- ✅ Title "Start Teaching" and subtitle
- ✅ Teaching mode toggle (Individual / Group / Both)
- ✅ "Add Students" and "Add Groups" buttons opening sign-in modal
- ✅ Demo data badge and "Example cards (click to explore)" label
- ✅ Example Student (Maya) and Example Group (Morning Readers) cards with "View lessons →"
- ✅ All other tabs (About Method, Phases, Assessments, Grouping, Resources) are aligned
- ✅ Homepage layout, content, CTA banner, footer
- ✅ Lesson detail colored sections and Teacher Notes placeholder
