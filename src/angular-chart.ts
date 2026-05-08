import angular from 'angular';
import { Chart, ChartConfiguration } from 'chart.js';

interface ChartJsProviderOptions {
  responsive?: boolean;
  chartAlpha?: number;
  chartFillAlpha?: number;
  [key: string]: any;
}

interface ChartJsProviderInterface {
  setOptions(type: string | ChartJsProviderOptions, customOptions?: ChartJsProviderOptions): void;
  $get(): {
    Chart: typeof Chart;
    getOptions(type?: string): ChartJsProviderOptions;
  };
}

interface DirectiveScope extends angular.IScope {
  chartGetColor?: () => any;
  chartType: string;
  chartData: any;
  chartLabels?: any;
  chartOptions?: any;
  chartSeries?: any;
  chartColors?: any;
  chartClick?: (points: any[], evt: any, point: any) => void;
  chartHover?: (points: any[], evt: any, point: any) => void;
  chartDatasetOverride?: any;
  chartPlugins?: any;
  chartForceUpdate?: boolean;
  chartDisplayWhenNoData?: boolean;
  chart?: Chart;
}


const DEFAULT_COLORS = [
  '#97BBCD', // blue
  '#DCDCDC', // light grey
  '#F7464A', // red
  '#46BFBD', // green
  '#FDB45C', // yellow
  '#949FB1', // grey
  '#4D5360', // dark grey
];

// @ts-expect-error
Chart.defaults.plugins = Chart.defaults.plugins || {};
// @ts-expect-error
Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
Chart.defaults.plugins.tooltip.mode = 'index';
// @ts-expect-error
Chart.defaults.elements = Chart.defaults.elements || {};
// @ts-expect-error
Chart.defaults.elements.line = Chart.defaults.elements.line || {};
Chart.defaults.elements.line.borderWidth = 2;
// @ts-expect-error
Chart.defaults.elements.bar = Chart.defaults.elements.bar || {};
Chart.defaults.elements.bar.borderWidth = 2;
// @ts-expect-error
Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
Chart.defaults.plugins.legend.display = false;



