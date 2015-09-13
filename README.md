# angular-chart.js

[![Bower version](https://badge.fury.io/bo/angular-chart.js.svg)](http://badge.fury.io/bo/angular-chart.js)
[![npm version](https://badge.fury.io/js/angular-chart.js.svg)](http://badge.fury.io/js/angular-chart.js)
[![Build Status](https://travis-ci.org/jtblin/angular-chart.js.png)](https://travis-ci.org/jtblin/angular-chart.js)
[![Code Climate](https://codeclimate.com/github/jtblin/angular-chart.js/badges/gpa.svg)](https://codeclimate.com/github/jtblin/angular-chart.js)
[![Code Coverage](https://d3s6mut3hikguw.cloudfront.net/github/jtblin/angular-chart.js/badges/coverage.svg)](https://codeclimate.com/github/jtblin/angular-chart.js)

Beautiful, reactive, responsive charts for Angular.JS using [Chart.js](http://www.chartjs.org/). 

[Demo](http://jtblin.github.io/angular-chart.js/)

# Installation

### bower

    bower install --save angular-chart.js

### npm

    npm install --save angular-chart.js

### cdn

    //cdn.jsdelivr.net/angular.chartjs/latest/angular-chart.min.js
    //cdn.jsdelivr.net/angular.chartjs/latest/angular-chart.css

### manually

or copy the files from `dist/`. 

Then add the sources to your code (adjust paths as needed) after 
adding the dependencies for Angular and Chart.js first:

```html
<head>
  <link rel="stylesheet" href="bower_components/angular-chart.js/dist/angular-chart.css" />
<head>
<body>
  ...
</body>
  <script src="bower_components/angular/angular.min.js"></script>
  <script src="bower_components/Chart.js/Chart.min.js"></script>
  <script src="bower_components/angular-chart.js/dist/angular-chart.min.js"></script>
```

# Utilisation

There are 6 types of charts so 6 directives: `chart-line`, `chart-bar`, `chart-radar`, `chart-pie`, 
`chart-polar-area`, `chart-doughnut`.

They all use mostly the same API (`[chart-]` indicates an optional but recommended prefix):

- `[chart-]data`: series data
- `[chart-]labels`: x axis labels (line, bar, radar) or series labels (pie, doughnut, polar area)
- `[chart-]options`: chart options (as from [Chart.js documentation](http://www.chartjs.org/docs/))
- `[chart-]series`: (default: `[]`): series labels (line, bar, radar)
- `[chart-]colours`: data colours (will use default colours if not specified)
- `getColour`: function that returns a colour in case there are not enough (will use random colours if not specified)
- `[chart-]click`: onclick event handler
- `[chart-]hover`: onmousemove event handler
- `[chart-]legend`: (default: `false`): show legend below the chart

*DEPRECATION WARNING*: Note that all attributes which do *not* use the `[chart-]` prefix are deprecated 
and may be removed in a future version.

There is another directive `chart-base` that takes an extra attribute `chart-type` to define the type
dynamically, see [stacked bar example](http://jtblin.github.io/angular-chart.js/examples/stacked-bars.html).

# Example

## Markup

```html
<canvas id="line" class="chart chart-line" chart-data="data" chart-labels="labels" 
	chart-legend="true" chart-series="series" chart-click="onClick"></canvas> 
```

## Javascript

```javascript
angular.module("app", ["chart.js"])
  // Optional configuration
  .config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#FF5252', '#FF8A80'],
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
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
[webpack](http://webpack.github.io/), see a [webpack example](examples/webpack.config.js).

# Reactive

angular-chart.js watch updates on data, series, labels, colours and options and will update, or destroy and recreate, 
the chart on changes.

# Events

angular-chart.js emits the following events on the `scope` and pass the chart as argument:

* `create`: when chart is created
* `update`: when chart is updated

```
$scope.$on('create', function (event, chart) {
  console.log(chart);
});
```

**Note**: the event can be emitted multiple times for each chart as the chart can be destroyed and
created multiple times during angular `watch` lifecycle.

angular-chart.js listen to the scope `destroy` event and destroy the chart when it happens.

# Colours

There are a set of 7 default colours. Colours can be replaced using the `colours` attribute.
If there is more data than colours, colours are generated randomly or can be provided 
via a function through the `getColour` attribute.

Hex colours are converted to Chart.js colours automatically, 
including different shades for highlight, fill, stroke, etc.

# Issues

**Issues or feature requests for Chart.js (e.g. new chart type, new axis, etc.) need to be opened on 
[Chart.js issues tracker](https://github.com/nnnick/Chart.js/issues)**

**For general questions about usage, please use [http://stackoverflow.com/](http://stackoverflow.com/)**
 
Please check if issue exists first, otherwise open issue in [github](https://github.com/jtblin/angular-chart.js/issues). 
**Ensure you add a link to a plunker, jsbin, or equivalent.** 
Here is a [jsbin template](http://jsbin.com/dufibi/3/edit?html,js,output) for convenience.

## Browser compatibility

For IE8 and older browsers, you will need 
to include [excanvas](https://code.google.com/p/explorercanvas/wiki/Instructions). 
You will also need a [shim](https://github.com/es-shims/es5-shim) for ES5 functions.

You also need to have  ```height``` and ```width``` attributes for the ```<canvas>``` tag of your chart if using IE8 and older browsers. If you *do not* have these attributes, you will need a 
[getComputedStyle shim](https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/getComputedStyle/polyfill.js) and the line ```document.defaultView = window;```, but there still may be errors (due to code in Chart.js).

```html
<head>
<!--[if lt IE 9]>
  <script src="excanvas.js"></script>
  <script src="es5-shim.js"></script>
<![endif]-->
</head>
```

# Contributing
 
Pull requests welcome!

1. Fork the repo
1. Make your changes
1. Run tests: `npm test`
1. Submit pull request

## Contributors

Thank you to the [contributors](https://github.com/jtblin/angular-chart.js/graphs/contributors)!

# Author

Jerome Touffe-Blin, [@jtblin](https://twitter.com/jtblin), [About me](http://about.me/jtblin)

# License

angular-chart.js is copyright 2015 Jerome Touffe-Blin and contributors. 
It is licensed under the BSD license. See the include LICENSE file for details.
