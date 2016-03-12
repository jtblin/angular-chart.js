(function () {
  'use strict';

  var app = angular.module('examples', ['chart.js', 'ui.bootstrap']);
  Chart.defaults.global.legend = {
    display: false
  };

  app.controller('TabsCtrl', function ($scope) {
    $scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.active = true;
    $scope.data = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100]
    ];
  });

})();
