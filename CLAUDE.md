# Syros — Claude Code Context

## Project Overview

Syros (formerly SmartFinance) is a mobile-first personal finance app shipped as:
- a React PWA at `syrosfinance.netlify.app` (Safari "Add to Home Screen")
- native iOS + Android apps via Capacitor 8 (`com.syros.app`)

It uses Supabase for auth, data persistence, and billing webhooks, with localStorage as fallback.

**Freemium model**:
- Free plan with core features
- Premium Monthly: **R$ 12,90** (web / Stripe) · **R$ 14,90** (iOS + Android IAP)
- Premium Annual: **R$ 99,90** (web) · **R$ 119,90** (IAP)
- 7-day free trial on both tiers
- Unlocks envelopes, insights, credit cards, advanced analytics, and more

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3.1 |
| Build | Vite 7 |
| Styling | Tailwind CSS v3 (build-time via PostCSS) |
| Charts | Chart.js (CDN) |
| Font | Inter (Google Fonts) |
| State | React useState/useEffect (no Redux, no Context) |
| Auth & DB | Supabase (auth + persistence + Edge Functions) |
| Native runtime | Capacitor 8 (iOS + Android) |
| Billing (web) | Stripe Checkout → Supabase Edge Function |
| Billing (mobile) | RevenueCat → App Store / Play Billing |
| Persistence | Supabase + localStorage fallback via storageService.js |
| Icons | Inline SVG (no icon library) |

## Commands

```bash
npm run dev          # Start dev server (Vite, port 5173)
npm run build        # Production build → /dist
npm run preview      # Preview production build
npm run cap:sync     # Build + sync web assets into iOS/Android projects
npm run cap:ios      # Sync + open Xcode
npm run cap:android  # Sync + open Android Studio
```

## Key Files

| File | Purpose |
|------|---------|
| [src/App.jsx](src/App.jsx) | All global state, page routing, bottom nav |
| [src/config.js](src/config.js) | Feature flags, plan detection, hasFeature(), isPremium() |
| [src/components/Header.jsx](src/components/Header.jsx) | App header — SVG logo + title, exports `SyrosLogo` |
| [src/components/SummaryCards.jsx](src/components/SummaryCards.jsx) | 4 draggable financial metric cards |
| [src/components/SettingsSection.jsx](src/components/SettingsSection.jsx) | Full settings screen (theme, data, integrations, paywall entry) |
| [src/components/PaywallModal.jsx](src/components/PaywallModal.jsx) | Paywall UI — monthly/annual tiers, trial, platform-aware pricing |
| [src/components/TransactionForm.jsx](src/components/TransactionForm.jsx) | Add transaction form with integrated payment method |
| [src/components/TransactionList.jsx](src/components/TransactionList.jsx) | Transaction history grouped by month |
| [src/components/FilterBar.jsx](src/components/FilterBar.jsx) | Month selector (scroll picker) + date range |
| [src/components/MonthScrollPicker.jsx](src/components/MonthScrollPicker.jsx) | iOS-style scrollable month/year picker |
| [src/paywall/packages.js](src/paywall/packages.js) | Single source of truth for SKUs, prices, trial length |
| [src/services/storageService.js](src/services/storageService.js) | localStorage abstraction (Promise-based) |
| [src/services/supabaseService.js](src/services/supabaseService.js) | Supabase persistence + `dbLoadUserPreferences` (plan fields) |
| [src/services/checkout.js](src/services/checkout.js) | Stripe Checkout client → `create-checkout-session` edge function |
| [src/services/purchases.js](src/services/purchases.js) | RevenueCat wrapper (init, purchase, restore, customerInfo) |
| [src/utils/platform.js](src/utils/platform.js) | `isNativeApp()` — Capacitor detection |
| [src/utils/calculations.js](src/utils/calculations.js) | Financial calculation helpers |
| [src/index.css](src/index.css) | Global styles, scrollbar, animations, safe area |
| [index.html](index.html) | PWA meta, viewport (Tailwind now built via PostCSS, not CDN) |
| [capacitor.config.json](capacitor.config.json) | Capacitor config (appId `com.syros.app`, splash, status bar) |
| [supabase/functions/create-checkout-session/index.ts](supabase/functions/create-checkout-session/index.ts) | Edge function — creates Stripe Checkout Session |
| [supabase/functions/billing-webhook/index.ts](supabase/functions/billing-webhook/index.ts) | Unified webhook — Stripe + RevenueCat → `user_preferences` |

