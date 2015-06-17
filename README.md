# angular-chart.js

[![Bower version](https://badge.fury.io/bo/angular-chart.js.svg)](http://badge.fury.io/bo/angular-chart.js)
[![npm version](https://badge.fury.io/js/angular-chart.js.svg)](http://badge.fury.io/js/angular-chart.js)
[![Build Status](https://travis-ci.org/jtblin/angular-chart.js.png)](https://travis-ci.org/jtblin/angular-chart.js)
[![Code Climate](https://codeclimate.com/github/jtblin/angular-chart.js/badges/gpa.svg)](https://codeclimate.com/github/jtblin/angular-chart.js)

Beautiful, reactive, responsive charts for Angular.JS using [Chart.js](http://www.chartjs.org/). 

[Demo](http://jtblin.github.io/angular-chart.js/)

# Installation

    bower install angular-chart.js --save
    
or copy the files from `dist/`. Then add the sources to your code (adjust paths as needed) after 
adding the dependencies for Angular and Chart.js first:

```html
<script src="../bower_components/angular/angular.min.js"></script>
<script src="/bower_components/Chart.js/Chart.min.js"></script>
<script src="/bower_components/angular-chart.js/dist/angular-chart.js"></script>
```

# Utilisation

There are 6 types of charts so 6 directives: `chart-line`, `chart-bar`, `chart-radar`, `chart-pie`, 
`chart-polar-area`, `chart-doughnut`.

They all use mostly the same API:

- `data`: series data
- `labels`: x axis labels (line, bar, radar) or series labels (pie, doughnut, polar area)
- `options`: chart options (as from [Chart.js documentation](http://www.chartjs.org/docs/))
- `series`: (default: `[]`): series labels (line, bar, radar)
- `colours`: data colours (will use default colours if not specified)
- `getColour`: function that returns a colour in case there are not enough (will use random colours if not specified)
- `click`: onclick event handler
- `hover`: onmousemove event handler
- `legend`: (default: `false`): show legend below the chart

There is another directive `chart-base` that takes an extra attribute `chart-type` to define the type
dynamically, see [stacked bar example](http://jtblin.github.io/angular-chart.js/examples/stacked-bars.html).

## Browser compatibility

For IE8 and older browsers, you will need 
to include [excanvas](https://code.google.com/p/explorercanvas/wiki/Instructions). 
You will also need [shims](https://github.com/es-shims/es5-shim) for ES5 functions.

```html
<head>
<!--[if lt IE 9]><script src="excanvas.js"></script><![endif]-->
<!--[if lt IE 9]><script src="es5-shim.js"></script><![endif]-->
</head>
```

# Example

## Markup

```html
<canvas id="line" class="chart chart-line" data="data" labels="labels" 
	legend="true" series="series" click="onClick"></canvas> 
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

## Reactive

angular-chart.js watch updates on data, series, labels, colours and options and will update, or destroy and recreate, 
the chart on changes.

## Events

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

## Colours

There are a set of 7 default colours. Colours can be replaced using the `colours` attribute.
If there is more data than colours, colours are generated randomly or can be provided 
via a function through the `getColour` attribute.

Hex colours are converted to Chart.js colours automatically, 
including different shades for highlight, fill, stroke, etc.

# Issues

**Issues or feature requests for Chart.js (e.g. new chart type, new axis, etc.) need to be opened on 
[Chart.js issues tracker](https://github.com/nnnick/Chart.js/issues)**
 
Please check if issue exists and otherwise open issue in [github](https://github.com/jtblin/angular-chart.js/issues). 
**Please add a link to a plunker, jsbin, or equivalent.** 
Here is a [jsbin template](http://jsbin.com/dufibi/3/edit?html,js,output) for convenience.

# Contributing
 
Pull requests welcome!

1. Fork the repo
1. Make your changes
1. Run tests: `npm test`
1. Submit pull request

## Contributors

Thank you!

* [@jantimon](https://twitter.com/jantimon)
* [RevanProdigalKnight](https://github.com/RevanProdigalKnight)
* [@ManuelRauber](https://twitter.com/ManuelRauber)
* [@vad710](https://twitter.com/vad710)
* [@JAAulde](https://twitter.com/JAAulde)
* [@offsky](https://twitter.com/offsky)
* [@jonathansampson](https://twitter.com/jonathansampson)
* [@idangozlan](https://twitter.com/idangozlan)

# Author

Jerome Touffe-Blin, [@jtblin](https://twitter.com/jtblin), [About me](http://about.me/jtblin)

# License

angular-chart.js is copyright 2015 Jerome Touffe-Blin and contributors. 
It is licensed under the BSD license. See the include LICENSE file for details.
