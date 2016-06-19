(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  Chart.defaults.global.legend = {
    display: false
  };

  app.controller('PieCtrl', ['$scope', function ($scope) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.colors = ['#9AFEFF', '#D1D0CE'];
    $scope.data = [49, 65];
  }]);

})();