## Design Principles

- **iOS iPhone 16 PWA aesthetic** — no harsh borders, use shadows + background opacity for elevation
- **No borders on cards** — `shadow-sm` + tinted backgrounds replace `border border-*`
- All components require `dark:` Tailwind variants
- Mobile-first, `max-w-md` (448px) centered layout
- Minimum touch target: **44px** (`min-h-[44px]`)
- **Tailwind build-time** — Tailwind v3 is a real dep; PostCSS processes `src/index.css` into a single bundled stylesheet (required so the native webview works offline — no CDN round-trip on launch)

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for full design token reference.

## Data Flow — Overview vs History

The app has **two independent data pipelines** for calculations:

| Pipeline | Scope | Used by |
|----------|-------|---------|
| `overviewTransactions` / `overviewValues` | Controlled by `overviewFilter` (`'month'` / `'range'`) | Overview page: SummaryCards, MiniChart, CategoryBreakdown, RecentTransactions, Insights |
| `summaryTransactions` / `summaryValues` | Controlled by `currentFilter` (`'month'` / `'range'`) | History/Transações page (FilterBar, TransactionList), Graphs & Goals page |

Both pipelines default to current month via `filterByMonth(transactions, year, month)`. The FilterBar shows a scrollable month picker (iOS-style `MonthScrollPicker`) + DateRangePicker. The `selectedMonth` state in App.jsx is shared between both pipelines.

### Calculation formulas (same for both pipelines)

```javascript
income       = Σ(tx.amount)           where type === 'income'   && !isProjection  // positive
totalExpense = Math.abs(Σ(tx.amount)) where type === 'expense'  && !isProjection  // positive for display
paidExpense  = Math.abs(Σ(tx.amount)) where type === 'expense'  && paid && !isProjection
balance      = income + paidExpenseRaw  // income minus paid expenses (paidExpenseRaw is negative)
```

## Navigation System

`activePage` state in App.jsx controls which page is visible via `hidden` class on `<section>` elements.

Pages: `'overview'` | `'graphs-goals'` | `'history'` | `'new-transaction'` | `'settings'`

Bottom nav: 4 `NavTab` items + 1 central inline "+" button for "Nova" (solid `var(--accent)` color). The `wallet` page was removed — its content (CreditCardsSection, ExportSection) now lives inside SettingsSection. A fallback redirects `activePage === 'wallet'` → `'settings'`.

Tab labels (pt-BR): Início | Gráfico | **Nova** | Transações | Ajustes

## Premium Feature System

Plan status comes from Supabase `user_preferences`:

| Column | Meaning |
|--------|---------|
| `plan` | `'free'` \| `'premium'` |
| `premium_expires_at` | timestamptz — when the current entitlement ends (null = legacy lifetime) |
| `plan_source` | `'web'` \| `'ios'` \| `'android'` \| `'manual'` |
| `plan_provider_id` | Stripe customer id or RevenueCat app user id |
| `trial_started_at` | timestamptz — first time the user entered a trial |

`isPremiumActive(prefs)` in [src/config.js](src/config.js) returns true only if `plan === 'premium'` AND (`premium_expires_at` is null OR in the future). The App.jsx boot path loads prefs and calls `setCurrentPlan('premium' | 'free')` based on that.

For dev/test you can still force the plan by running SQL:
```sql
update user_preferences
set plan = 'premium',
    premium_expires_at = now() + interval '1 month',
    plan_source = 'manual'
where user_id = '<uuid>';
```

