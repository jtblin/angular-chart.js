/*jshint mocha:true*/
/*global module:true*/
/*global inject:true*/
/*global expect:true*/
/*global sinon:true*/

describe('Unit testing', function () {
  'use strict';

  var $compile, scope, sandbox, ChartJs, ChartJsProvider;

  beforeEach(module('chart.js', function (_ChartJsProvider_) {
    ChartJsProvider = _ChartJsProvider_;
    ChartJsProvider.setOptions({ env: 'test', responsive: false });
  }));

  beforeEach(inject(function (_$compile_, _$rootScope_, _ChartJs_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    scope = _$rootScope_;
    ChartJs = _ChartJs_;
    sandbox = sinon.sandbox.create();
  }));

  afterEach(function () {
    sandbox.restore();
  });

  describe('base', function () {
    describe('chart types', function () {
      ['line', 'bar', 'horizontalBar', 'radar', 'pie', 'doughnut', 'polarArea', 'bubble'].forEach(function (type) {
        it('creates a ' + type + ' chart using the directive', function () {
          var markup = '<canvas class="chart chart-' +
            (type === 'polarArea' ? 'polar-area' : type === 'horizontalBar' ? 'horizontal-bar' : type) +
              '" chart-data="data" chart-labels="labels"></canvas>';

          if (['line', 'bar', 'horizontalBar', 'radar'].indexOf(type) > - 1) {
            scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            scope.data = [
              [65, 59, 80, 81, 56, 55, 40],
              [28, 48, 40, 19, 86, 27, 90]
            ];
          } else {
            scope.labels = ['Downloads', 'In store', 'Mail orders'];
            scope.data = [300, 500, 100];
          }

          var spyChart = sandbox.spy(ChartJs, 'Chart');

          scope.$on('chart-create', function (evt, chart) {
            expect(chart).to.be.an.instanceOf(Chart.Controller);
          });

          $compile(markup)(scope);
          scope.$digest();

          expect(spyChart).to.have.been.calledWithNew;
          expect(spyChart).to.have.been.calledWithExactly(
            sinon.match.any,
            sinon.match({ type: type, data: sinon.match.object, options: sinon.match.object })
          );
        });

        it('creates a ' + type + ' chart using the "chart-type" attribute', function () {
          var markup = '<div style="width: 250px; height:120px">' +
            '<canvas class="chart chart-base" chart-data="data" chart-labels="labels" ' +
            'chart-type="type"></canvas></div>';

          scope.type = type;

          if (['line', 'bar', 'horizontalBar', 'radar'].indexOf(type) > - 1) {
            scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            scope.data = [
              [65, 59, 80, 81, 56, 55, 40],
              [28, 48, 40, 19, 86, 27, 90]
            ];
          } else {
            scope.labels = ['Downloads', 'In store', 'Mail orders'];
            scope.data = [300, 500, 100];
          }

          var spyChart = sandbox.spy(ChartJs, 'Chart');

          scope.$on('chart-create', function (evt, chart) {
            expect(chart).to.be.an.instanceOf(Chart.Controller);
          });

          $compile(markup)(scope);
          scope.$digest();

          expect(spyChart).to.have.been.calledWithNew;
          expect(spyChart).to.have.been.calledWithExactly(
            sinon.match.any,
            sinon.match({ type: type, data: sinon.match.object, options: sinon.match.object })
          );
        });
      });
    });

    describe('dataset override', function () {
      it('overrides the datasets for complex charts', function () {
        var datasets;
        var markup = '<canvas class="chart chart-bar" chart-data="data" chart-labels="labels" ' +
          'chart-dataset-override="datasetOverride"></canvas>';

        scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        scope.data = [
          [65, -59, 80, 81, -56, 55, -40],
          [28, 48, -40, 19, 86, 27, 90]
        ];
        scope.datasetOverride = [
          {
            label: 'Bar chart',
            borderWidth: 1,
            type: 'bar'
          },
          {
            label: 'Line chart',
            borderWidth: 3,
            type: 'line'
          }
        ];

        scope.$on('chart-create', function (evt, chart) {
          datasets = chart.chart.config.data.datasets;
        });

        $compile(markup)(scope);
        scope.$digest();

        expect(datasets[0].label).to.equal('Bar chart');
        expect(datasets[1].label).to.equal('Line chart');
        expect(datasets[0].borderWidth).to.equal(1);
        expect(datasets[1].borderWidth).to.equal(3);
        expect(datasets[0].type).to.equal('bar');
        expect(datasets[1].type).to.equal('line');
      });

      it('overrides the dataset for simple charts', function () {
        var datasets;
        var markup = '<canvas class="chart chart-doughnut" chart-data="data" chart-labels="labels" ' +
          'chart-colors="colors" chart-dataset-override="datasetOverride"></canvas>';

        scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
        scope.labels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
        scope.data = [350, 450, 100];
        scope.datasetOverride = {
          hoverBackgroundColor: ['#45b7cd', '#ff6384', '#ff8e72'],
          hoverBorderColor: ['#45b7cd', '#ff6384', '#ff8e72']
        };

        scope.$on('chart-create', function (evt, chart) {
          datasets = chart.chart.config.data.datasets;
        });

        $compile(markup)(scope);
        scope.$digest();

        expect(datasets[0].hoverBackgroundColor).to.deep.equal(['#45b7cd', '#ff6384', '#ff8e72']);
        expect(datasets[0].hoverBorderColor).to.deep.equal(['#45b7cd', '#ff6384', '#ff8e72']);
      });
    });
  });

  describe('lifecycle', function () {
    it('watches the attributes of the chart', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" chart-type="type"></canvas></div>';

      scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      var spy = sandbox.spy(scope, '$watch');
      $compile(markup)(scope);

      // cannot get a hold of the child scope as it isn't created yet
      // so cannot be more precise on expectations
      expect(spy.calledThrice).to.be.true;
    });

    it('creates the chart only once', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" ' +
        'chart-series="series"></canvas></div>';
      var count = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.series = ['Series A', 'Series B'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
      scope.$on('chart-create', function () {
        count++;
      });

      $compile(markup)(scope);
      scope.$digest();

      expect(count).to.equal(1);
    });

    it('updates the chart', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" ' +
        'chart-series="series"></canvas></div>';
      var count = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.series = ['Series A', 'Series B'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      scope.$on('chart-update', function () {
        count++;
      });

      $compile(markup)(scope);
      scope.$digest();

      scope.data = [
        [28, 48, 40, 19, 86, 27, 90],
        [65, 59, 80, 81, 56, 55, 40]
      ];
      scope.$digest();

      expect(count).to.equal(1);
    });

    it('destroy the chart if all data is removed', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" chart-data="data" chart-labels="labels"></canvas></div>';
      var countCreate = 0, countUpdate = 0, countDestroy = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      scope.$on('chart-create', function () {
        countCreate++;
      });

      scope.$on('chart-update', function () {
        countUpdate++;
      });

      scope.$on('chart-destroy', function() {
        countDestroy++;
      });

      $compile(markup)(scope);
      scope.$digest();

      scope.data = [];
      scope.$digest();

      expect(countCreate).to.equal(1);
      expect(countUpdate).to.equal(0);
      expect(countDestroy).to.equal(1);
    });

    it('re-create the chart if data added or removed', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" ' +
        'chart-series="series"></canvas></div>';
      var countCreate = 0, countUpdate = 0, countDestroy = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      scope.$on('chart-create', function () {
        countCreate++;
      });

      scope.$on('chart-update', function () {
        countUpdate++;
      });

      scope.$on('chart-destroy', function() {
        countDestroy++;
      });

      $compile(markup)(scope);
      scope.$digest();

      scope.data = [
        [28, 48, 40, 19, 86, 27, 90],
        [65, 59, 80, 81, 56, 55, 40],
        [65, 59, 80, 81, 56, 55, 40]
      ];
      scope.$digest();

      expect(countCreate).to.equal(2);
      expect(countUpdate).to.equal(0);
      expect(countDestroy).to.equal(1);
    });

    it('should allow to set a configuration', function () {
      ChartJsProvider.setOptions({responsive: false});
      expect(ChartJs.getOptions().responsive).to.equal(false);
      expect(ChartJs.getOptions('Line').responsive).to.equal(false);
      ChartJsProvider.setOptions({responsive: true});
      expect(ChartJs.getOptions().responsive).to.equal(true);
      expect(ChartJs.getOptions('Line').responsive).to.equal(true);
    });

    it('should allow to set a configuration for a chart type', function () {
      ChartJsProvider.setOptions('Line', {responsive: false});
      expect(ChartJs.getOptions('Line').responsive).to.equal(false);
      ChartJsProvider.setOptions('Line', {responsive: true});
      expect(ChartJs.getOptions('Line').responsive).to.equal(true);
    });

    ['labels', 'colors', 'series', 'options'].forEach(function (attr) {
      it('re-creates the chart on ' + attr + ' changes', function () {
        var markup = '<div style="width: 250px; height:120px">' +
          '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" chart-series="series" ' +
            'chart-colors="colors" chart-options="options"></canvas></div>';
        var count = 0;

        scope.options = { scaleShowVerticalLines: false };
        scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        scope.series = ['Series A', 'Series B'];
        scope.colors = ['#45b7cd', '#ff6384'];
        scope.data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        scope.$on('chart-create', function () {
          count++;
        });

        $compile(markup)(scope);
        scope.$digest();

        switch (attr) {
          case 'labels':
            scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            break;
          case 'colors':
            scope.colors = ['#ff6384', '#ff8e72'];
            break;
          case 'series':
            scope.series = ['Series C', 'Series D'];
            break;
          case 'options':
            scope.options = { scaleShowVerticalLines: true };
            break;
        }
        scope.$digest();

        expect(count).to.equal(2);
      });
    });

    ['labels', 'colors', 'series', 'options'].forEach(function (attr) {
      it('does not re-create the chart on ' + attr + ' not changed', function () {
        var markup = '<div style="width: 250px; height:120px">' +
          '<canvas class="chart chart-line" chart-data="data" chart-labels="labels" chart-series="series" ' +
            'chart-colors="colors" chart-options="options"></canvas></div>';
        var count = 0;

        scope.options = { scaleShowVerticalLines: false };
        scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        scope.series = ['Series A', 'Series B'];
        scope.colors = ['#45b7cd', '#ff6384'];
        scope.data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        scope.$on('chart-create', function () {
          count++;
        });

        $compile(markup)(scope);
        scope.$digest();

        switch (attr) {
          case 'labels':
            scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
            break;
          case 'colors':
            scope.colors = ['#45b7cd', '#ff6384'];
            break;
          case 'series':
            scope.series = ['Series A', 'Series B'];
            break;
          case 'options':
            scope.options = { scaleShowVerticalLines: false };
            break;
        }
        scope.$digest();

        expect(count).to.equal(1);
      });
    });
  });
});
