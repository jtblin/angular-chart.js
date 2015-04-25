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
    it('replaces the element with the appropriate content', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels"></canvas></div>';

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      var element = $compile(markup)(scope);
      scope.$digest();

      expect(element.html()).to.startWith('<div class="chart-container"><canvas ');
    });

    describe('chart types', function () {
      ['Line', 'Bar', 'Radar', 'Pie', 'Doughnut', 'PolarArea'].forEach(function (type) {
        it('creates a ' + type + ' chart using the directive', function () {
          var markup = '<div style="width: 250px; height:120px"><canvas class="chart chart-' +
            (type === 'PolarArea' ? 'polar-area' : type.toLowerCase()) +
              '" data="data" labels="labels"></canvas></div>';

          scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

          if (['Line', 'Bar', 'Radar'].indexOf(type) > - 1)
            scope.data = [
              [65, 59, 80, 81, 56, 55, 40],
              [28, 48, 40, 19, 86, 27, 90]
            ];
          else
            scope.data = [300, 500, 100];

          var mock = sandbox.mock(Chart.prototype);
          mock.expects(type);

          $compile(markup)(scope);
          scope.$digest();

          mock.verify();
        });

        it('creates a ' + type + ' chart using the "chart-type" attribute"', function () {
          var markup = '<div style="width: 250px; height:120px">' +
            '<canvas class="chart chart-base" data="data" labels="labels" chart-type="type"></canvas></div>';

          scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          scope.type = type;

          if (['Line', 'Bar', 'Radar'].indexOf(type) > - 1)
            scope.data = [
              [65, 59, 80, 81, 56, 55, 40],
              [28, 48, 40, 19, 86, 27, 90]
            ];
          else
            scope.data = [300, 500, 100];

          var mock = sandbox.mock(Chart.prototype);
          mock.expects(type);

          $compile(markup)(scope);
          scope.$digest();

          mock.verify();
        });
      });
    });

    it('generates the legend', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels" legend="true"></canvas></div>';

      scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      var element = $compile(markup)(scope);
      scope.$digest();

      expect(element.html()).to.have.string('<chart-legend>');
    });
  });

  describe('lifecycle', function () {
    it('watches the attributes of the chart', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels" chart-type="type"></canvas></div>';

      scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      var mock = sandbox.mock(scope);
      // cannot get a hold of the child scope as it isn't created yet
      // so cannot be more precise on expectations
      mock.expects('$watch').atLeast(6);

      $compile(markup)(scope);

      mock.verify();
    });

    it('creates the chart only once', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels" series="series"></canvas></div>';
      var count = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.series = ['Series A', 'Series B'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
      scope.$on('create', function () {
        count++;
      });

      $compile(markup)(scope);
      scope.$digest();

      expect(count).to.equal(1);
    });

    it('updates the chart', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels" series="series"></canvas></div>';
      var count = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.series = ['Series A', 'Series B'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      scope.$on('update', function () {
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

    it('re-create the chart if data added or removed', function () {
      var markup = '<div style="width: 250px; height:120px">' +
        '<canvas class="chart chart-line" data="data" labels="labels" series="series"></canvas></div>';
      var countCreate = 0, countUpdate = 0;

      scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
      scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];

      scope.$on('create', function () {
        countCreate++;
      });

      scope.$on('update', function () {
        countUpdate++;
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

    ['labels', 'colours', 'series', 'options'].forEach(function (attr) {
      it('re-creates the chart on ' + attr + ' changes', function () {
        var markup = '<div style="width: 250px; height:120px">' +
          '<canvas class="chart chart-line" data="data" labels="labels" series="series" ' +
            'colours="colours" options="options"></canvas></div>';
        var count = 0;

        scope.options = { scaleShowVerticalLines: false };
        scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        scope.series = ['Series A', 'Series B'];
        scope.colours = [{
          fillColor: 'rgba(127,253,31,0.2)',
          pointColor: 'rgba(127,253,31,1)',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(127,253,31,0.8)',
          pointStrokeColor: '#fff',
          strokeColor: 'rgba(127,253,31,1)'
        }, {
          fillColor: 'rgba(104,240,0,0.2)',
          pointColor: 'rgba(104,240,0,1)',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(104,240,0,0.8)',
          pointStrokeColor: '#fff',
          strokeColor: 'rgba(104,240,0,1)'
        }];
        scope.data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        scope.$on('create', function () {
          count++;
        });

        $compile(markup)(scope);
        scope.$digest();

        switch (attr) {
          case 'labels':
            scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            break;
          case 'colours':
            scope.colours = [{
              fillColor: 'rgba(253,31,94,0.2)',
              pointColor: 'rgba(253,31,94,1)',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(253,31,94,0.8)',
              pointStrokeColor: '#fff',
              strokeColor: 'rgba(253,31,94,1)'
            }, {
              fillColor: 'rgba(30,249,161,0.2)',
              pointColor: 'rgba(30,249,161,1)',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(30,249,161,0.8)',
              pointStrokeColor: '#fff',
              strokeColor: 'rgba(30,249,161,1)'
            }];
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

    ['labels', 'colours', 'series', 'options'].forEach(function (attr) {
      it('does not re-create the chart on ' + attr + ' not changed', function () {
        var markup = '<div style="width: 250px; height:120px">' +
          '<canvas class="chart chart-line" data="data" labels="labels" series="series" ' +
            'colours="colours" options="options"></canvas></div>';
        var count = 0;

        scope.options = { scaleShowVerticalLines: false };
        scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        scope.series = ['Series A', 'Series B'];
        scope.colours = [{
          fillColor: 'rgba(127,253,31,0.2)',
          pointColor: 'rgba(127,253,31,1)',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(127,253,31,0.8)',
          pointStrokeColor: '#fff',
          strokeColor: 'rgba(127,253,31,1)'
        }, {
          fillColor: 'rgba(104,240,0,0.2)',
          pointColor: 'rgba(104,240,0,1)',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(104,240,0,0.8)',
          pointStrokeColor: '#fff',
          strokeColor: 'rgba(104,240,0,1)'
        }];
        scope.data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        scope.$on('create', function () {
          count++;
        });

        $compile(markup)(scope);
        scope.$digest();

        switch (attr) {
          case 'labels':
            scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
            break;
          case 'colours':
            scope.colours = [{
              fillColor: 'rgba(127,253,31,0.2)',
              pointColor: 'rgba(127,253,31,1)',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(127,253,31,0.8)',
              pointStrokeColor: '#fff',
              strokeColor: 'rgba(127,253,31,1)'
            }, {
              fillColor: 'rgba(104,240,0,0.2)',
              pointColor: 'rgba(104,240,0,1)',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(104,240,0,0.8)',
              pointStrokeColor: '#fff',
              strokeColor: 'rgba(104,240,0,1)'
            }];
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
