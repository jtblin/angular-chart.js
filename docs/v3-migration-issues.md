# Technical Debt: V3.0.0 Modernization

The modernization of `angular-chart.js` to TypeScript and Chart.js v4 has identified several legacy architectural patterns that should be addressed in future releases to improve maintainability and performance.

## 1. Global Mutation of Chart.js Defaults
**Issue**: The `ChartJsProvider` mutates the global `Chart.defaults` object.
**Impact**: This can cause unexpected side effects if other libraries or multiple instances of Chart.js are used in the same application.
**Recommendation**: Encapsulate default settings within the provider and pass them as instance-level options during chart creation.

## 2. Deep Watch Performance
**Issue**: All directive attributes are watched using `objectEquality: true`.
**Impact**: For large datasets, this causes significant performance degradation during the digest cycle.
**Recommendation**: Transition to `$watchCollection` for arrays or implement manual dirty-checking for `chartData`.

## 3. Dependency on Global `Chart` Object
**Issue**: The library relies on the global `Chart` object provided by the UMD bundle.
**Impact**: Limits the effectiveness of tree-shaking and modern ESM-first workflows.
**Recommendation**: Move towards a fully modular import system for Chart.js components.
