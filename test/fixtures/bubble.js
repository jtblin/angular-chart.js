angular.module('app', ['chart.js'])
  .config(['ChartJsProvider', function (ChartJsProvider) {
    'use strict';
    ChartJsProvider.setOptions({
      tooltips: { enabled: false }
    });
  }])
  .controller('BubbleCtrl', ['$scope',function ($scope) {
    'use strict';

    $scope.colors = [
      {
        backgroundColor: 'rgba(151,187,205,0.2)',
        pointBackgroundColor: 'rgba(151,187,205,1)',
        pointHoverBackgroundColor: 'rgba(151,187,205,0.8)',
        borderColor: 'rgba(151,187,205,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(151,187,205,1)'
      },
      {
        backgroundColor: 'rgba(220,220,220,0.2)',
        pointBackgroundColor: 'rgba(220,220,220,1)',
        pointHoverBackgroundColor: 'rgba(220,220,220,0.8)',
        borderColor: 'rgba(220,220,220,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(220,220,220,1)'
      },
      {
        backgroundColor: 'rgba(247,70,74,0.2)',
        pointBackgroundColor: 'rgba(247,70,74,1)',
        pointHoverBackgroundColor: 'rgba(247,70,74,0.8)',
        borderColor: 'rgba(247,70,74,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(247,70,74,1)'
      },
      {
        backgroundColor: 'rgba(70,191,189,0.2)',
        pointBackgroundColor: 'rgba(70,191,189,1)',
        pointHoverBackgroundColor: 'rgba(70,191,189,0.8)',
        borderColor: 'rgba(70,191,189,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(70,191,189,1)'
      },
      {
        backgroundColor: 'rgba(253,180,92,0.2)',
        pointBackgroundColor: 'rgba(253,180,92,1)',
        pointHoverBackgroundColor: 'rgba(253,180,92,0.8)',
        borderColor: 'rgba(253,180,92,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(253,180,92,1)'
      },
      {
        backgroundColor: 'rgba(148,159,177,0.2)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointHoverBackgroundColor: 'rgba(148,159,177,0.8)',
        borderColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,1)'
      },
      {
        backgroundColor: 'rgba(77,83,96,0.2)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointHoverBackgroundColor: 'rgba(77,83,96,0.8)',
        borderColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)'
      },
      {
        backgroundColor: 'rgba(151,57,74,0.2)',
        pointBackgroundColor: 'rgba(151,57,74,1)',
        pointHoverBackgroundColor: 'rgba(151,57,74,0.8)',
        borderColor: 'rgba(151,57,74,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(151,57,74,1)'
      },
      {
        backgroundColor: 'rgba(198,232,17,0.2)',
        pointBackgroundColor: 'rgba(198,232,17,1)',
        pointHoverBackgroundColor: 'rgba(198,232,17,0.8)',
        borderColor: 'rgba(198,232,17,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(198,232,17,1)'
      },
      {
        backgroundColor: 'rgba(39,249,229,0.2)',
        pointBackgroundColor: 'rgba(39,249,229,1)',
        pointHoverBackgroundColor: 'rgba(39,249,229,0.8)',
        borderColor: 'rgba(39,249,229,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(39,249,229,1)'
      },
      {
        backgroundColor: 'rgba(98,128,233,0.2)',
        pointBackgroundColor: 'rgba(98,128,233,1)',
        pointHoverBackgroundColor: 'rgba(98,128,233,0.8)',
        borderColor: 'rgba(98,128,233,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(98,128,233,1)'
      },
      {
        backgroundColor: 'rgba(195,99,4,0.2)',
        pointBackgroundColor: 'rgba(195,99,4,1)',
        pointHoverBackgroundColor: 'rgba(195,99,4,0.8)',
        borderColor: 'rgba(195,99,4,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(195,99,4,1)'
      },
      {
        backgroundColor: 'rgba(81,204,249,0.2)',
        pointBackgroundColor: 'rgba(81,204,249,1)',
        pointHoverBackgroundColor: 'rgba(81,204,249,0.8)',
        borderColor: 'rgba(81,204,249,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(81,204,249,1)'
      },
      {
        backgroundColor: 'rgba(159,197,163,0.2)',
        pointBackgroundColor: 'rgba(159,197,163,1)',
        pointHoverBackgroundColor: 'rgba(159,197,163,0.8)',
        borderColor: 'rgba(159,197,163,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(159,197,163,1)'
      },
      {
        backgroundColor: 'rgba(122,68,60,0.2)',
        pointBackgroundColor: 'rgba(122,68,60,1)',
        pointHoverBackgroundColor: 'rgba(122,68,60,0.8)',
        borderColor: 'rgba(122,68,60,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(122,68,60,1)'
      },
      {
        backgroundColor: 'rgba(183,199,142,0.2)',
        pointBackgroundColor: 'rgba(183,199,142,1)',
        pointHoverBackgroundColor: 'rgba(183,199,142,0.8)',
        borderColor: 'rgba(183,199,142,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(183,199,142,1)'
      },
      {
        backgroundColor: 'rgba(33,125,4,0.2)',
        pointBackgroundColor: 'rgba(33,125,4,1)',
        pointHoverBackgroundColor: 'rgba(33,125,4,0.8)',
        borderColor: 'rgba(33,125,4,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(33,125,4,1)'
      },
      {
        backgroundColor: 'rgba(100,33,169,0.2)',
        pointBackgroundColor: 'rgba(100,33,169,1)',
        pointHoverBackgroundColor: 'rgba(100,33,169,0.8)',
        borderColor: 'rgba(100,33,169,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(100,33,169,1)'
      },
      {
        backgroundColor: 'rgba(10,128,69,0.2)',
        pointBackgroundColor: 'rgba(10,128,69,1)',
        pointHoverBackgroundColor: 'rgba(10,128,69,0.8)',
        borderColor: 'rgba(10,128,69,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(10,128,69,1)'
      },
      {
        backgroundColor: 'rgba(55,144,44,0.2)',
        pointBackgroundColor: 'rgba(55,144,44,1)',
        pointHoverBackgroundColor: 'rgba(55,144,44,0.8)',
        borderColor: 'rgba(55,144,44,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(55,144,44,1)'
      },
      {
        backgroundColor: 'rgba(111,248,27,0.2)',
        pointBackgroundColor: 'rgba(111,248,27,1)',
        pointHoverBackgroundColor: 'rgba(111,248,27,0.8)',
        borderColor: 'rgba(111,248,27,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(111,248,27,1)'
      },
      {
        backgroundColor: 'rgba(241,104,154,0.2)',
        pointBackgroundColor: 'rgba(241,104,154,1)',
        pointHoverBackgroundColor: 'rgba(241,104,154,0.8)',
        borderColor: 'rgba(241,104,154,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(241,104,154,1)'
      },
      {
        backgroundColor: 'rgba(158,253,143,0.2)',
        pointBackgroundColor: 'rgba(158,253,143,1)',
        pointHoverBackgroundColor: 'rgba(158,253,143,0.8)',
        borderColor: 'rgba(158,253,143,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(158,253,143,1)'
      },
      {
        backgroundColor: 'rgba(186,25,134,0.2)',
        pointBackgroundColor: 'rgba(186,25,134,1)',
        pointHoverBackgroundColor: 'rgba(186,25,134,0.8)',
        borderColor: 'rgba(186,25,134,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(186,25,134,1)'
      },
      {
        backgroundColor: 'rgba(81,34,77,0.2)',
        pointBackgroundColor: 'rgba(81,34,77,1)',
        pointHoverBackgroundColor: 'rgba(81,34,77,0.8)',
        borderColor: 'rgba(81,34,77,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(81,34,77,1)'
      },
      {
        backgroundColor: 'rgba(254,6,184,0.2)',
        pointBackgroundColor: 'rgba(254,6,184,1)',
        pointHoverBackgroundColor: 'rgba(254,6,184,0.8)',
        borderColor: 'rgba(254,6,184,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(254,6,184,1)'
      },
      {
        backgroundColor: 'rgba(4,230,203,0.2)',
        pointBackgroundColor: 'rgba(4,230,203,1)',
        pointHoverBackgroundColor: 'rgba(4,230,203,0.8)',
        borderColor: 'rgba(4,230,203,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(4,230,203,1)'
      },
      {
        backgroundColor: 'rgba(204,31,79,0.2)',
        pointBackgroundColor: 'rgba(204,31,79,1)',
        pointHoverBackgroundColor: 'rgba(204,31,79,0.8)',
        borderColor: 'rgba(204,31,79,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(204,31,79,1)'
      },
      {
        backgroundColor: 'rgba(95,152,82,0.2)',
        pointBackgroundColor: 'rgba(95,152,82,1)',
        pointHoverBackgroundColor: 'rgba(95,152,82,0.8)',
        borderColor: 'rgba(95,152,82,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(95,152,82,1)'
      },
      {
        backgroundColor: 'rgba(120,249,206,0.2)',
        pointBackgroundColor: 'rgba(120,249,206,1)',
        pointHoverBackgroundColor: 'rgba(120,249,206,0.8)',
        borderColor: 'rgba(120,249,206,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(120,249,206,1)'
      },
      {
        backgroundColor: 'rgba(229,137,70,0.2)',
        pointBackgroundColor: 'rgba(229,137,70,1)',
        pointHoverBackgroundColor: 'rgba(229,137,70,0.8)',
        borderColor: 'rgba(229,137,70,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(229,137,70,1)'
      },
      {
        backgroundColor: 'rgba(54,98,166,0.2)',
        pointBackgroundColor: 'rgba(54,98,166,1)',
        pointHoverBackgroundColor: 'rgba(54,98,166,0.8)',
        borderColor: 'rgba(54,98,166,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(54,98,166,1)'
      },
      {
        backgroundColor: 'rgba(22,81,208,0.2)',
        pointBackgroundColor: 'rgba(22,81,208,1)',
        pointHoverBackgroundColor: 'rgba(22,81,208,0.8)',
        borderColor: 'rgba(22,81,208,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(22,81,208,1)'
      },
      {
        backgroundColor: 'rgba(139,248,40,0.2)',
        pointBackgroundColor: 'rgba(139,248,40,1)',
        pointHoverBackgroundColor: 'rgba(139,248,40,0.8)',
        borderColor: 'rgba(139,248,40,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(139,248,40,1)'
      },
      {
        backgroundColor: 'rgba(139,221,190,0.2)',
        pointBackgroundColor: 'rgba(139,221,190,1)',
        pointHoverBackgroundColor: 'rgba(139,221,190,0.8)',
        borderColor: 'rgba(139,221,190,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(139,221,190,1)'
      },
      {
        backgroundColor: 'rgba(230,218,251,0.2)',
        pointBackgroundColor: 'rgba(230,218,251,1)',
        pointHoverBackgroundColor: 'rgba(230,218,251,0.8)',
        borderColor: 'rgba(230,218,251,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(230,218,251,1)'
      },
      {
        backgroundColor: 'rgba(245,21,15,0.2)',
        pointBackgroundColor: 'rgba(245,21,15,1)',
        pointHoverBackgroundColor: 'rgba(245,21,15,0.8)',
        borderColor: 'rgba(245,21,15,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(245,21,15,1)'
      },
      {
        backgroundColor: 'rgba(36,166,81,0.2)',
        pointBackgroundColor: 'rgba(36,166,81,1)',
        pointHoverBackgroundColor: 'rgba(36,166,81,0.8)',
        borderColor: 'rgba(36,166,81,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(36,166,81,1)'
      },
      {
        backgroundColor: 'rgba(177,41,153,0.2)',
        pointBackgroundColor: 'rgba(177,41,153,1)',
        pointHoverBackgroundColor: 'rgba(177,41,153,0.8)',
        borderColor: 'rgba(177,41,153,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(177,41,153,1)'
      },
      {
        backgroundColor: 'rgba(44,173,178,0.2)',
        pointBackgroundColor: 'rgba(44,173,178,1)',
        pointHoverBackgroundColor: 'rgba(44,173,178,0.8)',
        borderColor: 'rgba(44,173,178,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(44,173,178,1)'
      },
      {
        backgroundColor: 'rgba(134,50,197,0.2)',
        pointBackgroundColor: 'rgba(134,50,197,1)',
        pointHoverBackgroundColor: 'rgba(134,50,197,0.8)',
        borderColor: 'rgba(134,50,197,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(134,50,197,1)'
      },
      {
        backgroundColor: 'rgba(176,188,149,0.2)',
        pointBackgroundColor: 'rgba(176,188,149,1)',
        pointHoverBackgroundColor: 'rgba(176,188,149,0.8)',
        borderColor: 'rgba(176,188,149,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(176,188,149,1)'
      },
      {
        backgroundColor: 'rgba(92,9,164,0.2)',
        pointBackgroundColor: 'rgba(92,9,164,1)',
        pointHoverBackgroundColor: 'rgba(92,9,164,0.8)',
        borderColor: 'rgba(92,9,164,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(92,9,164,1)'
      },
      {
        backgroundColor: 'rgba(184,93,102,0.2)',
        pointBackgroundColor: 'rgba(184,93,102,1)',
        pointHoverBackgroundColor: 'rgba(184,93,102,0.8)',
        borderColor: 'rgba(184,93,102,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(184,93,102,1)'
      },
      {
        backgroundColor: 'rgba(1,235,91,0.2)',
        pointBackgroundColor: 'rgba(1,235,91,1)',
        pointHoverBackgroundColor: 'rgba(1,235,91,0.8)',
        borderColor: 'rgba(1,235,91,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(1,235,91,1)'
      },
      {
        backgroundColor: 'rgba(148,100,155,0.2)',
        pointBackgroundColor: 'rgba(148,100,155,1)',
        pointHoverBackgroundColor: 'rgba(148,100,155,0.8)',
        borderColor: 'rgba(148,100,155,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(148,100,155,1)'
      },
      {
        backgroundColor: 'rgba(17,253,128,0.2)',
        pointBackgroundColor: 'rgba(17,253,128,1)',
        pointHoverBackgroundColor: 'rgba(17,253,128,0.8)',
        borderColor: 'rgba(17,253,128,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(17,253,128,1)'
      },
      {
        backgroundColor: 'rgba(107,59,91,0.2)',
        pointBackgroundColor: 'rgba(107,59,91,1)',
        pointHoverBackgroundColor: 'rgba(107,59,91,0.8)',
        borderColor: 'rgba(107,59,91,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(107,59,91,1)'
      },
      {
        backgroundColor: 'rgba(105,111,203,0.2)',
        pointBackgroundColor: 'rgba(105,111,203,1)',
        pointHoverBackgroundColor: 'rgba(105,111,203,0.8)',
        borderColor: 'rgba(105,111,203,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(105,111,203,1)'
      },
      {
        backgroundColor: 'rgba(86,123,134,0.2)',
        pointBackgroundColor: 'rgba(86,123,134,1)',
        pointHoverBackgroundColor: 'rgba(86,123,134,0.8)',
        borderColor: 'rgba(86,123,134,1)',
        pointBorderColor: '#fff',
        pointHoverBorderColor: 'rgba(86,123,134,1)'
      }
    ];

    $scope.options = {
      scales: {
        xAxes: [{
          display: false,
          ticks: {
            max: 125,
            min: -125,
            stepSize: 10
          }
        }],
        yAxes: [{
          display: false,
          ticks: {
            max: 125,
            min: -125,
            stepSize: 10
          }
        }]
      }
    };

    $scope.data = [
      [
        {
          x: -8,
          y: -72,
          r: 20.5
        }
      ],
      [
        {
          x: -14,
          y: -32,
          r: 14.25
        }
      ],
      [
        {
          x: 0,
          y: 86,
          r: 15
        }
      ],
      [
        {
          x: -13,
          y: 58,
          r: 7.75
        }
      ],
      [
        {
          x: 22,
          y: -60,
          r: 9.25
        }
      ],
      [
        {
          x: 84,
          y: -25,
          r: 15.25
        }
      ],
      [
        {
          x: 14,
          y: 85,
          r: 23.25
        }
      ],
      [
        {
          x: -2,
          y: 37,
          r: 10.75
        }
      ],
      [
        {
          x: -40,
          y: 69,
          r: 0.75
        }
      ],
      [
        {
          x: -62,
          y: -46,
          r: 19.5
        }
      ],
      [
        {
          x: 4,
          y: -1,
          r: 0.25
        }
      ],
      [
        {
          x: -34,
          y: 67,
          r: 17.5
        }
      ],
      [
        {
          x: -21,
          y: -88,
          r: 16.25
        }
      ],
      [
        {
          x: 90,
          y: 80,
          r: 24.75
        }
      ],
      [
        {
          x: 7,
          y: 93,
          r: 20.75
        }
      ],
      [
        {
          x: 48,
          y: 39,
          r: 7.75
        }
      ],
      [
        {
          x: 99,
          y: -20,
          r: 2.75
        }
      ],
      [
        {
          x: -48,
          y: 52,
          r: 4.5
        }
      ],
      [
        {
          x: -57,
          y: -39,
          r: 21
        }
      ],
      [
        {
          x: 31,
          y: -58,
          r: 3.25
        }
      ],
      [
        {
          x: 96,
          y: 62,
          r: 10.25
        }
      ],
      [
        {
          x: 58,
          y: -54,
          r: 19.5
        }
      ],
      [
        {
          x: 8,
          y: 73,
          r: 12
        }
      ],
      [
        {
          x: 67,
          y: 97,
          r: 8.5
        }
      ],
      [
        {
          x: -47,
          y: -57,
          r: 25
        }
      ],
      [
        {
          x: 0,
          y: -97,
          r: 23.5
        }
      ],
      [
        {
          x: -55,
          y: -27,
          r: 2
        }
      ],
      [
        {
          x: 68,
          y: 9,
          r: 12.25
        }
      ],
      [
        {
          x: -5,
          y: 63,
          r: 20.75
        }
      ],
      [
        {
          x: 80,
          y: 31,
          r: 18.75
        }
      ],
      [
        {
          x: 47,
          y: -21,
          r: 2.5
        }
      ],
      [
        {
          x: -72,
          y: 94,
          r: 1.25
        }
      ],
      [
        {
          x: 11,
          y: -90,
          r: 5.25
        }
      ],
      [
        {
          x: 45,
          y: -20,
          r: 3.5
        }
      ],
      [
        {
          x: 99,
          y: 42,
          r: 8.5
        }
      ],
      [
        {
          x: -8,
          y: -65,
          r: 11
        }
      ],
      [
        {
          x: -30,
          y: -68,
          r: 19
        }
      ],
      [
        {
          x: -56,
          y: 19,
          r: 1
        }
      ],
      [
        {
          x: -22,
          y: 46,
          r: 9
        }
      ],
      [
        {
          x: 8,
          y: 25,
          r: 1
        }
      ],
      [
        {
          x: -36,
          y: -64,
          r: 0.5
        }
      ],
      [
        {
          x: 13,
          y: -6,
          r: 23.5
        }
      ],
      [
        {
          x: 41,
          y: 45,
          r: 3.75
        }
      ],
      [
        {
          x: -84,
          y: 39,
          r: 10.25
        }
      ],
      [
        {
          x: 27,
          y: -96,
          r: 23.5
        }
      ],
      [
        {
          x: -14,
          y: -83,
          r: 25
        }
      ],
      [
        {
          x: -89,
          y: -78,
          r: 1
        }
      ],
      [
        {
          x: -43,
          y: -6,
          r: 2.5
        }
      ],
      [
        {
          x: 3,
          y: 71,
          r: 0
        }
      ],
      [
        {
          x: 11,
          y: 53,
          r: 4.25
        }
      ]
    ];
  }]);
