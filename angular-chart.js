(function () {
  "use strict";

  Chart.defaults.global.responsive = true;

  var config = [
    { // blue
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)"
    },
    { // light grey
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,1)"
    },
    { // red
      fillColor: "rgba(247, 70, 74, 0.2)",
      strokeColor: "rgba(247, 70, 74, 1)",
      pointColor: "rgba(247, 70, 74, 1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(247, 70, 74, 1)"
    },
    { // yellow
      fillColor: "rgba(70, 191, 189, 0.2)",
      strokeColor: "rgba(70, 191, 189, 1)",
      pointColor: "rgba(70, 191, 189, 1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(70, 191, 189, 1)"
    },
    { // green
      fillColor: "rgba(253, 180, 92, 0.2)",
      strokeColor: "rgba(253, 180, 92, 1)",
      pointColor: "rgba(253, 180, 92, 1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(253, 180, 92, 1)"
    },
    { // grey
      fillColor: "rgba(148, 159, 177, 0.2)",
      strokeColor: "rgba(148, 159, 177, 1)",
      pointColor: "rgba(148, 159, 177, 1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(148, 159, 177, 1)"
    },
    { // dark grey
      fillColor: "rgba(77, 83, 96, 0.2)",
      strokeColor: "rgba(77, 83, 96, 1)",
      pointColor: "rgba(77, 83, 96, 1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(77, 83, 96, 1)"
    }
  ];

  angular.module("charts", [])
    .directive("chartLine", function () { return chart('Line'); })
    .directive("chartBar", function () { return chart('Bar'); })
    .directive("chartRadar", function () { return chart('Radar'); })
    .directive("chartDoughnut", function () { return chart('Doughnut'); })
    .directive("chartPie", function () { return chart('Pie'); })
    .directive("chartPolarArea", function () { return chart('PolarArea'); });

  function chart (type) {
    return {
      restrict: 'CA',
      scope: {
        id: '@',
        data: '=',
        labels: '=',
        options: '=',
        legend: '@',
        click: '='
      },
      link: function (scope, elem, attrs) {
        var chart;

        scope.$watch('data', function (newVal, oldVal) {
          if (hasDataSets(type) && Array.isArray(newVal[0]) && ! newVal[0].length) return;
          if (! chart) {
            chart = getGraph(type, scope);
            if (scope.legend) {
              elem.parent().append(chart.generateLegend());
            }
          } else {
            if (hasDataSets(type)){
              chart.datasets.forEach(function (dataset, i) {
                dataset.points = dataset.points.map(function (point, j) {
                  point.value = newVal[i][j];
                  return point;
                });
              });
            } else {
              chart.segments.forEach(function (segment, i) {
                segment.value = newVal[i];
              });
            }
            chart.update();
          }
        }, true);
      }
    };
  }

  function getGraph (type, scope) {
    var cvs = document.getElementById(scope.id), ctx = cvs.getContext("2d");
    var data = hasDataSets(type) ? getDataSets(scope.labels, scope.data) : getData(scope.labels, scope.data);
    var chart = new Chart(ctx)[type](data, scope.options || {});
    if (scope.click) {
      cvs.onclick = function (evt) {
        if (chart.getPointsAtEvent || chart.getSegmentsAtEvent) {
          var activePoints = hasDataSets(type) ? chart.getPointsAtEvent(evt) : chart.getSegmentsAtEvent(evt);
          scope.click(activePoints, evt);
        }
      };
    }
    return chart;
  }

  function hasDataSets (type) {
    return ['Line', 'Bar', 'Radar'].indexOf(type) > -1;
  }

  function getDataSets (labels, data) {
    return {
      labels: labels,
      datasets: data.map(function (item, i) {
        var dataSet = clone(config[i]);
        if (! Array.isArray(item)) {
          var key = Object.keys(item)[0];
          dataSet.label = key;
          dataSet.data = item[key];
        } else {
          dataSet.data = item;
        }
        return dataSet;
      })
    };
  }

  function clone (obj) {
    var newObj = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) newObj[key] = obj[key];
    }
    return newObj;
  }

  function getData (labels, data) {
    return labels.map(function (label, i) {
      return {
        label: label,
        value: data[i],
        color: config[i].strokeColor,
        highlight: config[i].pointHighlightStroke
      };
    });
  }

})();