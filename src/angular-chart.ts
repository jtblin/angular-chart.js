import angular from 'angular';
import {Chart, ChartConfiguration, ChartOptions, ChartType, ChartDataset, Plugin, ActiveElement} from 'chart.js';

export interface ChartColor {
  backgroundColor: string;
  pointBackgroundColor: string;
  pointHoverBackgroundColor: string;
  borderColor: string;
  pointBorderColor: string;
  pointHoverBorderColor: string;
}

export interface ChartJsProviderOptions extends Partial<ChartOptions> {
  chartAlpha?: number;
  chartFillAlpha?: number;
  [key: string]: unknown;
}

export interface ChartJsService {
  Chart: typeof Chart;
  getOptions(type?: string): ChartJsProviderOptions;
}

export interface ChartJsProviderInterface {
  setOptions(type: string | ChartJsProviderOptions, customOptions?: ChartJsProviderOptions): void;
  setChart(ChartConstructor: typeof Chart): void;
  register(...components: any[]): void;
  $get(): ChartJsService;
}

export interface DirectiveScope extends angular.IScope {
  chartGetColor?: () => ChartColor;
  chartType: ChartType | string;
  chartData: ChartDataset['data'] | ChartDataset['data'][];
  chartLabels?: (string | number | string[] | number[])[];
  chartOptions?: ChartOptions;
  chartSeries?: string[];
  chartColors?: (string | ChartColor)[];
  chartClick?: (points: ActiveElement[], evt: MouseEvent | TouchEvent, point: ActiveElement) => void;
  chartHover?: (points: ActiveElement[], evt: MouseEvent | TouchEvent, point: ActiveElement) => void;
  chartDatasetOverride?: Partial<ChartDataset> | Partial<ChartDataset>[];
  chartPlugins?: Plugin[];
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
  let chartConstructor: typeof Chart = Chart;
  let options: ChartJsProviderOptions = {
    responsive: true,
    chartAlpha: 1,
    chartFillAlpha: 0.2,
    plugins: {
      tooltip: {
        mode: 'index',
      },
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      bar: {
        borderWidth: 2,
      },
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
  };

  this.setChart = function(CustomChart: typeof Chart) {
    chartConstructor = CustomChart;
  };

  this.register = function(...components: any[]) {
    chartConstructor.register(...components);
  };

  this.$get = function() {
    return {
      Chart: chartConstructor,
      getOptions: function(type?: string) {
        const typeOptions = (type && options[type]) || {};
        return angular.extend({}, options, typeOptions);
      },
    };
  };
}

function ChartJsFactory(ChartJs: ChartJsService, $timeout: angular.ITimeoutService) {
  return function chart(type?: string) {
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
      link: function(scope: DirectiveScope, elem: angular.IAugmentedJQuery/* , attrs */) {
        // Order of setting "watch" matter
        scope.$watch('chartData', watchDataUpdate, true);
        scope.$watch('chartSeries', watchRecreation, true);
        scope.$watch('chartLabels', watchRecreation, true);
        scope.$watch('chartOptions', watchOptions, true);
        scope.$watch('chartColors', watchRecreation, true);
        scope.$watch('chartDatasetOverride', watchRecreation, true);
        scope.$watch('chartType', watchType, false);
        scope.$watch('chartPlugins', watchRecreation, true);
        scope.$watch('chartDisplayWhenNoData', (newVal, oldVal) => {
          if (newVal === oldVal) {
            return;
          }
          watchDataUpdate(scope.chartData);
        }, false);
        scope.$watch('chartForceUpdate', (newVal, oldVal) => {
          if (newVal === oldVal) {
            return;
          }
          watchDataUpdate(scope.chartData);
        }, false);

        scope.$on('$destroy', () => destroyChart(scope));

        scope.$on('$resize', () => {
          if (scope.chart) {
            scope.chart.resize();
          }
        });


        function watchDataUpdate(newVal: unknown, oldVal?: unknown) {
          if (! scope.chartDisplayWhenNoData && isDataEmpty(newVal)) {
            destroyChart(scope);
            return;
          }
          const chartType = type || scope.chartType;
          if (! chartType) {
            return;
          }

          if (scope.chart &&
              (canUpdateChart(newVal as unknown[] | undefined, oldVal as unknown[] | undefined) ||
               scope.chartForceUpdate)) {
            return updateChart(newVal as ChartDataset['data'], scope);
          }

          createChart(chartType, scope, elem);
        }

        function isDataEmpty(data: unknown) {
          if (! Array.isArray(data)) {
            return ! data;
          }
          return ! data.length ||
              (Array.isArray(data[0]) && ! data[0].length);
        }

        function watchOptions(newVal: ChartOptions, oldVal: ChartOptions) {
          if (isEmpty(newVal)) {
            return;
          }
          if (angular.equals(newVal, oldVal)) {
            return;
          }
          updateChartOptions(newVal, scope);
        }

        function watchRecreation(newVal: unknown, oldVal: unknown) {
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

        function watchType(newVal: string, oldVal: string) {
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

  function createChart(type: string, scope: DirectiveScope, elem: angular.IAugmentedJQuery) {
    if (type === 'horizontalBar') {
      type = 'bar';
      scope.chartOptions = angular.merge({indexAxis: 'y'}, scope.chartOptions || {});
    }
    const options = getChartOptions(type, scope);
    if (! scope.chartDisplayWhenNoData &&
        (! hasData(scope) || ! canDisplay(type, scope, elem, options))) {
      return;
    }

    const cvs = elem[0];
    const ctx = (cvs as HTMLCanvasElement).getContext('2d');
    if (! ctx) {
      return;
    }

    scope.chartGetColor = getChartColorFn(scope);
    const data = getChartData(type, scope);

    // Destroy old chart if it exists to avoid ghost charts issue
    // https://github.com/jtblin/angular-chart.js/issues/187
    destroyChart(scope);

    scope.chart = new ChartJs.Chart(ctx, {
      type: type as ChartType,
      data: data as ChartConfiguration['data'],
      options: options,
      plugins: scope.chartPlugins,
    });
    scope.$emit('chart-create', scope.chart);
    bindEvents(cvs as HTMLCanvasElement, scope);
  }

  function canUpdateChart(newVal: unknown[] | undefined, oldVal: unknown[] | undefined) {
    if (newVal && oldVal && newVal.length && oldVal.length) {
      return Array.isArray(newVal[0]) ?
        newVal.length === oldVal.length &&
        (newVal as unknown[][]).every((element: unknown[], index: number) =>
          element.length === (oldVal[index] as unknown[]).length) :
        (oldVal as number[]).reduce(sum, 0) > 0 ?
          newVal.length === oldVal.length : false;
    }
    return false;
  }

  function sum(carry: number, val: number) {
    return carry + val;
  }

  function getEventHandler(scope: DirectiveScope, action: string, triggerOnlyOnChange: boolean) {
    const lastState: { point?: ActiveElement, points?: ActiveElement[] } = {
      point: undefined,
      points: undefined,
    };
    return function(evt: MouseEvent | TouchEvent) {
      if (! scope.chart) {
        return;
      }
      const points = scope.chart.getElementsAtEventForMode(evt, 'nearest', {intersect: true}, false);
      const point = points[0];

      const pointsChanged = !angular.equals(lastState.points, points);
      const pointChanged = !angular.equals(lastState.point, point);

      if (triggerOnlyOnChange === false ||
        (pointsChanged && pointChanged)
      ) {
        lastState.point = point as ActiveElement;
        lastState.points = points as ActiveElement[];
        if (scope[action as keyof DirectiveScope]) {
          (scope[action as keyof DirectiveScope] as Function)(points, evt, point);
        }
      }
    };
  }

  function getColors(type: string, scope: DirectiveScope) {
    const colors = angular.copy((scope.chartColors ||
      ChartJs.getOptions(type).chartColors ||
      ChartJs.getOptions(type).colors ||
      DEFAULT_COLORS) as (string | ChartColor)[]);
    const data = scope.chartData as unknown[];
    const notEnoughColors = colors.length < data.length;
    while (colors.length < data.length) {
      colors.push(scope.chartGetColor!());
    }

    // mutate colors in this case as we don't want
    // the colors to change on each refresh
    if (notEnoughColors) {
      scope.chartColors = colors;
    }
    const options = getChartOptions(type, scope);
    const alpha = options.chartAlpha;
    const fillAlpha = options.chartFillAlpha;
    return colors.map((color: string | ChartColor) => convertColor(color, alpha, fillAlpha));
  }

  function convertColor(color: string | ChartColor, alpha?: number, fillAlpha?: number): ChartColor {
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
      return color as ChartColor;
    }
    return getRandomColor(alpha, fillAlpha);
  }

  function getRandomColor(alpha?: number, fillAlpha?: number) {
    const color = [
      getRandomInt(0, 255),
      getRandomInt(0, 255),
      getRandomInt(0, 255),
    ];
    return getColor(color, alpha, fillAlpha);
  }

  function getColor(color: number[], alpha?: number, fillAlpha?: number) {
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

  function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rgba(color: number[], alpha: number) {
    return `rgba(${color.concat(alpha).join(',')})`;
  }

  // Credit: http://stackoverflow.com/a/11508164/1190235
  function hexToRgb(hex: string) {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  }

  function rgbStringToRgb(color: string) {
    const match = color.match(/^rgba?\(([\d,.]+)\)$/);
    if (! match) {
      throw new Error('Cannot parse rgb value');
    }
    const colorArr = match[1].split(',');
    return colorArr.map(Number);
  }

  function hasData(scope: DirectiveScope) {
    return !!(scope.chartData && (scope.chartData as unknown[]).length);
  }

  function getChartColorFn(scope: DirectiveScope) {
    return typeof scope.chartGetColor === 'function' ?
      scope.chartGetColor :
      getRandomColor;
  }

  function getChartData(type: string, scope: DirectiveScope) {
    const colors = getColors(type, scope);
    return Array.isArray((scope.chartData as unknown[])[0]) ?
      getDataSets(
        scope.chartLabels,
        scope.chartData as ChartDataset['data'][],
        scope.chartSeries || [],
        colors,
        scope.chartDatasetOverride,
        type,
      ) :
      getData(
        scope.chartLabels,
        scope.chartData as ChartDataset['data'],
        colors,
        scope.chartDatasetOverride,
        type,
      );
  }

  function getDataSets(
    labels: DirectiveScope['chartLabels'],
    data: ChartDataset['data'][],
    series: string[],
    colors: ChartColor[],
    datasetOverride: DirectiveScope['chartDatasetOverride'],
    type: string,
  ) {
    const typeOptions = ChartJs.getOptions(type);
    return {
      labels: labels,
      datasets: data.map((item, i) => {
        const color = colors[i];
        const dataset = angular.extend({}, typeOptions, color, {
          label: series[i],
          data: item,
        }) as ChartDataset;
        applyDatasetOverride(dataset, i, datasetOverride);
        applyTypeSpecificDefaults(dataset, i, type, color, datasetOverride);
        return dataset;
      }),
    };
  }

  function applyDatasetOverride(dataset: ChartDataset, i: number, datasetOverride: any) {
    if (datasetOverride && Array.isArray(datasetOverride) && datasetOverride.length > i) {
      angular.merge(dataset, datasetOverride[i]);
    }
  }

  function applyTypeSpecificDefaults(
    dataset: ChartDataset,
    i: number,
    type: string,
    color: ChartColor,
    datasetOverride: any,
  ) {
    const actualType = (dataset as { type?: string }).type || type;
    if (actualType === 'bar' || actualType === 'horizontalBar') {
      if (! (datasetOverride && Array.isArray(datasetOverride) && (datasetOverride[i] as any).backgroundColor)) {
        (dataset as ChartDataset<'bar'>).backgroundColor = color.pointBackgroundColor;
      }
    }

    if (actualType === 'bubble') {
      dataset.backgroundColor = color.backgroundColor;
      (dataset as unknown as Record<string, any>).pointBackgroundColor = color.backgroundColor;
    }
  }

  function getData(
    labels: DirectiveScope['chartLabels'],
    data: ChartDataset['data'],
    colors: ChartColor[],
    datasetOverride: DirectiveScope['chartDatasetOverride'],
    type: string,
  ) {
    const isSolid = type === 'pie' || type === 'doughnut' || type === 'polarArea' ||
      type === 'bar' || type === 'horizontalBar';
    const dataset = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.map((color: ChartColor) =>
          isSolid ? color.pointBackgroundColor : color.backgroundColor),
        hoverBackgroundColor: colors.map((color: ChartColor) => color.backgroundColor),
      }] as ChartDataset[],
    };
    if (type === 'bubble') {
      dataset.datasets[0].backgroundColor = colors.map((color: ChartColor) => color.backgroundColor);
      (dataset.datasets[0] as unknown as Record<string, unknown>).pointBackgroundColor =
        colors.map((color: ChartColor) => color.backgroundColor);
    }
    if (datasetOverride && ! Array.isArray(datasetOverride)) {
      angular.merge(dataset.datasets[0], datasetOverride);
    }

    return dataset;
  }

  function getChartOptions(type: string, scope: DirectiveScope) {
    return angular.extend({}, ChartJs.getOptions(type), scope.chartOptions);
  }

  function updateChartOptions(values: Partial<ChartOptions>, scope: DirectiveScope) {
    if (values && scope.chart) {
      const options = scope.chart.options as Record<string, unknown>;
      Object.keys(values).forEach((key) => {
        options[key] = (values as Record<string, unknown>)[key];
      });
      scope.chart.update();
      scope.$emit('chart-update', scope.chart);
    }
  }

  function bindEvents(cvs: HTMLCanvasElement, scope: DirectiveScope) {
    cvs.onclick = scope.chartClick ?
      getEventHandler(scope, 'chartClick', false) :
      angular.noop;
    cvs.onmousemove = scope.chartHover ?
      getEventHandler(scope, 'chartHover', true) :
      angular.noop;
  }

  function updateChart(values: ChartDataset['data'] | ChartDataset['data'][], scope: DirectiveScope) {
    if (! scope.chart) {
      return;
    }
    if (Array.isArray((scope.chartData as unknown[])[0])) {
      scope.chart.data.datasets.forEach((dataset, i) => {
        dataset.data = (values as ChartDataset['data'][])[i];
      });
    } else {
      const dataset = scope.chart.data.datasets[0];
      if (dataset) {
        dataset.data = values as ChartDataset['data'];
      }
    }


    scope.chart.update();
    scope.$emit('chart-update', scope.chart);
  }

  function isEmpty(value: unknown) {
    return ! value ||
      (Array.isArray(value) && ! value.length) ||
      (typeof value === 'object' && value !== null && ! Object.keys(value).length);
  }

  function canDisplay(
    type: string,
    scope: DirectiveScope,
    elem: angular.IAugmentedJQuery,
    options: ChartJsProviderOptions,
  ) {
    const cvs = elem[0] as HTMLCanvasElement;
    if (options.responsive && cvs.clientHeight === 0) {
      let attempts = 0;
      const checkDimensions = () => {
        if (cvs.clientHeight > 0) {
          return createChart(type, scope, elem);
        }
        if (attempts < 5) {
          attempts++;
          window.requestAnimationFrame(checkDimensions);
        }
      };
      window.requestAnimationFrame(checkDimensions);
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
