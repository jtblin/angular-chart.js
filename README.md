# angular-chart.js

[![Bower version](https://badge.fury.io/bo/angular-chart.js.svg)](http://badge.fury.io/bo/angular-chart.js)
[![npm version](https://badge.fury.io/js/angular-chart.js.svg)](http://badge.fury.io/js/angular-chart.js)
[![Build Status](https://travis-ci.org/jtblin/angular-chart.js.svg?branch=master)](https://travis-ci.org/jtblin/angular-chart.js)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/6aa5ba92f4984a24874e5976ee541623)](https://www.codacy.com/app/jtblin/angular-chart-js)
[![Code Coverage](https://d3s6mut3hikguw.cloudfront.net/github/jtblin/angular-chart.js/badges/coverage.svg)](https://codeclimate.com/github/jtblin/angular-chart.js)
[![npm](https://img.shields.io/npm/dm/angular-chart.js.svg?maxAge=2592000)](https://www.npmjs.com/package/angular-chart.js)

Beautiful, reactive, responsive charts for Angular.JS using [Chart.js](http://www.chartjs.org/). 

Have a look at the [demo site](http://jtblin.github.io/angular-chart.js/) to see examples with detailed markup, 
script and options.

# Installation

This is the `1.x` branch which requires Chart.js 2.x version. Following semantic versioning,
there are numerous **breaking changes** since 0.x, notably:

* all options now need to use the `chart-` prefix
* `chart-colours` is now `chart-colors` and `chart-get-colour` is now `chart-get-color`
* chart types are in `camelCase` e.g. `line` and `polarArea`
* legend is now a Chart.js option so the `chart-legend` attribute has been removed
* events emitted on creation and update are now prefixed with `chart-` e.g. `chart-create`
* `$scope.$apply` is not called anymore on mouse hover functions calls
* obviously all Chart.js breaking changes as well in how options are set, etc.
* disabling the `responsive` option doesn't work via global `Chart.defaults.global.responsive` anymore, 
but must be set via standard options e.g. `ChartJsProvider.setOptions({ responsive: false });`
* factory now returns a module name instead of a module instance

### npm

    npm install --save angular-chart.js

### cdn

    //cdn.jsdelivr.net/angular.chartjs/latest/angular-chart.min.js

### bower

    bower install --save angular-chart.js

### manually

or copy the files from `dist/`. 

Then add the sources to your code (adjust paths as needed) after 
adding the dependencies for Angular and Chart.js first:

```html
<head>
  ...
<head>
<body>
  ...
</body>
  <script src="node_modules/angular/angular.min.js"></script>
  <script src="node_modules/chart.js/dist/Chart.min.js"></script>
  <script src="node_modules/angular-chart.js/dist/angular-chart.min.js"></script>
```

# Utilisation

There are 8 types of charts so 8 directives: `chart-line`, `chart-bar`, `chart-horizontal-bar`, `chart-radar`, 
`chart-pie`, `chart-polar-area`, `chart-doughnut`, `chart-bubble`.

Here are the options for all directives:

- `chart-data`: series data
- `chart-labels`: x axis labels (line, bar, horizontal bar, radar, bubble) or series labels (pie, doughnut, polar area)
- `chart-options`: chart options (as from [Chart.js documentation](http://www.chartjs.org/docs/))
- `chart-series`: (default: `[]`): series labels (line, bar, radar)
- `chart-colors`: data colors (will use default colors if not specified)
- `chart-get-color`: function that returns a color in case there are not enough (will use random colors if not specified)
- `chart-click`: onclick event handler
- `chart-hover`: onmousemove event handler
- `chart-dataset-override`: override individual datasets to allow per dataset configuration e.g. y-axis, mixed type chart

There is another directive `chart-base` that takes an extra attribute `chart-type` to define the type
dynamically. 

You can create mixed type chart using the `chart-dataset-override`, see 
[bar-line example](http://jtblin.github.io/angular-chart.js/examples/dataset-override.html).

See also [stacked bar example](http://jtblin.github.io/angular-chart.js/examples/stacked-bars.html).

# Example

## Markup

```html
<canvas class="chart chart-line" chart-data="data" chart-labels="labels" 
	chart-series="series" chart-click="onClick"></canvas> 
```

## Javascript

```javascript
angular.module("app", ["chart.js"])
  // Optional configuration
  .config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#FF5252', '#FF8A80'],
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: false
    });
  }])
  .controller("LineCtrl", ['$scope', '$timeout', function ($scope, $timeout) {

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  
  // Simulate async data update
  $timeout(function () {
    $scope.data = [
      [28, 48, 40, 19, 86, 27, 90],
      [65, 59, 80, 81, 56, 55, 40]
    ];
  }, 3000);
}]);
```

## AMD RequireJS

See [a simple AMD example](examples/amd.js)

## CommonJS e.g. webpack

Module should work with CommonJS out of the box e.g. [browserify](http://browserify.org/) or 
[webpack](http://webpack.github.io/), see a [webpack example](examples/webpack.commonjs.js).

# Reactive

angular-chart.js watch updates on data, series, labels, colors and options and will update, or destroy and recreate, 
the chart on changes.

# Events

angular-chart.js listens to the following events on the `scope` and acts accordingly:

* `$destroy`: call `.destroy()` on the chart
* `$resize`: call `.resize()` on the chart

angular-chart.js emits the following events on the `scope` and pass the chart as argument:

* `chart-create`: when chart is created
* `chart-update`: when chart is updated
* `chart-destroy`: when chart is destroyed

```
$scope.$on('chart-create', function (evt, chart) {
  console.log(chart);
});
```

**Note**: the event can be emitted multiple times for each chart as the chart can be destroyed and
created multiple times during angular `watch` lifecycle.

angular-chart.js listens to the scope `$destroy` event and destroys the chart when it happens.

# Colors

There are a set of 7 default colors. Colors can be replaced using the `chart-colors` attribute:

```
<canvas ... chart-colors="['#ff0000', '#00ff00', '#0000ff']">
```

If there is more data than colors, colors are generated randomly or can be provided 
via a function through the `getColor` attribute.

Hex colors are converted to Chart.js colors automatically, 
including different shades for highlight, fill, stroke, etc.

RGB colors may be input by using a string in the format "rgb(r,g,b)".

## Example - RGB Colors

```
angular.module('app',['chart.js'])
        .controller('MainController', function($scope){ 
          $scope.colors = ["rgb(159,204,0)","rgb(250,109,33)","rgb(154,154,154)"];
          $scope.labels = ["Green", "Orange", "Grey"];
          $scope.data = [300, 500, 100];
        });
```

RGBA colors may also be input by using a string in the format "rgba(r,g,b,a)".
They may be used alongside RGB colors and/or Hex colors.

## Example - RGBA Colors
```
angular.module('app',['chart.js'])
        .controller('MainController', function($scope){ 
          $scope.colors = ["rgba(159,204,0,0.5)","rgba(250,109,33,0.7)","rgba(154,154,154,0.5)"];
          $scope.labels = ["Green", "Orange", "Grey"];
          $scope.data = [300, 500, 100];
        });
```

Colors may also be input as an object by using the format in the example below.
Colors input as objects, Hex colors, RGB, and RGBA colors may be mixed and matched.

## Example - input color as an object
```
angular.module('app',['chart.js'])
        .controller('MainController', function($scope){ 
          $scope.colors = [
            {
              backgroundColor: "rgba(159,204,0, 0.2)",
              pointBackgroundColor: "rgba(159,204,0, 1)",
              pointHoverBackgroundColor: "rgba(159,204,0, 0.8)",
              borderColor: "rgba(159,204,0, 1)",
              pointBorderColor: '#fff',
              pointHoverBorderColor: "rgba(159,204,0, 1)"
            },"rgba(250,109,33,0.5)","#9a9a9a","rgb(233,177,69)"
          ];
          $scope.labels = ["Green", "Peach", "Grey", "Orange"];
          $scope.data = [300, 500, 100, 150];
        });
```

## Browser compatibility

For IE8 and older browsers, you will need 
to include [excanvas](https://code.google.com/p/explorercanvas/wiki/Instructions). 
You will also need a [shim](https://github.com/es-shims/es5-shim) for ES5 functions.

You also need to have  ```height``` and ```width``` attributes for the ```<canvas>``` tag of your chart 
if using IE8 and older browsers. If you *do not* have these attributes, you will need a 
[getComputedStyle shim](https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/getComputedStyle/polyfill.js) 
and the line ```document.defaultView = window;```, but there still may be errors (due to code in Chart.js).

```html
<head>
<!--[if lt IE 9]>
  <script src="excanvas.js"></script>
  <script src="es5-shim.js"></script>
<![endif]-->
</head>
```

# Issues

**Issues or feature requests for Chart.js (e.g. new chart type, new axis, etc.) need to be opened on 
[Chart.js issues tracker](https://github.com/nnnick/Chart.js/issues)**

**For general questions about usage, please use [http://stackoverflow.com/](http://stackoverflow.com/)**
 
Please check if issue exists first, otherwise open issue in [github](https://github.com/jtblin/angular-chart.js/issues). 
**Ensure you add a link to a plunker, jsbin, or equivalent.** 

Here is a [jsbin template](http://jsbin.com/rodunob/edit?html,js,output) for convenience.

# v0.x - Chart.js v1.x - deprecated

This is the deprecated version of angular-chart.js that uses the v1.x version of Chart.js.
If you want to use this version, please checkout the 
[chartjs-1.x branch](https://github.com/jtblin/angular-chart.js/tree/chartjs-1.x)

# Contributing
 
Pull requests welcome!

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Contributors

Thank you to the [contributors](https://github.com/jtblin/angular-chart.js/graphs/contributors)!

# Author

Jerome Touffe-Blin, [@jtblin](https://twitter.com/jtblin), [About me](http://about.me/jtblin)

# License

angular-chart.js is copyright 2016 Jerome Touffe-Blin and contributors. 
It is licensed under the BSD license. See the include LICENSE file for details.
