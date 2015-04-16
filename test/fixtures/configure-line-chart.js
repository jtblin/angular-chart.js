(function () {
  'use strict';

  var app = angular.module('line', ['chart.js']);

  app.config(function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#FF5252', '#FF8A80'],
      responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
    });
  });

  app.controller('LineCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [[15, 23], [59, 80]];

    // Configure only this instance
    $scope.options = {
      scaleLineWidth: 5
    };

    $timeout(function () {
      $scope.data = [[15, 23], [59, 80]];
    }, 0);
  }]);

})();
