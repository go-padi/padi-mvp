---
id: LR-25
title: "[Marketing] Homepage rewrite #2 — match updated go-padi.com (Accelerate framing)"
type: task
status: done
priority: highest
feature: launch-readiness
launch_blocker: true
created: 2026-05-13
created_by: founder-direction-2026-05-13
supersedes_part_of: LR-15, LR-16
related: LR-26 (3-signal vocab migration)
---

### Goal

go-padi.com was updated to lead with **"Accelerate your child's
reading"** as the core promise — forward-looking, affirmative,
positioning Padi as a tool that moves every reader faster, not just
a diagnostic. LR-15 and LR-16 shipped earlier homepage copy that's
now stale. This rewrites `app/page.tsx` to match.

### Background

Fetched go-padi.com on 2026-05-13. Key positioning shifts since
LR-15/LR-16 shipped:

- **Verb shift:** "Spot reading gaps" → "Accelerate reading"
- **Audience tone:** clinical/diagnostic → affirmative/forward
- **3-signal vocabulary:** Ready/Needs Help/Needs Intervention → Accelerating/Practicing/Specialist Track (see LR-26 for the full vocab migration — this ticket only needs to use the new strings on the homepage)
- **New sections:** "Why Padi," 6-card feature grid (was 3), 3-step "How It Works," "Built by a teacher" Mona Iyer story, final CTA

### Canonical copy (captured from go-padi.com on 2026-05-13)

**Page meta**
- `<title>`: `Padi — Accelerate Reading for Ages 3–7`
- meta description: `A multisensory reading program for ages 3–7, built on the Science of Reading. Padi accelerates every child's reading — moving ready readers forward faster, and giving emerging readers exactly the practice they need.`

**Hero**
- Eyebrow chip: `Now in free early access`
- H1: `Accelerate your child's reading.`
- Subtitle: `A multisensory reading program for ages 3–7, built on the Science of Reading. Padi adapts to every child — moving ready readers forward faster, and giving emerging readers exactly the practice they need.`
- Primary CTA: `Get Free Early Access`
- Disclaimer below CTA: `Free during early access. No credit card needed.`
- Trust tagline: `Built on the Science of Reading · Multisensory · Designed by a 25-year reading specialist`

**Why Padi (new section)**
- H2: `Why Padi`
- H3: `Most reading programs teach every child the same way.`
- Body: `Kids ready to fly get held back. Kids who need more time get rushed. By kindergarten, the differences add up. Padi gives every child the right pace — and gives teachers a clear view of where each one is, in real time.`
- Three signal pills (uses new vocab from LR-26):
  - 🟢 **Accelerating** — On track to read sooner
  - 🟡 **Practicing** — Locking in foundational skills
  - 🔴 **Specialist Track** — Recommended for closer review
- Tagline: `A clear signal for every student, every lesson.`

**Features grid (6 cards, replacing current 3)**
H2: `Everything an early childhood teacher needs`
Subtitle: `Structured lessons, real-time insights, and zero prep time.`

| Icon | Title | Body |
|---|---|---|
| 🎨 | Multisensory Lessons | Visual, auditory, and kinesthetic activities that engage every learner — grounded in Orton-Gillingham methodology. |
| 📊 | Real-Time Student Signals | See at a glance which students are on track and who needs extra support. No manual tracking needed. |
| 🔄 | Adaptive Learning Paths | Lessons adjust automatically based on each student's progress — every child moves at their own pace. |
| ⏱️ | Zero Prep Time | Structured, ready-to-teach lessons that fit your existing schedule. Open the app and go. |
| 🔗 | Seamless Referrals | When a student needs specialist support, Padi generates the data to make that handoff smooth. |
| 📚 | Science of Reading | Every lesson is built on evidence-based reading research — phonemic awareness, phonics, fluency, and comprehension. |

**How It Works (new section)**
H2: `Simple for you. Powerful for your students.`
Subtitle: `Get started in minutes, not hours.`

