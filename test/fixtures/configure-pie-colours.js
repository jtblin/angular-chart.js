(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);

  app.config(function (ChartJsProvider) {
    ChartJsProvider.setOptions({ colours: ['#ff0000', '#0000ff'] });
  });

  app.controller('PieCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [5, 59];

    $timeout(function () {
      $scope.data = [5, 65];
    }, 0);
  }]);

})();
