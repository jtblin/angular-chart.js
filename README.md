# angular-chart.js

Beautiful, reactive, responsive charts for Angular.JS using [Chart.js](http://www.chartjs.org/). [Demo](http://jtblin.github.io/angular-chart.js/)

# Installation

    bower install angular-chart.js --save
    
or copy the files from `dist/`. Then add the sources to your code (adjust paths as needed):

```html
<script src="/bower_components/Chart.js/Chart.min.js"></script>
<script src="/bower_components/angular-chart.js/dist/angular-chart.js"></script>
```

# Utilisation

There are 6 types of charts so 6 directives: `chart-line`, `chart-bar`, `chart-radar`, `chart-pie`, `chart-polar-area`, `chart-doughnut`.

They all use mostly the same API:

- `data`: series data
- `labels`: x axis labels (line, bar, radar) or series labels (pie, doughnut, polar area)
- `options`: chart options (as from [Chart.js documentation](http://www.chartjs.org/docs/))
- `series`: (default: `[]`): series labels (line, bar, radar)
- `colours`: data colours (will use default colours if not specified)
- `click`: onclick event handler (line, radar)
- `legend`: (default: `false`): show legend below the chart

There is another directive `chart-base` that takes an extra attribute `chart-type` to define the type
dynamically.

## Browser compatibility

For IE8 and older browsers, you will need to include [excanvas](https://code.google.com/p/explorercanvas/wiki/Instructions). 
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
angular.module("app", ["chart.js"]).controller("LineCtrl", ['$scope', '$timeout', function ($scope, $timeout) {

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

# Contributing

Open issues in [github](https://github.com/jtblin/angular-chart.js/issues). 
Please add a link to a plunker, jsbin, or equivalent, here is a 
[jsbin template](http://jsbin.com/dufibi/3/edit?html,js,output) for convenience. 
Pull requests welcome.

# Author

Jerome Touffe-Blin, [@jtblin](https://twitter.com/jtblin), [About me](http://about.me/jtblin)

# License

angular-chart.js is copyright 2014 Jerome Touffe-Blin and contributors. 
It is licensed under the BSD license. See the include LICENSE file for details.
