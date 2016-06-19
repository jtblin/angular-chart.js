angular.module('app', ['chart.js']).controller('OverrideCtrl', ['$scope', function ($scope) {
  'use strict';

  $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

  $scope.labels1 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  $scope.data1 = [
    [65, -59, 80, 81, -56, 55, -40],
    [28, 48, -40, 19, 86, 27, 90]
  ];
  $scope.datasetOverride1 = [
    {
      label: 'Override Series A',
      borderWidth: 1,
      type: 'bar'
    },
    {
      label: 'Override Series B',
      borderWidth: 3,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      type: 'line'
    }
  ];

  $scope.labels2 = ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'];
  $scope.data2 = [350, 450, 100];
  $scope.datasetOverride2 = {
    hoverBackgroundColor: ['#45b7cd', '#ff6384', '#ff8e72'],
    hoverBorderColor: ['#45b7cd', '#ff6384', '#ff8e72']
  };
}]);
