# Spec: angular-chart.js TypeScript and Chart.js v4 Migration

## Objective
The objective is to complete Phase 2.5 and Phase 3 of the `angular-chart.js` modernization project. 
This involves:
1. **Phase 2.5 (TypeScript Migration)**: Transitioning the core source file (`src/angular-chart.js`) to TypeScript (`src/angular-chart.ts`) to improve maintainability, developer experience, and provide robust typing.
2. **Phase 3 (Chart.js v4 Migration)**: Upgrading the underlying `chart.js` dependency from v2.9.4 to the latest v4, leveraging the new TypeScript types to navigate breaking changes and ensure compatibility.

Target users are existing maintainers and consumers of the library relying on modern build pipelines.

## Tech Stack
- **Framework**: AngularJS (1.8.x)
- **Library**: Chart.js (v4.x)
- **Language**: TypeScript (target ES6+, Native ES Modules)
- **Bundler**: Rollup (v4.x)
- **Testing**: Karma, Playwright, Mocha, Chai, Sinon

## Commands
```bash
# Build the project (UMD, ESM, CJS via Rollup)
npm run build

# Run tests via Karma/Playwright
npm test

# Lint the codebase
npm run lint

# Start development server with watch mode
npm run dev

# Release versions
npm run release:patch
npm run release:minor
npm run release:major
```

## Project Structure
```text
src/             → Application source code (transitioning to .ts)
  angular-chart.ts → Core TypeScript source file
dist/            → Compiled build artifacts (UMD, ESM, CJS, Source Maps) - untracked
examples/        → Example usage and documentation assets
test/            → Unit and integration tests (Karma/Playwright)
docs/            → Project documentation and specifications
```

## Code Style
- **Linter**: ESLint with `eslint-config-google`.
- **Typing**: Start with a lenient TypeScript configuration (e.g., `strict: true` but disable heavy-hitters like `noImplicitAny` and `strictNullChecks`). Enable strictness flags gradually once stable. Use `// @ts-expect-error` sparingly for difficult spots rather than lowering global strictness.
- **Module System**: Native ES Modules.
- **Dependencies**: Use `import { Chart } from 'chart.js';` to preserve tree-shaking. The responsibility of importing `chart.js/auto` or specific components falls to the end user.

Example Snippet:
```typescript
import angular from 'angular';
import { Chart, ChartConfiguration } from 'chart.js';

export default angular.module('chart.js', [])
  .directive('chartBase', function () {
    return {
      restrict: 'CA',
      scope: {
        chartType: '=',
        chartData: '=',
        chartOptions: '<'
      },
      link: function (scope, elem) {
        // Implementation with strong typing
      }
    };
  })
  .name;
```

## Testing Strategy
- **Framework**: Karma paired with Playwright for headless browser testing.
- **Assertions/Mocking**: Mocha, Chai, and Sinon.
- **Coverage**: Maintain high test coverage for core directive logic.
- **Requirements**: All existing tests must pass after migrating to TS and upgrading Chart.js. Test fixtures may require updates due to Chart.js v4 rendering changes.

## Boundaries
- **Always do**: 
  - Ensure `npm run build` and `npm test` pass before committing.
  - Follow the Google Style Guide.
  - Gradually tighten TypeScript strictness flags as the migration stabilizes.
- **Ask first**: 
  - When Chart.js v4 breaking changes require significant alterations to the library's public API or `chartOptions` handling.
  - Changes to the GitHub Actions CI pipeline.
- **Never do**: 
  - Commit build artifacts in `dist/`.
  - Force push to main.

## Success Criteria
- [ ] `src/angular-chart.js` is fully converted to `src/angular-chart.ts` without losing any functionality.
- [ ] `tsconfig.json` is integrated with the Rollup build pipeline (`@rollup/plugin-typescript`).
- [ ] `chart.js` dependency is upgraded to `^4.0.0` in `package.json`.
- [ ] All breaking changes from Chart.js v2 to v4 are addressed in the source code.
- [ ] `npm run build` generates UMD, ESM, and CJS formats successfully.
- [ ] `npm test` passes 100% in CI and local environments.

