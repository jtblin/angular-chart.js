(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  Chart.defaults.global.legend = {
    display: false
  };

  app.controller('PieCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.labels = ['Series A', 'Series B'];
    $scope.data = [65, 59];
    $scope.colors = [{ // red
      backgroundColor: 'rgba(247,70,74,0.2)',
      borderColor: 'rgba(247,70,74,1)',
      pointBackgroundColor: 'rgba(247,70,74,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(247,70,74,0.8)'
    },
      { // green
        backgroundColor: 'rgba(70,191,189,0.2)',
        borderColor: 'rgba(70,191,189,1)',
        pointBackgroundColor: 'rgba(70,191,189,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(70,191,189,0.8)'
      }];

    $timeout(function () {
      $scope.data = [49, 65];
    }, 0);
  }]);

})();
