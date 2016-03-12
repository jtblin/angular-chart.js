(function () {
  'use strict';

  var app = angular.module('line', ['chart.js']);

  app.config(function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#FF5252', '#FF8A80']
    });
    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: false
    });
  });

  app.controller('LineCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [[15, 23], [59, 80]];

    // Configure only this instance
    $scope.options = {
      legend: {
        display: false
      }
    };

    $timeout(function () {
      $scope.data = [[15, 23], [59, 80]];
    }, 0);
  }]);

})();
