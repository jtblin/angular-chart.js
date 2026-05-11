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
  - **Gulp**: Manages secondary tasks like linting, distribution cleanup, and publishing (`gulpfile.cjs`).
- **Observability**: **Codecov** for code coverage tracking (reports generated via Karma).

## Key Scripts
- `npm run dev`: Starts a watch server (Rollup + LiveReload) at `http://localhost:8080/examples/charts.html`.
- `npm run build`: Generates production bundles in `dist/` and bundles the example app.
- `npm test`: Runs `gulp check` (ESLint -> Karma Unit Tests -> Playwright Integration Tests). Note: All tests are now in TypeScript.
- `npm run lint`: Runs `gulp lint` (ESLint with Google Style Guide). Supports `-- --fix` for automated formatting.
- `npm run typecheck`: Runs `tsc --noEmit` to verify type safety.

## Coding Conventions & Patterns
- **TypeScript**: 
  - Using a lenient `tsconfig.json` to support legacy Angular patterns.
  - Contextual `this: any` and `@ts-expect-error` are used sparingly for legacy provider/factory patterns.
  - **ESLint**: Integration via `@typescript-eslint/parser`. Redundant rules like `no-undef` are disabled for TS files as the compiler handles them.
- **Refactoring for Complexity**:
  - To maintain zero-error lint status, functions exceeding the `complexity: 10` threshold should be refactored into smaller helper functions. 
  - Example: `createDataSet` refactored into `applyDatasetOverride` and `applyTypeSpecificDefaults`.
- **Chart.js v4 Migration**:
  - `horizontalBar` is no longer a top-level type; it is mapped to `bar` with `indexAxis: 'y'`.
  - Configuration structures have shifted: `scales` are now flat objects (not arrays), and `legend`/`tooltip` are moved to the `plugins` namespace.
  - Event API: Use `getElementsAtEventForMode(evt, 'nearest', {intersect: true}, false)` for click/hover handlers.
  - **Transparency Settings**:
    - `chartAlpha`: Alpha value for borders and point backgrounds (default: 1).
    - `chartFillAlpha`: Alpha value for area fills (default: 0.2).
    - Configurable via `ChartJsProvider.setOptions`.
- **Visual Stability**: Integration tests use Playwright for pixel-perfect screenshot comparisons. Snapshots are stored in `test/integration.spec.ts-snapshots/`.
- **Example Suite Modernization**:
  - **Asset Paths**: Standalone examples must reference `../dist/angular-chart.js` and `../node_modules/chart.js/dist/chart.umd.js` for proper browser execution.
  - **Bubble Chart Pattern**: High-density charts (like the 50-point bubble demo) should use a single dataset with multiple points rather than separate datasets to prevent legend overflow and performance degradation.
  - **Scale Configuration**: All examples have been updated to the v4 object-based scale syntax.
  - **Mixed Chart Transparency**: When creating mixed-type charts (e.g., Bar + Line), ensure that bar transparency is explicitly set in the `chart-dataset-override` using `backgroundColor` with an alpha channel (e.g., `rgba(69, 183, 205, 0.2)`). This prevents the library's default color logic from potentially applying a solid color over the intended transparent bar.
- **Test-Driven Refactoring**: The `ChartJs` service is returned as a fresh object from `$get` instead of an object with getters. This ensures compatibility with mocking libraries like **Sinon**, which can have issues spying on or stubbing getter properties.
- **Performance Optimization (Shallow Watches)**:
  - By default, directives now use `$watchCollection` (shallow) for data attributes to avoid the high overhead of recursive deep-equality checks on large datasets.
  - **Opt-in Deep Watch**: If deep mutations are required, users can set `chart-dataset-watch-deep="true"` on the directive or `datasetWatchDeep: true` globally via `ChartJsProvider`.

## Deployment & Versioning
- **Trunk-Based**: Work happens on `main`. Current modernization is stabilized on `release/v3.0.0-rc.1`.
- **Atomic Commits**: Follow Conventional Commits.
- **Versioning**: Automated via `gulp deploy-patch/minor/major`. Tags use the `v` prefix. Bumping to **v3.0.0** due to Chart.js v4 and TypeScript migration.
- **CI/CD Releases**: GitHub Actions automatically creates **draft** releases when a version tag (`v*`) is pushed, allowing for manual review of release notes before publishing.

## Testing Strategy
1. **Unit Tests**: `test/test.unit.ts` (Karma + Mocha + Chai + Sinon). Focuses on directive lifecycle and data binding.
2. **Integration Tests**: `test/integration.spec.ts` (Playwright). Verifies visual rendering across multiple chart configurations.
