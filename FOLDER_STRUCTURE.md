# AK1A Research Lab — Feature-Based Folder Structure (Common Closure Principle)

> Each feature folder contains its own **models** (types/Prisma), **services** (business logic), and **controllers** (API routes). Files that change together are grouped together.

---

## Proposed Structure

```
src/
├── app/                              # Next.js App Router (thin — delegates to features)
│   ├── layout.tsx                    # Root layout (imports Shell from shared)
│   ├── page.tsx                      # Home page (delegates to features/home)
│   ├── error.tsx                     # Global error boundary
│   ├── loading.tsx                   # Global loading state
│   ├── not-found.tsx                 # Global 404
│   ├── globals.css                   # Global styles only
│   │
│   ├── admin/
│   │   └── page.tsx                  # → features/admin
│   ├── privacy-policy/
│   │   └── page.tsx                  # → features/legal
│   └── terms/
│       └── page.tsx                  # → features/legal
│
├── features/                         # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│   │                                 # FEATURE MODULES (self-contained)
│   │                                 # Each has: models/ services/ ui/ api/
│   │
│   ├── home/                         # HEM — Landing page
│   │   ├── ui/
│   │   │   ├── HomeSection.tsx       # Main home page component
│   │   │   ├── HeroBlock.tsx         # Hero section
│   │   │   ├── NumberStats.tsx       # "AK1A i siffror" stats
│   │   │   ├── StepCards.tsx         # "3 steg till insikt"
│   │   │   ├── TierCards.tsx         # "Vem är du?" tiers
│   │   │   ├── ManifestBlock.tsx     # Styrelsebeslut quote
│   │   │   ├── HonestyCards.tsx      # Ärlighet dashboard
│   │   │   └── CtaCards.tsx          # "Gå vidare" CTAs
│   │   └── index.ts                  # Public exports
│   │
│   ├── prec-analysis/                # PREC-ANALYS — 99-page analysis
│   │   ├── models/
│   │   │   └── prec-data.ts          # PREC constants (price, AKM1, sections)
│   │   ├── ui/
│   │   │   ├── PrecSection.tsx       # Main PREC page
│   │   │   ├── ReadingProgress.tsx   # Sticky progress bar
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── FivePointMotivation.tsx
│   │   │   ├── CompanyOverview.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── FusionSection.tsx
│   │   │   ├── CalendarSection.tsx
│   │   │   ├── PriceHistory.tsx
│   │   │   ├── ScenarioTable.tsx
│   │   │   └── ReproducerbarhetsKvitto.tsx
│   │   └── index.ts
│   │
│   ├── analyser/                     # ANALYSER — Analysis archive
│   │   ├── models/
│   │   │   └── analysis.ts           # Analysis type + 8 published analyses
│   │   ├── services/
│   │   │   └── analysis-service.ts   # Fetch/filter analyses
│   │   ├── api/
│   │   │   └── route.ts              # GET /api/analyser
│   │   ├── ui/
│   │   │   ├── AnalyserSection.tsx
│   │   │   ├── FeaturedAnalysis.tsx
│   │   │   ├── ArchiveTable.tsx
│   │   │   ├── MetodikPhases.tsx
│   │   │   ├── ReproducerbarhetBlock.tsx
│   │   │   └── UpcomingQueue.tsx
│   │   └── index.ts
│   │
│   ├── aktier/                       # AKTIER — Stock registry
│   │   ├── models/
│   │   │   └── stock.ts              # Stock type + 8 stocks data
│   │   ├── ui/
│   │   │   ├── AktierSection.tsx
│   │   │   ├── StockCard.tsx
│   │   │   ├── StockGrid.tsx
│   │   │   └── ReproducerbarhetBlock.tsx
│   │   └── index.ts
│   │
│   ├── kurser/                       # KURSER — Course catalog
│   │   ├── models/
│   │   │   ├── akm1-variable.ts      # AKM1_VARIABLES type + 20 vars
│   │   │   ├── km-course.ts          # KmCourse type + 70 KM courses
│   │   │   ├── learning-path.ts      # LEARNING_PATHS data
│   │   │   ├── badge.ts              # BADGES data
│   │   │   └── insight.ts            # ANALYTIKER-INSIKTER data
│   │   ├── services/
│   │   │   ├── course-service.ts     # courseIdToSlug, variableIdToSlug
│   │   │   └── progress-service.ts   # XP, completion, level calc
│   │   ├── ui/
│   │   │   ├── KurserSection.tsx
│   │   │   ├── Akm1CourseCard.tsx
│   │   │   ├── KmCourseCard.tsx
│   │   │   ├── CourseDetailDialog.tsx
│   │   │   ├── KunskapsmarknadBlock.tsx
│   │   │   ├── KnowledgeMap.tsx
│   │   │   ├── PathCard.tsx
│   │   │   ├── BadgeGrid.tsx
│   │   │   └── InsightAccordion.tsx
│   │   └── index.ts
│   │
│   ├── deep-courses/                 # Deep course viewer (225 courses)
│   │   ├── models/
│   │   │   └── deep-course.ts        # DeepCourse, DeepChapter types
│   │   ├── services/
│   │   │   └── deep-course-service.ts # fetchDeepCourse, slugToVariableId
│   │   ├── api/
│   │   │   └── [slug]/
│   │   │       └── route.ts          # GET /api/kurs/[slug]
│   │   ├── ui/
│   │   │   ├── DeepCourseViewer.tsx  # Full-page course reader
│   │   │   ├── ChapterBlock.tsx      # Text/Insight/Definition blocks
│   │   │   └── PerspectivesBlock.tsx # Lynch/Graham/AKM1 section
│   │   ├── data/
│   │   │   └── deep-courses.json     # 225 courses (2.3MB)
│   │   └── index.ts
│   │
│   ├── labb/                         # LABB — Analysis console
│   │   ├── models/
│   │   │   └── case-study.ts         # CaseStudy type
│   │   ├── services/
│   │   │   ├── case-service.ts       # Fetch/filter cases
│   │   │   └── combination-service.ts # Fetch/filter combinations
│   │   ├── api/
│   │   │   ├── cases/
│   │   │   │   └── route.ts          # GET/POST /api/cases
│   │   │   └── combinations/
│   │   │       └── route.ts          # GET/POST /api/combinations
│   │   ├── ui/
│   │   │   ├── LabbSection.tsx       # Main labb page
│   │   │   ├── CaseStudiesPanel.tsx
│   │   │   ├── CaseStudiesBrowser.tsx
│   │   │   ├── CombinationsBrowser.tsx
│   │   │   ├── Akm1InputTool.tsx     # 35-field input tool
│   │   │   ├── PortfolioPanel.tsx    # Portfolio with waves
│   │   │   ├── RiskProfileQuiz.tsx   # 6-question risk quiz
│   │   │   ├── VideoLessonExample.tsx
│   │   │   ├── InteractiveLearning.tsx # Quiz + Flashcards + XP
│   │   │   ├── Akm1Calculator.tsx    # 19-variable calculator dialog
│   │   │   └── PlannedToolPanel.tsx  # Placeholder for future tools
│   │   └── index.ts
│   │
│   ├── styrelse/                     # STYRELSE — AI Board meetings
│   │   ├── models/
│   │   │   ├── organ.ts              # Organ type + 8 organs
│   │   │   ├── meeting.ts            # Meeting, Viewpoint, Decision types
│   │   │   └── agenda.ts             # Suggested agendas
│   │   ├── services/
│   │   │   ├── meeting-service.ts    # Run LLM meeting, save protocol
│   │   │   └── protocol-service.ts   # CRUD protocols
│   │   ├── api/
│   │   │   ├── mote/
│   │   │   │   └── route.ts          # POST /api/styrelse/mote (LLM)
│   │   │   ├── agendas/
│   │   │   │   └── route.ts          # GET /api/styrelse/agendas
│   │   │   └── protokoll/
│   │   │       └── route.ts          # GET/POST /api/styrelse/protokoll
│   │   ├── ui/
│   │   │   ├── StyrelseSection.tsx   # Main styrelse page
│   │   │   ├── AgendaInput.tsx       # Dagordning textarea + suggestions
│   │   │   ├── MeetingProtocol.tsx   # Protocol display (viewpoints + decision)
│   │   │   ├── SignatureGrid.tsx     # 8 signature medallions
│   │   │   ├── OrganSeats.tsx        # Board seats overview
│   │   │   └── ProtocolArchive.tsx   # Archive list
│   │   └── index.ts
│   │
│   ├── utbildning/                   # UTBILDNING — Education & membership
│   │   ├── models/
│   │   │   └── curriculum.ts         # 3 steps, pricing, testimonials, FAQ
│   │   ├── ui/
│   │   │   ├── UtbildningSection.tsx
│   │   │   ├── ThirtyMinPass.tsx
│   │   │   ├── CurriculumSteps.tsx
│   │   │   ├── Power20Principle.tsx
│   │   │   ├── CompletionRates.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── PricingCard.tsx
│   │   │   ├── FaqAccordion.tsx
│   │   │   └── LoginTransparency.tsx
│   │   └── index.ts
│   │
│   ├── om-oss/                       # OM OSS — About us
│   │   ├── models/
│   │   │   └── organ-data.ts         # ORGANS, PHASES, manifest data
│   │   ├── ui/
│   │   │   ├── OmOssSection.tsx
│   │   │   ├── ManifestBlock.tsx
│   │   │   ├── ContrarianTruth.tsx
│   │   │   ├── OrganAccordion.tsx    # 8 organs accordion
│   │   │   ├── PhaseCycle.tsx        # 5-fas-cykeln
│   │   │   ├── HonestyDashboard.tsx
│   │   │   ├── Ak1Upgrade.tsx        # AKM1 1.1 upgrade section
│   │   │   └── ResearcherCard.tsx
│   │   └── index.ts
│   │
│   ├── reproducerbarhet/             # REPRODUCERBARHET — Reproducibility
│   │   ├── models/
│   │   │   └── kvitto.ts             # Reproducerbarhets-kvitto type
│   │   ├── services/
│   │   │   └── verify-service.ts     # Verify analysis reproducibility
│   │   ├── api/
│   │   │   └── verify/
│   │   │       └── route.ts          # GET /api/reproducerbarhet/verify
│   │   ├── ui/
│   │   │   ├── ReproducerbarhetSection.tsx
│   │   │   ├── ComparisonTable.tsx   # Traditional vs AK1A
│   │   │   ├── ValueGuarantee.tsx    # 336x, 10x, ∞ stats
│   │   │   ├── MoatSection.tsx       # Why competitors can't copy
│   │   │   ├── KvittoCard.tsx        # 20/20 verification display
│   │   │   ├── CertificationTiers.tsx
│   │   │   ├── ReproduceraGuide.tsx  # 5-step guide
│   │   │   └── ManifestQuote.tsx
│   │   └── index.ts
│   │
│   ├── wave-matrix/                  # AK1TS Wave Matrix (signature viz)
│   │   ├── models/
│   │   │   └── wave-data.ts          # WAVE_THEORIES, WAVE_HORIZONS, MATRIX
│   │   ├── ui/
│   │   │   ├── WaveMatrix.tsx        # 5×5 interactive grid
│   │   │   ├── WaveCell.tsx          # Individual cell button
│   │   │   ├── ConfluenceBar.tsx     # Bull/bear/neutral bar
│   │   │   └── CellDetailDialog.tsx  # Cell detail popup
│   │   └── index.ts
│   │
│   ├── indicators/                   # AKM1 Indicators (V01-V20)
│   │   ├── models/
│   │   │   └── indicator.ts          # Ak1Indicator Prisma model
│   │   ├── services/
│   │   │   └── indicator-service.ts  # CRUD indicators
│   │   ├── api/
│   │   │   └── route.ts              # GET/POST /api/indicators
│   │   └── index.ts
│   │
│   ├── mega-tasks/                   # Mega project task tracking
│   │   ├── models/
│   │   │   └── mega-task.ts          # MegaTask Prisma model
│   │   ├── services/
│   │   │   └── task-service.ts       # CRUD tasks
│   │   ├── api/
│   │   │   └── tasks/
│   │   │       └── route.ts          # GET/POST/PATCH /api/mega/tasks
│   │   └── index.ts
│   │
│   ├── admin/                        # Admin dashboard
│   │   ├── ui/
│   │   │   └── AdminPage.tsx
│   │   └── index.ts
│   │
│   └── legal/                        # Legal pages
│       ├── ui/
│       │   ├── PrivacyPolicy.tsx
│       │   └── Terms.tsx
│       └── index.ts
│
├── shared/                           # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│   │                                 # SHARED INFRASTRUCTURE (cross-feature)
│   │
│   ├── shell/                        # App shell (header, footer, overlays)
│   │   ├── ui/
│   │   │   ├── Header.tsx            # Sticky nav + level switcher + search
│   │   │   ├── Footer.tsx            # Footer with legal links
│   │   │   ├── SearchModal.tsx       # ⌘K global search
│   │   │   ├── SummaryDrawer.tsx     # Right-side summary panel
│   │   │   └── ShareDialog.tsx       # Share modal
│   │   └── index.ts
│   │
│   ├── design-system/                # AK1A design system
│   │   ├── ui/                       # Reusable primitives
│   │   │   ├── Ak1aLogo.tsx          # Logo (img + wordmark)
│   │   │   ├── HonestyTag.tsx        # Mätt/Metodmål tag
│   │   │   ├── SignalPill.tsx        # Bull/Bear/Neutral pill
│   │   │   ├── OrganGlyph.tsx        # Greek letter badge
│   │   │   ├── Eyebrow.tsx           # Section label
│   │   │   └── GoldRule.tsx          # Gold divider
│   │   ├── theme.ts                  # CSS variables, colors, fonts
│   │   └── index.ts
│   │
│   ├── ui/                           # shadcn/ui components (48 files)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── ... (all 48 shadcn components)
│   │   └── tooltip.tsx
│   │
│   ├── store/                        # Global state management
│   │   ├── ak1a-store.ts             # Zustand store (section, level, XP, progress)
│   │   ├── store-provider.tsx        # Hydration-safe provider
│   │   └── index.ts
│   │
│   ├── providers/                    # Context providers
│   │   ├── theme-provider.tsx        # next-themes
│   │   └── index.ts
│   │
│   ├── hooks/                        # Shared hooks
│   │   ├── use-mobile.ts
│   │   ├── use-toast.ts
│   │   └── index.ts
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── utils.ts                  # cn() + misc helpers
│   │   ├── db.ts                     # Prisma client
│   │   ├── supabase.ts               # Supabase client
│   │   └── data-access.ts            # Unified data access layer
│   │
│   └── types/                        # Shared type definitions
│       ├── level.ts                  # Level type
│       ├── section.ts                # SectionId type
│       └── index.ts
│
├── prisma/                           # Database schema
│   └── schema.prisma                 # 6 models (Ak1Indicator, CaseStudy, etc.)
│
├── public/                           # Static assets
│   ├── ak1a/
│   │   ├── logo-transparent.png
│   │   ├── logo-dark.png
│   │   └── favicon.svg
│   ├── deep-courses.json             # → moved to features/deep-courses/data/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── logo.svg                      # (legacy, can remove)
│
├── scripts/                          # Maintenance scripts
│   ├── seed.ts                       # → from src/lib/ak1a/seed.ts
│   ├── seed-cases-combinations.ts    # → from src/lib/ak1a/seed-cases-combinations.ts
│   ├── add-perspectives.ts           # → from src/lib/ak1a/add-perspectives.ts
│   ├── generate-courses.ts           # → from src/lib/ak1a/regenerate-all-courses.ts
│   └── migrate-to-supabase.ts        # Migration script
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── Caddyfile
├── .env
└── keepalive.sh
```

