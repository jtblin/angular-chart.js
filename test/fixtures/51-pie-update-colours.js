(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  app.controller('PieCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [65, 59];
    $scope.colours = [{ // red
      fillColor: 'rgba(247,70,74,0.2)',
      strokeColor: 'rgba(247,70,74,1)',
      pointColor: 'rgba(247,70,74,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(247,70,74,0.8)'
    },
      { // green
        fillColor: 'rgba(70,191,189,0.2)',
        strokeColor: 'rgba(70,191,189,1)',
        pointColor: 'rgba(70,191,189,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(70,191,189,0.8)'
      }];

    $timeout(function () {
      $scope.data = [49, 65];
    }, 0);
  }]);

})();