Check features in components:

```javascript
import { hasFeature, isPremium } from '../config.js';

if (!hasFeature('envelopes')) {
  return <PremiumCard title="..." description="..." />;
}
```

### Paywall

- Entry point: `SettingsSection` "Ativar Premium" button → renders `<PaywallModal>` (plus contextual entry from any `PremiumCard`).
- Pricing comes from [src/paywall/packages.js](src/paywall/packages.js) — NEVER hardcode R$ values in components.
- `isNativeApp()` decides between `priceWeb` (Stripe R$ 12,90 / R$ 99,90) and `priceApp` (IAP R$ 14,90 / R$ 119,90).
- Web CTA → `createCheckoutSession(packageId)` → Stripe Checkout redirect → returns to `/?checkout=success`.
- Native CTA → `purchasePackage()` via RevenueCat → entitlement check → app unlocks.
- Both flows ultimately land in `billing-webhook` Edge Function, which is the **source of truth** for `user_preferences.plan`.
- Post-checkout, App.jsx polls `dbLoadUserPreferences()` and reloads the window once premium is detected — never trust client-side optimistic state.

See [docs/FEATURES.md](docs/FEATURES.md) for the full feature matrix and [MOBILE_SETUP.md](MOBILE_SETUP.md) for the store submission guide.

## Data Model

```javascript
// Transaction
{
  id: string,
  description: string,
  amount: number,           // positive = income, negative = expense
  type: 'income' | 'expense',
  createdAt: string,        // ISO 8601
  recurrence: 'single' | 'monthly' | 'installment',
  paid: boolean,
  paymentMethod: 'pix' | 'debit' | 'credit' | 'cash' | null,
  creditCardName: string | null,
  category: string,
  groupId?: string,         // links installment group
  sourceOf?: string,        // original ID for projection copies
  isProjection?: boolean,   // auto-generated monthly copies
}
```

## Transaction Creation Flow

When adding a new **expense**, payment method is selected directly in the form (not in a separate modal):

| Payment Method | `paid` on creation | Card name |
|----------------|-------------------|-----------|
| Pix | `true` | — |
| Débito | `true` | Optional (saved to localStorage) |
| Crédito | `false` | Optional (saved to localStorage) |
| Dinheiro | `true` | — |

- Card names are persisted in `localStorage` key `syros_saved_card_names` for future auto-complete
- If Premium cards exist (from CreditCardsSection), they appear as a dropdown instead of text input
- **Success feedback**: fullscreen overlay — blue (#1B4965) for income, red (#9B2226) for expense — auto-closes after 2s

The separate `PaymentModal` still exists for marking existing unpaid transactions as paid (toggle paid checkbox in history).

## Coding Conventions

- Functional components only (no class components)
- Props drilling (no Context or Redux)
- All monetary values: signed numbers (positive = income, negative = expense)
- `formatCurrency()` uses `Intl.NumberFormat('pt-BR', BRL)`
- Date strings: ISO 8601 via `toISOString()`
- Component files: `PascalCase.jsx`
- Service/util files: `camelCase.js`
- SVG icons: `fill="none" stroke="currentColor" strokeWidth={2}`, sized `h-5 w-5` or `h-4 w-4`

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/STATUS.md](docs/STATUS.md) | **Live status** of the mobile + billing rollout — fases, bloqueios, Stripe live checklist. Read this first in any new session. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Component tree, state map, localStorage keys |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Colors, typography, spacing, shadows, iOS patterns |
| [docs/FEATURES.md](docs/FEATURES.md) | Free vs Premium feature matrix |
| [docs/OPENFINANCE.md](docs/OPENFINANCE.md) | Open Finance integration plan |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md) | Main user flow documentation |
| [IMPLEMENTACAO_PREMIUM.md](IMPLEMENTACAO_PREMIUM.md) | Detailed premium implementation notes |
| [MOBILE_SETUP.md](MOBILE_SETUP.md) | Store submission guide — Apple, Google, RevenueCat, Stripe |
