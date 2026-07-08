# UAPP Academy — Knowledge Hub Creation Flow Redesign

> A modern, guided content-authoring experience for Courses, Tutorials, and
> Resources — built to feel like Udemy/Coursera while staying native to the
> existing UAPP Academy design language.

---

## 0. TL;DR — what changed and why

| Before                                              | After                                                                                                   | Why it matters                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| One generic "Upload Document" flow                  | Three purpose-built tracks (Course / Tutorial / Resource) chosen up front                               | The system now matches the user's mental model. A course author and a "drop a PDF" author have opposite needs; one flow served neither well. |
| Horizontal 3-step stepper (File → Details → Review) | **Vertical progress sidebar** with a sticky footer; steps adapt per type                                | Vertical rail scales to 4–5 steps, shows sub-labels, survives on mobile as a drawer, and lets users jump back to visited steps.              |
| One giant details form                              | **Sectioned form** (General / Media / Metadata / Visibility / SEO)                                      | Chunking lowers cognitive load and perceived effort, and groups validation errors.                                                           |
| "Module Name" text field                            | **Udemy-style Curriculum Builder** (sections → lessons, drag reorder, collapse)                         | Real course structure, typed lessons (Video/PDF/Quiz/Assignment/Link/Download).                                                              |
| "Review" summary table                              | **Learner-accurate multi-device Preview** (desktop/tablet/mobile)                                       | WYSIWYG trust: what you preview is literally the component learners see.                                                                     |
| Manual submit, easy to lose work                    | **Autosave + resume draft + confirm-on-exit**                                                           | Removes the #1 anxiety in long authoring flows.                                                                                              |
| Generic Prev/Next                                   | **Context-aware actions** (Continue / Save draft / Skip / Back / Preview / Publish / Submit for review) | Buttons state the actual next intent; role decides Publish vs Submit.                                                                        |

---

## 1. Challenging the original assumptions

The brief asked to "redesign the workflow." Three assumptions were worth pushing back on:

1. **"Ant Design + keep the existing design system."** The app doesn't actually
   use Ant Design — it's a hand-rolled token system (lucide-react + inline
   styles). Rather than bolt on visually-foreign AntD-blue, the redesign drives
   **AntD through `ConfigProvider`, themed with the UAPP palette** (teal
   `#045D5E`, orange `#FC7300`, Inter, full dark-mode parity). You get AntD's
   robustness _and_ brand consistency. See `theme.js`.

2. **"Choose type is step 1 of a linear wizard."** Type selection isn't really a
   step — it's a _branch point_ that reconfigures every later step. So choosing a
   card **auto-advances** (the choice is the intent), and each type carries its
   own accent colour as a persistent "you are building X" cue. See
   `contentTypes.js`.

3. **"Upload must come before details."** For a Resource, forcing a 5-step wizard
   is friction. The step list is **data-driven per type**: Resource/Tutorial get
   4 steps (no curriculum), Course gets 5. Optional steps expose a **Skip**.

**One more recommendation beyond the brief:** treat the preview component as the
_single source of truth_ for the learner page. `LearnerPreview` should be the
same component the catalog renders post-publish — guaranteeing "preview == what
students see" isn't a promise, it's an architectural fact.

---

## 2. User flow

```
                       ┌────────────────────────────┐
                       │  Entry: "Create" / Upload   │
                       └──────────────┬──────────────┘
                                      │  (skeleton load; offer resume-draft)
                                      ▼
                        ┌─────────────────────────┐
                        │ STEP 1  Choose type      │  Course │ Tutorial │ Resource
                        └───────────┬─────────────┘  (auto-advance on select)
             ┌────────────────────┼─────────────────────┐
             ▼                     ▼                      ▼
        [COURSE]              [TUTORIAL]             [RESOURCE]
   thumbnail/intro/         single primary        multi-file + URLs,
   lessons/resources        asset (video|pdf|doc)  drag-to-reorder
             │                     │                      │
             ▼                     ▼                      ▼
        STEP 2 Upload         STEP 2 Upload          STEP 2 Upload
             │                     │                      │
             ▼                     ▼                      ▼
        STEP 3 Details        STEP 3 Details         STEP 3 Details
             │                     │                      │
             ▼                     │                      │
        STEP 4 Curriculum         (skip)                 (skip)
             │                     │                      │
             └──────────┬──────────┴──────────┬───────────┘
                        ▼                      ▼
                   STEP 5 Preview (desktop/tablet/mobile)
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
       role = admin          role = manager
       "Publish now"        "Submit for review"
              │                    │
              ▼                    ▼
        Success state → View in catalog / Go to submissions / Create another
```

