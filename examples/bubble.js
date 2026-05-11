angular.module('app', ['chart.js'])
  .config(['ChartJsProvider', (ChartJsProvider) => {
    'use strict';
    ChartJsProvider.setOptions({
      tooltips: {enabled: false},
    });
  }])
  .controller('BubbleCtrl', ['$scope', '$interval', ($scope, $interval) => {
    'use strict';

    $scope.options = {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: -125,
          max: 125,
        },
        y: {
          min: -125,
          max: 125,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    createChart();
    $interval(createChart, 2000);

    function createChart() {
      $scope.series = ['Series A'];
      const data = [];
      for (let i = 0; i < 50; i++) {
        data.push({
          x: randomScalingFactor(),
          y: randomScalingFactor(),
          r: randomRadius(),
        });
      }
      $scope.data = [data];
    }

    function randomScalingFactor() {
      return (Math.random() > 0.5 ? 1.0 : -1.0) *
        Math.round(Math.random() * 100);
    }

    function randomRadius() {
      return Math.abs(randomScalingFactor()) / 4;
    }
  }]);
