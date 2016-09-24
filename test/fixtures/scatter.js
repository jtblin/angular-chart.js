(function () {
  'use strict';

  var app = angular.module('app', ['chart.js']);

  app.controller('ScatterCtrl', ['$scope', function ($scope) {
    $scope.data = [[{
      x: -10,
      y: -5
    }, {
      x: 0,
      y: 10
    }, {
      x: 10,
      y: 5
    }]];

    $scope.options = {
      scales: {
        xAxes: [{
          type: 'linear',
          position: 'bottom'
        }]
      }
    };

  }]);


})();
