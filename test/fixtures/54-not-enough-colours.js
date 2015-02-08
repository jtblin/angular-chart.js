(function () {
  'use strict';

  var app = angular.module('pie', ['chart.js']);
  app.controller('PieCtrl', ['$scope', function ($scope) {
    var cnt = 0;
    $scope.colours = [];
    $scope.labels = ['Series A', 'Series B'];
    $scope.getColour = function () {
      return ++cnt % 2 > 0 ?
      { // red
        fillColor: 'rgba(247,70,74,0.2)',
        strokeColor: 'rgba(247,70,74,1)',
        pointColor: 'rgba(247,70,74,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(247,70,74,0.8)'
      }
        :
      { // green
        fillColor: 'rgba(70,191,189,0.2)',
        strokeColor: 'rgba(70,191,189,1)',
        pointColor: 'rgba(70,191,189,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(70,191,189,0.8)'
      };
    };
    $scope.data = [49, 65];
  }]);

})();
