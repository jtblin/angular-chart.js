(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  Chart.defaults.global.legend = {
    display: false
  };

  app.directive('mySpecialPie', function (ChartJsFactory) { return new ChartJsFactory('pie'); });

  app.controller('PieCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [5, 59];

    $timeout(function () {
      $scope.data = [5, 65];
    }, 0);
  }]);

})();
