'use strict';
Chart.defaults.animation = false;

const app = angular.module('horizontal', ['chart.js']);
Chart.defaults.plugins.legend.display = false;

app.controller('HorizontalBarCtrl', function($scope) {
  console.log('HorizontalBarCtrl initialized');
  $scope.labels = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    'Sunday',
  ];
  $scope.active = true;
  $scope.data = [
    [65, 59, 90, 81, 56, 55, 40],
    [28, 48, 40, 19, 96, 27, 100],
  ];
  $scope.options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
  };
  $scope.colors = [
    '#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1',
    '#4D5360',
  ];
});
