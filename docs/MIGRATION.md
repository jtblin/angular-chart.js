# Migration Guide: V2.x to V3.x

This guide helps you migrate your application from `angular-chart.js` v2.x (Chart.js 2/3) to v3.x (Chart.js 4).

## 1. Major Configuration Changes (Chart.js 4.x)

Chart.js 4.x introduced significant changes to the configuration structure. Most of these must be updated in your `chart-options`.

### Scales
In v2.x, scales were defined as arrays. In v3.x/v4.x, they are **objects** where each key is the scale ID.

**Old (v2.x):**
```javascript
$scope.options = {
  scales: {
    yAxes: [{
      ticks: { beginAtZero: true }
    }]
  }
};
```

**New (v3.x):**
```javascript
$scope.options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
```

### Plugins (Legend, Tooltips, Titles)
Configuration for legend, tooltips, and titles has moved under the `plugins` namespace.

**Old (v2.x):**
```javascript
$scope.options = {
  legend: { display: true },
  tooltips: { enabled: false }
};
```

**New (v3.x):**
```javascript
$scope.options = {
  plugins: {
    legend: { display: true },
    tooltip: { enabled: false }
  }
};
```

### Horizontal Bar Charts
The `chart-horizontal-bar` directive still exists for convenience, but it now internally maps to a `bar` chart with `indexAxis: 'y'`.

---

## 2. Chart.js Registration & Tree-shaking

Chart.js 4.x is modular. You must decide between the "Auto" (easy) approach and the "Manual" (tree-shaking) approach.

### The "Auto" Approach (Recommended for migration)
If you are using a `<script>` tag or want a behavior similar to v2.x, use the **UMD** bundle of Chart.js. It automatically registers all controllers, scales, and elements.

**HTML:**
```html
<script src="node_modules/chart.js/dist/chart.umd.js"></script>
```

### The "Manual" Approach (Tree-shaking)
If you are using a modern bundler (Vite, Webpack, Rollup) and want to minimize your bundle size, you must register the components you use.

**Option A: Register Everything (Safe)**
```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
```

**Option B: Pick specific components (Optimized)**
```typescript
import { Chart, BarController, CategoryScale, LinearScale, BarElement } from 'chart.js';
Chart.register(BarController, CategoryScale, LinearScale, BarElement);
```

---

## 3. TypeScript Support
If you are using TypeScript, `angular-chart.js` now provides built-in types. Note that most `chart-options` should now conform to the `ChartOptions` type from `chart.js`.

---

## 4. Breaking Changes Summary
- **Minimum Requirements**: AngularJS 1.8.x and Chart.js 4.x.
- **Global `Chart`**: The library no longer attempts to auto-inject Chart.js; it expects the `Chart` class to be available in the environment.
- **Encapsulated Defaults**: The library no longer mutates `Chart.defaults`. Opinionated defaults are now internal to `ChartJsProvider`. If you relied on `angular-chart.js` to configure other non-Angular charts globally, you must now configure them manually in `Chart.defaults`.
- **Events**: Event arguments (like `points` in `chart-click`) now match the Chart.js 4.x `ActiveElement` structure.