Autosave runs continuously from the moment a type is chosen; exit at any point
offers Save-draft / Discard / Keep-editing.

---

## 3. Information architecture

```
Create (focused mode — takes over the screen)
├── Progress rail (persistent)        who/where/what-saved
│   ├── Step list (vertical, jumpable to visited steps)
│   └── Autosave status
├── Step canvas (scrolls)
│   ├── 1 Type          → 3 cards
│   ├── 2 Upload        → named slots (per type) + URL (resource)
│   ├── 3 Details       → 5 collapsible sections
│   │   ├── General     title, subtitle, description, category, topic, difficulty
│   │   ├── Media       thumbnail/cover + alt text
│   │   ├── Metadata    tags, language, duration / reading time
│   │   ├── Visibility  public | team | private
│   │   └── SEO         search keywords
│   ├── 4 Curriculum    sections → lessons (Course only)
│   └── 5 Preview       device frames → LearnerPreview
└── Sticky footer (context-aware actions)
```

Data model (draft payload, autosaved as JSON):

```js
{
  typeKey: 'course' | 'tutorial' | 'resource',
  files:   { [slotId]: [{ uid, name, size, progress, status }] },
  links:   [{ uid, url }],                       // resource external URLs
  details: { title, subtitle, description, category, topic, difficulty,
             tags[], language, duration, visibility, keywords,
             thumbnailAlt, coverAlt },
  curriculum: [                                   // course only
    { id, title, lessons: [{ id, title, kind }] } // kind ∈ video|pdf|quiz|assignment|link|download
  ],
  status: 'draft' | 'review' | 'published'
}
```

This maps cleanly onto the existing `submissions` / content records — on publish
we push a submission with the derived `type` and `status`.

---

## 4. Per-step wireframe notes

**Step 1 — Choose type.** Centered heading; 3 equal cards in a responsive grid
(`auto-fit, minmax(250px,1fr)`). Each card: accent icon tile, label, tagline,
4 benefit bullets. Selected card lifts, shows a check + "Continue as …". Selecting
auto-advances.

**Step 2 — Upload.** One `UploadDropzone` per named slot. Dropzone = dashed
target with icon, "Drag & drop, or browse", hint, and "Import from cloud".
Uploaded files render as rows with type icon, name, live progress bar, success
tick, and Replace/Remove. Resource slot adds a drag-handle for reordering (first
file badged "Primary") and an external-URL adder.

**Step 3 — Details.** Five card sections, each with an accent icon + title.
Inline validation, char counters on Title/Description, `Segmented` for difficulty,
`Select mode="tags"` for tags, radio cards for visibility.

**Step 4 — Curriculum (Course only).** Empty state → "Add first section". Each
section is a draggable `Collapse` panel: index badge, inline-rename title, lesson
count, remove. Lessons are draggable rows with a type `Select` and remove.
"Add lesson" (dashed) inside; "Add section" (ghost) below.

**Step 5 — Preview.** Header + `Segmented` device switch (Desktop/Tablet/Mobile).
A publish-readiness `Alert` lists anything still missing. The frame renders
`LearnerPreview` at the chosen width with a device chrome for tablet/mobile.

---

## 5. Component hierarchy (as built)

```
CreateFlow.jsx  ......... orchestrator: state machine, autosave, modals, layout
├── ConfigProvider(theme)            ← UAPP-themed AntD
├── Top bar        (title · SaveIndicator · close)
├── ProgressSidebar (AntD Steps vertical, jumpable) + autosave status
├── Step canvas (switch on currentKey)
│   ├── StepChooseType.jsx
│   ├── StepUpload.jsx  → UploadDropzone.jsx (×slots)
│   ├── StepDetails.jsx → Section ×5 (AntD Form)
│   ├── StepCurriculum.jsx → Collapse + SectionHeader + lesson rows
│   └── StepPreview.jsx → device frame → LearnerPreview.jsx
├── Footer (context-aware buttons)
├── Drawer (mobile step nav)
└── Modals: resume-draft · confirm-exit · success (Result)

hooks/useAutosave.js ... debounced localStorage persistence + loadDraft/clearDraft
contentTypes.js ........ per-type config (steps, upload slots, options)
theme.js ............... makeAntdTheme(isDark) + surfaceTokens + accents
```

Suggested production folder structure:

