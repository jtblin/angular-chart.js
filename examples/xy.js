angular.module('app', ['chart.js']).controller('LineCtrl', ['$scope', function ($scope) {
  'use strict';

  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [ {x: 0, y: 10}, {x: 0, y: 1}, {x: 1, y: 6}, {x: 4, y: 2} ],
    [ {x: 0, y: 2}, {x: 5, y: 7}, {x: 4, y: 2}, {x: 2, y: 9} ]
  ];
  $scope.options = {
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom'
      }]
    }
  };
}]);

