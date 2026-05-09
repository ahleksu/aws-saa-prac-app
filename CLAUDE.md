# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server at http://localhost:4200 (alias for `ng serve`, dev configuration)
- `npm run build` — production build to `dist/` (default config is `production`; pass `--configuration development` for dev)
- `npm run watch` — incremental dev build
- `npm test` — run unit tests via `ng test` (Vitest runner, configured in `angular.json` under `architect.test` using `@angular/build:unit-test`)
- `npx ng generate component <name>` — scaffold a component using project defaults (selector prefix `app`)

There is no lint script configured; formatting is handled by Prettier (`.prettierrc`).

## Stack

- Angular 21.2 (standalone-only; `NgModule` is not used)
- TypeScript 5.9 with strict mode
- Tailwind CSS v4 via `@tailwindcss/postcss` (configured in `.postcssrc.json`; styles entry is `src/styles.css`)
- Vitest 4 for unit tests (jsdom environment)

## Architecture

This is a freshly scaffolded Angular CLI app — no domain code or feature routes have been added yet. The bootstrap path is:

- `src/main.ts` → `bootstrapApplication(App, appConfig)`
- `src/app/app.config.ts` — root providers (`provideRouter(routes)`, `provideBrowserGlobalErrorListeners`)
- `src/app/app.routes.ts` — currently empty `Routes` array; new feature routes should be added here as lazy-loaded entries
- `src/app/app.ts` — root `App` standalone component using signals

When adding features, create lazy-loaded route entries in `app.routes.ts` (per the project's lazy-loading convention) rather than registering components eagerly.

## Project conventions

Angular/TypeScript style rules for this repo live in `.claude/CLAUDE.md` and `AGENTS.md` (the two files mirror each other). Key non-obvious points:

- Do **not** add `standalone: true` to decorators — it is the default in Angular 20+ and the project rule is to omit it.
- Do **not** use `@HostBinding` / `@HostListener`; put host bindings in the component/directive `host` object.
- Do **not** use `ngClass` / `ngStyle` — use `class`/`style` bindings.
- Use native control flow (`@if`, `@for`, `@switch`), not the structural-directive forms.
- Use `input()` / `output()` functions, `computed()` for derived state, and `ChangeDetectionStrategy.OnPush` on every component.
- Use `inject()` (not constructor injection) and `providedIn: 'root'` for singleton services.
- Use `NgOptimizedImage` for static images (does not work for inline base64).
- Accessibility must pass AXE and meet WCAG AA.
