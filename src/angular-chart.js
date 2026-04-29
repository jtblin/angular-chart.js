import angular from 'angular';
import Chart from 'chart.js';

Chart.defaults.global.multiTooltipTemplate =
  '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>';
Chart.defaults.global.tooltips.mode = 'label';
Chart.defaults.global.elements.line.borderWidth = 2;
Chart.defaults.global.elements.rectangle.borderWidth = 2;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.colors = [
  '#97BBCD', // blue
  '#DCDCDC', // light grey
  '#F7464A', // red
  '#46BFBD', // green
  '#FDB45C', // yellow
  '#949FB1', // grey
  '#4D5360', // dark grey
];

const moduleName = angular.module('chart.js', [])
  .provider('ChartJs', ChartJsProvider)
  .factory('ChartJsFactory', ['ChartJs', '$timeout', ChartJsFactory])
  .directive('chartBase', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory();
  }])
  .directive('chartLine', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('line');
  }])
  .directive('chartBar', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('bar');
  }])
  .directive('chartHorizontalBar', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('horizontalBar');
  }])
  .directive('chartRadar', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('radar');
  }])
  .directive('chartDoughnut', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('doughnut');
  }])
  .directive('chartPie', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('pie');
  }])
  .directive('chartPolarArea', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('polarArea');
  }])
  .directive('chartBubble', ['ChartJsFactory', (ChartJsFactory) => {
    return new ChartJsFactory('bubble');
  }])
  .name;

/**
 * Wrapper for chart.js
 * Allows configuring chart js using the provider
 *
 * angular.module('myModule', ['chart.js']).config(function(ChartJsProvider) {
 *   ChartJsProvider.setOptions({ responsive: false });
 *   ChartJsProvider.setOptions('Line', { responsive: true });
 * })))
 */
function ChartJsProvider() {
  let options = {responsive: true};
  const ChartJs = {
    Chart: Chart,
    getOptions: (type) => {
      const typeOptions = type && options[type] || {};
      return angular.extend({}, options, typeOptions);
    },
  };

  /**
   * Allow to set global options during configuration
   */
  this.setOptions = function(type, customOptions) {
    // If no type was specified set option for the global object
    if (! customOptions) {
      customOptions = type;
      options = angular.merge(options, customOptions);
    } else {
      // Set options for the specific chart
      options[type] = angular.merge(options[type] || {}, customOptions);
    }

    angular.merge(ChartJs.Chart.defaults, options);
  };

  this.$get = () => ChartJs;
}