const moduleName = angular.module('chart.js', [])
  .provider('ChartJs', ChartJsProvider as unknown as angular.IServiceProvider)
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
function ChartJsProvider(this: ChartJsProviderInterface) {
  let options: ChartJsProviderOptions = {
    responsive: true,
    chartAlpha: 1,
    chartFillAlpha: 0.2,
  };
  const ChartJs = {
    Chart: Chart,
    getOptions: (type?: string) => {
      const typeOptions = (type && options[type]) || {};
      const merged = angular.extend({}, options, typeOptions);
      console.log(`getOptions for ${type}:`, merged);
      return merged;
    },
  };

  /**
   * Allow to set global options during configuration
   */
  this.setOptions = function(type: string | ChartJsProviderOptions, customOptions?: ChartJsProviderOptions) {
    // If no type was specified set option for the global object
    if (! customOptions) {
      customOptions = type as ChartJsProviderOptions;
      options = angular.merge(options, customOptions);
    } else {
      // Set options for the specific chart
      options[type as string] = angular.merge(options[type as string] || {}, customOptions);
    }

    // Sync with Chart.js defaults
    Object.keys(options).forEach(key => {
      if (typeof options[key] === 'object' && key !== 'scales' && key !== 'plugins') {
        // Assume it's a chart type
        // For v4, we need to set both dataset defaults (for tension, fill, etc.)
        // and chart type defaults (for responsive, etc.)
        ChartJs.Chart.defaults.datasets[key] = angular.merge(ChartJs.Chart.defaults.datasets[key] || {}, options[key]);
        // @ts-expect-error
        ChartJs.Chart.defaults[key] = angular.merge(ChartJs.Chart.defaults[key] || {}, options[key]);
      } else {
        ChartJs.Chart.defaults[key] = options[key];
      }
    });
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
      link: function(scope: DirectiveScope, elem: JQuery/* , attrs */) {
        // Order of setting "watch" matter
        scope.$watch('chartData', watchData, true);
        scope.$watch('chartSeries', watchOther, true);
        scope.$watch('chartLabels', watchOther, true);
        scope.$watch('chartOptions', watchOptions, true);
        scope.$watch('chartColors', watchOther, true);
        scope.$watch('chartDatasetOverride', watchOther, true);
        scope.$watch('chartType', watchType, false);
        scope.$watch('chartPlugins', watchOther, true);
        scope.$watch('chartDisplayWhenNoData', (newVal, oldVal) => {
          if (newVal === oldVal) {
            return;
          }
          watchData(scope.chartData);
        }, false);
        scope.$watch('chartForceUpdate', (newVal, oldVal) => {
          if (newVal === oldVal) {
            return;
          }
          watchData(scope.chartData);
        }, false);

        scope.$on('$destroy', () => destroyChart(scope));

        scope.$on('$resize', () => {
          if (scope.chart) {
            scope.chart.resize();
          }
        });

        function watchData(newVal: any, oldVal?: any) {
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

        function isDataEmpty(data: any) {
          return ! data || ! data.length ||
              (Array.isArray(data[0]) && ! data[0].length);
        }

        function watchOptions(newVal: any, oldVal: any) {
          if (isEmpty(newVal)) {
            return;
          }
          if (angular.equals(newVal, oldVal)) {
            return;
          }
          updateChartOptions(newVal, scope);
        }

        function watchOther(newVal: any, oldVal: any) {
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

        function watchType(newVal: any, oldVal: any) {
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

  function createChart(type: string, scope: DirectiveScope, elem: JQuery) {
    if (type === 'horizontalBar') {
      type = 'bar';
      scope.chartOptions = angular.merge({ indexAxis: 'y' }, scope.chartOptions || {});
    }
    const options = getChartOptions(type, scope);
    if (! scope.chartDisplayWhenNoData &&
        (! hasData(scope) || ! canDisplay(type, scope, elem, options))) {
      return;
    }

    const cvs = elem[0];
    const ctx = (cvs as HTMLCanvasElement).getContext('2d');

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

  function canUpdateChart(newVal: any, oldVal: any) {
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

  function getEventHandler(scope: DirectiveScope, action: string, triggerOnlyOnChange: boolean) {
    const lastState = {
      point: undefined,
      points: undefined,
    };
    return function(evt) {
      const points = scope.chart.getElementsAtEventForMode(evt, 'nearest', {intersect: true}, false);
      const point = points[0];

      const pointsChanged = !angular.equals(lastState.points, points);
      const pointChanged = !angular.equals(lastState.point, point);

      if (triggerOnlyOnChange === false ||
        (pointsChanged && pointChanged)
      ) {
        lastState.point = point;
        lastState.points = points;
        scope[action](points, evt, point);
      }
    };
  }

  function getColors(type: string, scope: DirectiveScope) {
    const colors = angular.copy(scope.chartColors ||
      ChartJs.getOptions(type).chartColors ||
      ChartJs.getOptions(type).colors ||
      DEFAULT_COLORS,
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
    const options = getChartOptions(type, scope);
    const alpha = options.chartAlpha;
    const fillAlpha = options.chartFillAlpha;
    return colors.map((color) => convertColor(color, alpha, fillAlpha));
  }

  function convertColor(color, alpha, fillAlpha) {
    // Allows RGB and RGBA colors to be input as a string: e.g.: "rgb(159,204,0)", "rgba(159,204,0, 0.5)"
    if (typeof color === 'string' && color[0] === 'r') {
      return getColor(rgbStringToRgb(color), alpha, fillAlpha);
    }
    // Allows hex colors to be input as a string.
    if (typeof color === 'string' && color[0] === '#') {
      return getColor(hexToRgb(color.substr(1)), alpha, fillAlpha);
    }
    // Allows colors to be input as an object, bypassing getColor() entirely
    if (typeof color === 'object' && color !== null) {
      return color;
    }
    return getRandomColor(alpha, fillAlpha);
  }

  function getRandomColor(alpha, fillAlpha) {
    const color = [
      getRandomInt(0, 255),
      getRandomInt(0, 255),
      getRandomInt(0, 255),
    ];
    return getColor(color, alpha, fillAlpha);
  }

  function getColor(color, alpha, fillAlpha) {
    const a = color[3] || alpha || 1;
    const f = fillAlpha || 0.2;
    color = color.slice(0, 3);
    return {
      backgroundColor: rgba(color, f),
      pointBackgroundColor: rgba(color, a),
      pointHoverBackgroundColor: rgba(color, 0.8),
      borderColor: rgba(color, a),
      pointBorderColor: '#fff',
      pointHoverBorderColor: rgba(color, a),
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
        type,
      ) :
      getData(
        scope.chartLabels,
        scope.chartData,
        colors,
        scope.chartDatasetOverride,
        type,
      );
  }

  function getDataSets(labels, data, series, colors, datasetOverride, type) {
    const typeOptions = ChartJs.getOptions(type);
    return {
      labels: labels,
      datasets: data.map((item, i) => {
        const color = colors[i];
        const dataset = angular.extend({}, typeOptions, color, {
          label: series[i],
          data: item,
        });
        if (type === 'bubble') {
          dataset.pointBackgroundColor = dataset.backgroundColor;
        }
        if (type === 'bar') {
          dataset.backgroundColor = color.pointBackgroundColor;
        }
        if (datasetOverride && datasetOverride.length > i) {
          angular.merge(dataset, datasetOverride[i]);
        }

        return dataset;
      }),
    };
  }

  function getData(labels, data, colors, datasetOverride, type) {
    const dataset = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.map((color) => color.pointBackgroundColor),
        hoverBackgroundColor: colors.map((color) => color.backgroundColor),
      }],
    };
    if (type === 'bubble') {
      dataset.datasets[0].backgroundColor = colors.map((color) => color.backgroundColor);
    }
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

  function updateChart(values: any, scope: DirectiveScope) {
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

  function destroyChart(scope: DirectiveScope) {
    if (! scope.chart) {
      return;
    }
    scope.chart.destroy();
    scope.$emit('chart-destroy', scope.chart);
  }
}
export default moduleName;