```
src/create/
├── CreateFlow.jsx
├── theme.js
├── contentTypes.js
├── REDESIGN.md
├── hooks/
│   └── useAutosave.js
├── steps/
│   ├── StepChooseType.jsx
│   ├── StepUpload.jsx
│   ├── StepDetails.jsx
│   ├── StepCurriculum.jsx
│   └── StepPreview.jsx
└── components/
    ├── UploadDropzone.jsx
    └── LearnerPreview.jsx      ← reuse on the real published learner page
```

---

## 6. States & edge cases

- **Empty states:** curriculum (no sections), upload slots (dashed prompt),
  preview description fallback copy, no-tags.
- **Loading:** boot skeleton (heading + 3 card skeletons); per-file upload
  progress; publish button `loading`.
- **Success:** `Result` modal with type-accent tick + next actions.
- **Error:** file-row error state (red border, "retry"), URL validation
  (`http(s)://` required), required-field form validation blocking Continue.
- **Confirm dialogs:** resume-draft on entry, leave-without-publishing on exit
  (Discard / Save & leave / Keep editing).
- **Edge cases handled:** single-slot replace vs multi-add; reorder only when >1
  file; jump-nav restricted to visited steps or a valid next; publish-readiness
  surfaced but non-blocking for Save-draft; localStorage quota/private-mode fails
  silently; role missing → defaults to Submit-for-review (safe default).

---

## 7. Accessibility

- All custom controls have roles/labels: dropzones are `role="button"` +
  `tabIndex=0` + Enter/Space handlers + `aria-label`; icon buttons carry
  `aria-label`; type cards use `aria-pressed`.
- AntD Form gives label association, `aria-invalid`, and error messaging for free.
- Focus ring preserved (matches the app's `:focus-visible` ring).
- Colour is never the only signal (icons + text accompany accent colours).
- Device preview keeps semantic order; keyboard users can operate Steps rail,
  segmented control, collapses, and selects.
- **Next step for full AA:** verify dark-mode contrast on tertiary text, add
  `aria-live="polite"` to the autosave indicator, and drag-reorder keyboard
  alternative (move up/down buttons — see §10).

---

## 8. Responsive behaviour

- `Grid.useBreakpoint()` drives layout. `< md`: the progress rail collapses into
  a hamburger-triggered `Drawer`; canvas padding shrinks; footer stays sticky.
- Type cards reflow via `auto-fit` grid; details `Row/Col` collapse to full width
  on `xs`.
- Preview offers explicit tablet (720) / mobile (390) frames regardless of the
  actual viewport, so authors validate small screens from desktop.

---

## 9. Enterprise UX recommendations

1. **Role-aware publishing** (built): admin → Publish now; manager → Submit for
   review. Extend to an approvals SLA + reviewer assignment.
2. **Governance:** version history on drafts, "last edited by", and an audit
   trail on publish/unpublish.
3. **Templates & duplication:** "Start from template" and "Duplicate existing"
   to cut authoring time for repeatable formats (compliance updates, onboarding).
4. **Collaboration:** multi-author drafts with presence + comments (the drafts
   endpoint that replaces localStorage makes this natural).
5. **Accessibility gate:** block publish if thumbnail alt-text is missing —
   enterprise a11y compliance by construction.

---

## 10. Future scalability

- **Swap the persistence layer:** `useAutosave` calls one `persist()`; point it
  at a `/drafts` API for cross-device drafts and collaboration — no UI change.
- **Pluggable lesson types:** `LESSON_KINDS` + `KIND_ICON` are data; add SCORM,
  live session, or code-exercise by extending the arrays.
- **New content types:** add an entry to `CONTENT_TYPES` (steps + upload slots)
  and the whole wizard reconfigures — zero step-component edits.
- **Real drag-and-drop:** current reorder uses native HTML5 DnD (no dep). For
  large curricula, swap in `@dnd-kit/core` behind the same `moveSection/moveLesson`
  handlers and add keyboard reordering.
- **Chunked/resumable uploads:** replace the simulated progress with tus/S3
  multipart; the `UploadDropzone` progress contract already models per-file
  `progress`/`status`.
- **Code-splitting:** lazy-load `CreateFlow` (`React.lazy`) so AntD only ships to
  authors, not learners — trims the main bundle materially.

---

## 11. How to run / where it lives

- Mounted in `KnowledgeHub.jsx`: when `currentPage === 'upload'` and the user
  `canUpload`, the app renders `<CreateFlow>` full-screen (focused mode).
- `onComplete` pushes a new record into the existing `submissions` state.
- Inherits `isDark`, `role`, and author name from the host app.
- `npm run dev` → sign in as an admin/manager → "Upload Document" in the sidebar.

```

```