1. **Sign up & add your students** — Create your free account and add your class roster. It takes less than five minutes.
2. **Teach with structured lessons** — Open a lesson and follow the multisensory prompts. Each session is 10–15 minutes, ready to go.
3. **See every student's path — instantly** — After each lesson, Padi shows you exactly where each student is — accelerating, practicing, or ready for closer review.

**About Mona (new section)**
H2: `Built by a teacher, for teachers.`
Body: `Padi was created by Mona Iyer, a reading specialist with over 25 years of classroom experience and certifications including AMS, CDT, and CALT. After decades of teaching, Mona built Padi to give every early childhood teacher the tools to accelerate every reader — and recognize early which kids deserve more time, so they get it before kindergarten.`

**Final CTA**
H2: `Ready to accelerate every reader?`
Body: `Join our free early access program and accelerate every reader in your classroom.`
CTA: `Get Free Early Access`
Disclaimer: `Free during early access. No credit card needed.`

**Footer**
`© 2026 Padi · Made in DC · hello@go-padi.com`

### Requirements

1. **Replace `app/page.tsx`** with the canonical copy above. Match
   wording exactly (don't paraphrase). Each section is structured
   per the layout the marketing site uses.
2. **Preserve role-awareness from LR-20.** If `useAuth().role === 'parent'`,
   any teacher-flavored language ("teachers of 3- to 7-year-olds")
   should swap to parent-flavored via `rolePhrase()`. Today's hero
   says "for teachers of 3- to 7-year-olds" — adapt accordingly.
3. **Preserve homepage age-range = 3–7** per the prior decision.
   Don't reintroduce "K-2 (ages 5-7)" or "ages 3-4."
4. **Three signal pills use the new vocab** (Accelerating / Practicing / Specialist Track). This depends on LR-26 establishing the canonical strings. Reference whatever `assessmentStatusCopy.ts` exports after LR-26 ships.
5. **Mobile-first (375×667).** Hero above the fold, no horizontal scroll, 6-card grid stacks to single column on mobile.
6. **Update page metadata** (title + meta description) per the canonical copy.

### Acceptance Criteria

**Happy Path**
Given a logged-out visitor lands on `/`
When the hero renders
Then it matches go-padi.com word-for-word (hero, subtitle, eyebrow, CTAs, disclaimers)
And the "Why Padi" section appears with the three signal pills
And the 6-card feature grid renders (3-card grid is replaced)
And the 3-step "How It Works" section appears
And the "Built by a teacher" Mona section appears
And the final CTA section appears
And the footer reads `© 2026 Padi · Made in DC · hello@go-padi.com`

**Role-aware Adjustments**
Given a logged-in parent
When they land on `/`
Then teacher-flavored language is substituted with parent-flavored via `rolePhrase()`
And the rest of the page is unchanged

**Mobile**
At 375×667, hero fits above fold, 6-card grid stacks cleanly, no horizontal scroll.

**SEO**
`<title>` and `<meta description>` match go-padi.com exactly.

### Out of Scope

- Migrating the 3-signal vocabulary across the rest of the app (that's LR-26)
- Updating `/teacher/about` (that's LR-27)
- Updating curriculum card copy in LR-18/LR-24 (handled by spec updates in those tickets)
- Updating the Padi-pm skill or any agent-facing docs (separate meta-task)
- Adding new imagery, illustrations, or photography (separate creative-asset ticket if desired)

### Notes

- File to edit: `app/page.tsx` (single file rewrite)
- Trust tagline ("Built on the Science of Reading · Multisensory · Designed by a 25-year reading specialist") replaces the gradient-text headline treatment from the current hero — simpler, more credible
- The 3-signal pills color treatment (🟢🟡🔴) is already established in `lib/copy/assessmentStatusCopy.ts` — once LR-26 ships the renamed types, the pills come for free
- LR-25 and LR-26 should ship together or LR-25 right after LR-26 — the pills section breaks if LR-26 hasn't established the strings
- Mona's certifications: AMS (American Montessori Society), CDT (Certified Dyslexia Therapist), CALT (Certified Academic Language Therapist) — use the abbreviations as the site does, don't expand them
