(() => {
  'use strict';

  const app = angular.module('examples', ['chart.js', 'ui.bootstrap']);

  app.config((ChartJsProvider) => {
    // Configure all charts
    ChartJsProvider.setOptions({
      colors: [
        '#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1',
        '#4D5360',
      ],
    });
    // Configure all doughnut charts
    ChartJsProvider.setOptions('doughnut', {
      cutoutPercentage: 60,
    });
    ChartJsProvider.setOptions('bubble', {
      tooltips: {enabled: false},
    });
  });

  app.controller('MenuCtrl', ['$scope', ($scope) => {
    $scope.isCollapsed = true;
    $scope.charts = [
      'Line', 'Bar', 'Doughnut', 'Pie', 'Polar Area', 'Radar',
      'Horizontal Bar', 'Bubble', 'Base',
    ];
  }]);

  app.controller('LineCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      'Sunday',
    ];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90],
    ];
    $scope.onClick = (points, evt) => {
      console.log(points, evt);
    };
    $scope.onHover = (points) => {
      if (points.length > 0) {
        console.log('Point', points[0].value);
      } else {
        console.log('No point');
      }
    };
    $scope.datasetOverride = [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}];

    $scope.options = {
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left',
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            display: true,
            position: 'right',
          },
        ],
      },
    };
  }]);

  app.controller('BarCtrl', ['$scope', ($scope) => {
    $scope.options = {legend: {display: true}};
    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90],
    ];
  }]);

  app.controller('DoughnutCtrl', ['$scope', '$timeout', ($scope, $timeout) => {
    $scope.labels = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
    $scope.data = [0, 0, 0];

    $timeout(() => {
      $scope.data = [350, 450, 100];
    }, 500);
  }]);

  app.controller('PieCtrl', ['$scope', ($scope) => {
    $scope.labels = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
    $scope.data = [300, 500, 100];
    $scope.options = {legend: {display: false}};
  }]);

  app.controller('PolarAreaCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Download Sales', 'In-Store Sales', 'Mail Sales', 'Telesales',
      'Corporate Sales',
    ];
    $scope.data = [300, 500, 100, 40, 120];
    $scope.options = {legend: {display: false}};
  }]);

  app.controller('BaseCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Download Sales', 'Store Sales', 'Mail Sales', 'Telesales',
      'Corporate Sales',
    ];
    $scope.data = [300, 500, 100, 40, 120];
    $scope.type = 'polarArea';

    $scope.toggle = () => {
      $scope.type = $scope.type === 'polarArea' ? 'pie' : 'polarArea';
    };
  }]);

  app.controller('RadarCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling',
      'Running',
    ];
    $scope.options = {legend: {display: false}};

    $scope.data = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100],
    ];

    $scope.onClick = (points, evt) => {
      console.log(points, evt);
    };
  }]);

  app.controller('StackedBarCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      'Sunday',
    ];
    $scope.type = 'StackedBar';
    $scope.series = ['2015', '2016'];
    $scope.options = {
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true,
        }],
      },
    };

    $scope.data = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100],
    ];
  }]);

  app.controller('TabsCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      'Sunday',
    ];
    $scope.active = true;
    $scope.data = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100],
    ];
  }]);

  app.controller('MixedChartCtrl', ['$scope', ($scope) => {
    $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

    $scope.labels = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
      'Sunday',
    ];
    $scope.data = [
      [65, -59, 80, 81, -56, 55, -40],
      [28, 48, -40, 19, 86, 27, 90],
    ];
    $scope.datasetOverride = [
      {
        label: 'Bar chart',
        borderWidth: 1,
        type: 'bar',
      },
      {
        label: 'Line chart',
        borderWidth: 3,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: 'rgba(255,99,132,1)',
        type: 'line',
      },
    ];
  }]);

  app.controller('DataTablesCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
    ];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90],
    ];
    $scope.colors = [
      { // grey
        backgroundColor: 'rgba(148,159,177,0.2)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointHoverBackgroundColor: 'rgba(148,159,177,1)',
        borderColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      },
      { // dark grey
        backgroundColor: 'rgba(77,83,96,0.2)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointHoverBackgroundColor: 'rgba(77,83,96,1)',
        borderColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,0.8)',
      },
    ];
    $scope.options = {legend: {display: false}};
    $scope.randomize = () => {
      $scope.data = $scope.data.map((data) => {
        return data.map((y) => {
          y = y + Math.random() * 10 - 5;
          return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
        });
      });
    };
  }]);

  app.controller('BubbleCtrl', ['$scope', '$interval', ($scope, $interval) => {
    $scope.options = {
      scales: {
        xAxes: [{
          display: false,
          ticks: {
            max: 125,
            min: -125,
            stepSize: 10,
          },
        }],
        yAxes: [{
          display: false,
          ticks: {
            max: 125,
            min: -125,
            stepSize: 10,
          },
        }],
      },
    };

    createChart();
    $interval(createChart, 2000);

    function createChart() {
      $scope.data = [];
      for (let i = 0; i < 50; i++) {
        $scope.data.push([{
          x: randomScalingFactor(),
          y: randomScalingFactor(),
          r: randomRadius(),
        }]);
      }
    }

    function randomScalingFactor() {
      return (Math.random() > 0.5 ? 1.0 : -1.0) *
        Math.round(Math.random() * 100);
    }

    function randomRadius() {
      return Math.abs(randomScalingFactor()) / 4;
    }
  }]);

  app.controller('TicksCtrl', ['$scope', '$interval', ($scope, $interval) => {
    const maximum = document.getElementById('container').clientWidth / 2 || 300;
    $scope.data = [[]];
    $scope.labels = [];
    $scope.options = {
      animation: {
        duration: 0,
      },
      elements: {
        line: {
          borderWidth: 0.5,
        },
        point: {
          radius: 0,
        },
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          display: false,
        }],
        yAxes: [{
          display: false,
        }],
        gridLines: {
          display: false,
        },
      },
      tooltips: {
        enabled: false,
      },
    };

    // Update the dataset at 25FPS for a smoothly-animating chart
    $interval(() => {
      getLiveChartData();
    }, 40);

    function getLiveChartData() {
      if ($scope.data[0].length) {
        $scope.labels = $scope.labels.slice(1);
        $scope.data[0] = $scope.data[0].slice(1);
      }

      while ($scope.data[0].length < maximum) {
        $scope.labels.push('');
        $scope.data[0].push(getRandomValue($scope.data[0]));
      }
    }
  }]);

  function getRandomValue(data) {
    const l = data.length;
    const previous = l ? data[l - 1] : 50;
    const y = previous + Math.random() * 10 - 5;
    return y < 0 ? 0 : y > 100 ? 100 : y;
  }

  app.controller('PluginsCtrl', ['$scope', ($scope) => {
    $scope.labels = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
    ];
    $scope.data = [65, 59, 80, 81, 56, 55, 40];
    $scope.plugins = [{
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = '900 40px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(chart.width / 2, chart.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText('CONFIDENTIAL', 0, 0);
        ctx.restore();
      },
    }];
  }]);

  app.controller('NoDataCtrl', ['$scope', ($scope) => {
    $scope.labels = ['Sales', 'Support', 'Admin'];
    $scope.data = [];
    $scope.type = 'bar';
    $scope.displayWhenNoData = true;
    $scope.forceUpdate = false;

    $scope.setData = () => {
      $scope.data = [300, 500, 100];
    };

    $scope.clearData = () => {
      $scope.data = [];
    };
  }]);
})();
