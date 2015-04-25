(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);

  app.directive('mySpecialPie', function (ChartJsFactory) { return new ChartJsFactory('Pie'); });

  app.controller('PieCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [5, 59];

    $timeout(function () {
      $scope.data = [5, 65];
    }, 0);
  }]);

})();
