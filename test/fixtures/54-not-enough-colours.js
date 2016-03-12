(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  Chart.defaults.global.legend = {
    display: false
  };

  app.controller('PieCtrl', ['$scope', function ($scope) {
    var cnt = 0;
    $scope.colors = [];
    $scope.labels = ['Series A', 'Series B'];
    $scope.chartGetColor = function () {
      return ++cnt % 2 > 0 ?
      { // red
        backgroundColor: 'rgba(247,70,74,0.2)',
        borderColor: 'rgba(247,70,74,1)',
        pointBackgroundColor: 'rgba(247,70,74,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(247,70,74,0.8)'
      }
        :
      { // green
        backgroundColor: 'rgba(70,191,189,0.2)',
        borderColor: 'rgba(70,191,189,1)',
        pointBackgroundColor: 'rgba(70,191,189,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(70,191,189,0.8)'
      };
    };
    $scope.data = [49, 65];
  }]);

})();