function ChartJsFactory(ChartJs, $timeout) {
  return function chart(type) {
    return {
      restrict: 'CA',
      scope: {
        chartGetColor: '=?',
        chartType: '=',
        chartData: '=?',
        chartLabels: '=?',
        chartOptions: '=?',
        chartSeries: '=?',
        chartColors: '=?',
        chartClick: '=?',
        chartHover: '=?',
        chartDatasetOverride: '=?',
        chartPlugins: '=?',
        chartForceUpdate: '=?',
        chartDisplayWhenNoData: '=?',
      },
      link: function(scope, elem/* , attrs */) {
        // Order of setting "watch" matter
        scope.$watch('chartData', watchData, true);
        scope.$watch('chartSeries', watchOther, true);
        scope.$watch('chartLabels', watchOther, true);
        scope.$watch('chartOptions', watchOptions, true);
        scope.$watch('chartColors', watchOther, true);
        scope.$watch('chartDatasetOverride', watchOther, true);
        scope.$watch('chartType', watchType, false);

        scope.$on('$destroy', () => destroyChart(scope));

        scope.$on('$resize', () => {
          if (scope.chart) {
            scope.chart.resize();
          }
        });

        function watchData(newVal, oldVal) {
          if (! scope.chartDisplayWhenNoData && isDataEmpty(newVal)) {
            destroyChart(scope);
            return;
          }
          const chartType = type || scope.chartType;
          if (! chartType) {
            return;
          }

          if (scope.chart &&
              (canUpdateChart(newVal, oldVal) || scope.chartForceUpdate)) {
            return updateChart(newVal, scope);
          }

          createChart(chartType, scope, elem);
        }

        function isDataEmpty(data) {
          return ! data || ! data.length ||
              (Array.isArray(data[0]) && ! data[0].length);
        }

        function watchOptions(newVal, oldVal) {
          if (isEmpty(newVal)) {
            return;
          }
          if (angular.equals(newVal, oldVal)) {
            return;
          }
          updateChartOptions(newVal, scope);
        }

        function watchOther(newVal, oldVal) {
          if (isEmpty(newVal)) {
            return;
          }
          if (angular.equals(newVal, oldVal)) {
            return;
          }
          const chartType = type || scope.chartType;
          if (! chartType) {
            return;
          }

          // chart.update() doesn't work for series and labels
          // so we have to re-create the chart entirely
          createChart(chartType, scope, elem);
        }

        function watchType(newVal, oldVal) {
          if (isEmpty(newVal)) {
            return;
          }
          if (angular.equals(newVal, oldVal)) {
            return;
          }
          createChart(newVal, scope, elem);
        }
      },
    };
  };

  function createChart(type, scope, elem) {
    const options = getChartOptions(type, scope);
    if (! scope.chartDisplayWhenNoData &&
        (! hasData(scope) || ! canDisplay(type, scope, elem, options))) {
      return;
    }

    const cvs = elem[0];
    const ctx = cvs.getContext('2d');

    scope.chartGetColor = getChartColorFn(scope);
    const data = getChartData(type, scope);
    // Destroy old chart if it exists to avoid ghost charts issue
    // https://github.com/jtblin/angular-chart.js/issues/187
    destroyChart(scope);

    scope.chart = new ChartJs.Chart(ctx, {
      type: type,
      data: data,
      options: options,
      plugins: scope.chartPlugins,
    });
    scope.$emit('chart-create', scope.chart);
    bindEvents(cvs, scope);
  }

  function canUpdateChart(newVal, oldVal) {
    if (newVal && oldVal && newVal.length && oldVal.length) {
      return Array.isArray(newVal[0]) ?
        newVal.length === oldVal.length &&
        newVal.every((element, index) =>
          element.length === oldVal[index].length) :
        oldVal.reduce(sum, 0) > 0 ?
          newVal.length === oldVal.length : false;
    }
    return false;
  }

  function sum(carry, val) {
    return carry + val;
  }

  function getEventHandler(scope, action, triggerOnlyOnChange) {
    const lastState = {
      point: undefined,
      points: undefined,
    };
    return function(evt) {
      const atEvent = scope.chart.getElementAtEvent ||
        scope.chart.getPointAtEvent;
      const atEvents = scope.chart.getElementsAtEvent ||
        scope.chart.getPointsAtEvent;
      if (atEvents) {
        const points = atEvents.call(scope.chart, evt);
        const point = atEvent ? atEvent.call(scope.chart, evt)[0] : undefined;

        const pointsChanged = !angular.equals(lastState.points, points);
        const pointChanged = !angular.equals(lastState.point, point);

        if (triggerOnlyOnChange === false ||
          (pointsChanged && pointChanged)
        ) {
          lastState.point = point;
          lastState.points = points;
          scope[action](points, evt, point);
        }
      }
    };
  }

  function getColors(type, scope) {
    const colors = angular.copy(scope.chartColors ||
      ChartJs.getOptions(type).chartColors ||
      Chart.defaults.global.colors,
    );
    const notEnoughColors = colors.length < scope.chartData.length;
    while (colors.length < scope.chartData.length) {
      colors.push(scope.chartGetColor());
    }

    // mutate colors in this case as we don't want
    // the colors to change on each refresh
    if (notEnoughColors) {
      scope.chartColors = colors;
    }
    return colors.map(convertColor);
  }

  function convertColor(color) {
    // Allows RGB and RGBA colors to be input as a string: e.g.: "rgb(159,204,0)", "rgba(159,204,0, 0.5)"
    if (typeof color === 'string' && color[0] === 'r') {
      return getColor(rgbStringToRgb(color));
    }
    // Allows hex colors to be input as a string.
    if (typeof color === 'string' && color[0] === '#') {
      return getColor(hexToRgb(color.substr(1)));
    }
    // Allows colors to be input as an object, bypassing getColor() entirely
    if (typeof color === 'object' && color !== null) {
      return color;
    }
    return getRandomColor();
  }

  function getRandomColor() {
    const color = [
      getRandomInt(0, 255),
      getRandomInt(0, 255),
      getRandomInt(0, 255),
    ];
    return getColor(color);
  }

  function getColor(color) {
    const alpha = color[3] || 1;
    color = color.slice(0, 3);
    return {
      backgroundColor: rgba(color, 0.2),
      pointBackgroundColor: rgba(color, alpha),
      pointHoverBackgroundColor: rgba(color, 0.8),
      borderColor: rgba(color, alpha),
      pointBorderColor: '#fff',
      pointHoverBorderColor: rgba(color, alpha),
    };
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rgba(color, alpha) {
    return `rgba(${color.concat(alpha).join(',')})`;
  }

  // Credit: http://stackoverflow.com/a/11508164/1190235
  function hexToRgb(hex) {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  }

  function rgbStringToRgb(color) {
    const match = color.match(/^rgba?\(([\d,.]+)\)$/);
    if (! match) {
      throw new Error('Cannot parse rgb value');
    }
    color = match[1].split(',');
    return color.map(Number);
  }

  function hasData(scope) {
    return scope.chartData && scope.chartData.length;
  }

  function getChartColorFn(scope) {
    return typeof scope.chartGetColor === 'function' ?
      scope.chartGetColor :
      getRandomColor;
  }

  function getChartData(type, scope) {
    const colors = getColors(type, scope);
    return Array.isArray(scope.chartData[0]) ?
      getDataSets(
        scope.chartLabels,
        scope.chartData,
        scope.chartSeries || [],
        colors,
        scope.chartDatasetOverride,
      ) :
      getData(
        scope.chartLabels,
        scope.chartData,
        colors,
        scope.chartDatasetOverride,
      );
  }

  function getDataSets(labels, data, series, colors, datasetOverride) {
    return {
      labels: labels,
      datasets: data.map((item, i) => {
        const dataset = angular.extend({}, colors[i], {
          label: series[i],
          data: item,
        });
        if (datasetOverride && datasetOverride.length >= i) {
          angular.merge(dataset, datasetOverride[i]);
        }

        return dataset;
      }),
    };
  }

  function getData(labels, data, colors, datasetOverride) {
    const dataset = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.map((color) => color.pointBackgroundColor),
        hoverBackgroundColor: colors.map((color) => color.backgroundColor),
      }],
    };
    if (datasetOverride) {
      angular.merge(dataset.datasets[0], datasetOverride);
    }

    return dataset;
  }

  function getChartOptions(type, scope) {
    return angular.extend({}, ChartJs.getOptions(type), scope.chartOptions);
  }

  function updateChartOptions(values, scope) {
    if (values && scope.chart) {
      Object.keys(values).forEach((key) => {
        scope.chart.options[key] = values[key];
      });
      scope.chart.update();
      scope.$emit('chart-update', scope.chart);
    }
  }

  function bindEvents(cvs, scope) {
    cvs.onclick = scope.chartClick ?
      getEventHandler(scope, 'chartClick', false) :
      angular.noop;
    cvs.onmousemove = scope.chartHover ?
      getEventHandler(scope, 'chartHover', true) :
      angular.noop;
  }

  function updateChart(values, scope) {
    if (Array.isArray(scope.chartData[0])) {
      scope.chart.data.datasets.forEach((dataset, i) => {
        dataset.data = values[i];
      });
    } else {
      scope.chart.data.datasets[0].data = values;
    }


    scope.chart.update();
    scope.$emit('chart-update', scope.chart);
  }

  function isEmpty(value) {
    return ! value ||
      (Array.isArray(value) && ! value.length) ||
      (typeof value === 'object' && ! Object.keys(value).length);
  }

  function canDisplay(type, scope, elem, options) {
    // TODO: check parent?
    if (options.responsive && elem[0].clientHeight === 0) {
      $timeout(() => {
        createChart(type, scope, elem);
      }, 50, false);
      return false;
    }
    return true;
  }

  function destroyChart(scope) {
    if (! scope.chart) {
      return;
    }
    scope.chart.destroy();
    scope.$emit('chart-destroy', scope.chart);
  }
}
export default moduleName;