---

## Feature Dependency Graph

```
                    ┌─────────────┐
                    │   shared/   │
                    │  (shell,    │
                    │  store,     │
                    │  design,    │
                    │  lib, db)   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │ features/  │   │ features/  │   │ features/  │
    │  home      │   │  kurser    │   │  labb      │
    └────────────┘   └──────┬─────┘   └──────┬─────┘
                            │                │
                     ┌──────┴─────┐   ┌──────┴──────┐
                     │ features/  │   │ features/    │
                     │ deep-      │   │ indicators   │
                     │ courses    │   │ (shared data)│
                     └────────────┘   └──────────────┘
```

## Rules (Common Closure Principle)

1. **Files that change together → same folder.** If you update a case study, you only touch `features/labb/`.
2. **Each feature is self-contained.** `features/styrelse/` has its own models, services, API routes, and UI.
3. **Shared infrastructure → `shared/`.** Only put things here if 3+ features use them.
4. **No cross-feature imports.** `features/home/` cannot import from `features/kurser/`. If needed, extract to `shared/`.
5. **App Router is thin.** `app/page.tsx` just imports and renders from `features/`.
6. **Data files live with their feature.** `deep-courses.json` → `features/deep-courses/data/`.

## Migration Priority

| Phase | What | Why |
|-------|------|-----|
| 1 | Extract `shared/` (shell, store, design-system, lib) | Unblocks all feature extraction |
| 2 | Extract `features/styrelse/` (self-contained, clear boundary) | Proves the pattern |
| 3 | Extract `features/kurser/` + `features/deep-courses/` | Largest, most complex |
| 4 | Extract `features/labb/` | Second largest |
| 5 | Extract remaining features | Home, PREC, Analyser, Aktier, Utbildning, Om-Oss |
| 6 | Move scripts to `scripts/` | Cleanup |
