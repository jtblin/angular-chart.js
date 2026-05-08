# Angular-Chart.js: Project Technical Context

## Overview
This is a legacy AngularJS 1.x wrapper for Chart.js. It has recently been modernized to **TypeScript** and **Chart.js v4**.

## Architecture & Tech Stack
- **Core Logic**: `src/angular-chart.ts` (TypeScript, ES Modules).
- **Chart Engine**: Chart.js v4.x (UMD bundle used in tests/examples: `chart.umd.js`).
- **Framework**: AngularJS 1.8.x.
- **Build System**: 
  - **Rollup**: Bundles TypeScript into UMD, ESM, and CJS formats for the core library (`rollup.config.js`).
  - **esbuild**: Bundles the example application (`examples/app.ts`) for high performance during development.
  - **Gulp**: Manages secondary tasks like linting, distribution cleanup, and publishing (`gulpfile.js`).

## Key Scripts
- `npm run dev`: Starts a watch server (Rollup + LiveReload) at `http://localhost:8080`.
- `npm run build`: Generates production bundles in `dist/` and bundles the example app.
- `npm test`: Runs `gulp check` (ESLint -> Karma Unit Tests -> Playwright Integration Tests). Note: All tests are now in TypeScript.
- `npm run lint`: Runs `gulp lint` (ESLint with Google Style Guide).
- `npm run typecheck`: Runs `tsc --noEmit` to verify type safety.

## Coding Conventions & Patterns
- **TypeScript**: 
  - Using a lenient `tsconfig.json` to support legacy Angular patterns.
  - Contextual `this: any` and `@ts-expect-error` are used sparingly for legacy provider/factory patterns.
- **Chart.js v4 Migration**:
  - `horizontalBar` is no longer a top-level type; it is mapped to `bar` with `indexAxis: 'y'`.
  - Configuration structures have shifted: `scales` are now flat objects (not arrays), and `legend`/`tooltip` are moved to the `plugins` namespace.
  - Event API: Use `getElementsAtEventForMode(evt, 'nearest', {intersect: true}, false)` for click/hover handlers.
  - **Transparency Settings**:
    - `chartAlpha`: Alpha value for borders and point backgrounds (default: 1).
    - `chartFillAlpha`: Alpha value for area fills (default: 0.2).
    - Configurable via `ChartJsProvider.setOptions`.
- **Visual Stability**: Integration tests use Playwright for pixel-perfect screenshot comparisons. Snapshots are stored in `test/integration.spec.ts-snapshots/`.

## Deployment & Versioning
- **Trunk-Based**: Work happens on `main`. Current modernization is stabilized on `release/v3.0.0-rc.1`.
- **Atomic Commits**: Follow Conventional Commits.
- **Versioning**: Automated via `gulp deploy-patch/minor/major`. Tags use the `v` prefix. Bumping to **v3.0.0** due to Chart.js v4 and TypeScript migration.

## Testing Strategy
1. **Unit Tests**: `test/test.unit.ts` (Karma + Mocha + Chai + Sinon). Focuses on directive lifecycle and data binding.
2. **Integration Tests**: `test/integration.spec.ts` (Playwright). Verifies visual rendering across multiple chart configurations.
