(function () {
  "use strict";

  Chart.defaults.global.responsive = true;
  Chart.defaults.global.multiTooltipTemplate = "<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>";

  Chart.defaults.global.colours = [
    { // blue
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,0.8)"
    },
    { // light grey
      fillColor: "rgba(220,220,220,0.2)",
      strokeColor: "rgba(220,220,220,1)",
      pointColor: "rgba(220,220,220,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(220,220,220,0.8)"
    },
    { // red
      fillColor: "rgba(247,70,74,0.2)",
      strokeColor: "rgba(247,70,74,1)",
      pointColor: "rgba(247,70,74,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(247,70,74,0.8)"
    },
    { // green
      fillColor: "rgba(70,191,189,0.2)",
      strokeColor: "rgba(70,191,189,1)",
      pointColor: "rgba(70,191,189,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(70,191,189,0.8)"
    },
    { // yellow
      fillColor: "rgba(253,180,92,0.2)",
      strokeColor: "rgba(253,180,92,1)",
      pointColor: "rgba(253,180,92,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(253,180,92,0.8)"
    },
    { // grey
      fillColor: "rgba(148,159,177,0.2)",
      strokeColor: "rgba(148,159,177,1)",
      pointColor: "rgba(148,159,177,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(148,159,177,0.8)"
    },
    { // dark grey
      fillColor: "rgba(77,83,96,0.2)",
      strokeColor: "rgba(77,83,96,1)",
      pointColor: "rgba(77,83,96,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(77,83,96,1)"
    }
  ];

  angular.module("chart.js", [])
    .directive("chartBase", function () { return chart(); })
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
        series: '=',
        chartType: '=',
        legend: '@',
        click: '='
      },
      link: function (scope, elem, attrs) {
        var chart;
        var legendCreated = false;

        var createLegend = function () {
            if (scope.legend && !legendCreated) {
                elem.parent().append(chart.generateLegend());
                legendCreated = true;
            }
        }

        scope.$watch('data', function (newVal, oldVal) {
          if (hasDataSets(type) && ! newVal[0].length) return;
          var chartType = type || scope.chartType;
          if (! chartType) return;
          if (chart) updateChart(chart, chartType, newVal);
          else {
              chart = createChart(chartType, scope, elem);
              createLegend();
          }
        }, true);

        scope.$watch('chartType', function (newVal, oldVal) {
          if (! newVal) return;
          if (chart) chart.destroy();
          chart = createChart(newVal, scope, elem);
          createLegend();
        });


      }
    };
  }

  function createChart (type, scope, elem) {
    var cvs = document.getElementById(scope.id), ctx = cvs.getContext("2d");
    var data = hasDataSets(type) ? getDataSets(scope.labels, scope.data, scope.series || []) : getData(scope.labels, scope.data);
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

  function updateChart (chart, type, values) {
    if (hasDataSets(type)){
        chart.datasets.forEach(function (dataset, i) {
          (dataset.points || dataset.bars).forEach(function (dataItem, j) {
            dataItem.value = values[i][j];
          });
      });
    } else {
      chart.segments.forEach(function (segment, i) {
        segment.value = values[i];
      });
    }
    chart.update();
  }

  function hasDataSets (type) {
    return ['Line', 'Bar', 'Radar'].indexOf(type) > -1;
  }

  function getDataSets (labels, data, series) {
    return {
      labels: labels,
      datasets: data.map(function (item, i) {
        var dataSet = clone(Chart.defaults.global.colours[i]);
        dataSet.label = series[i];
        dataSet.data = item;
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
        color: Chart.defaults.global.colours[i].strokeColor,
        highlight: Chart.defaults.global.colours[i].pointHighlightStroke
      };
    });
  }

})();