module.exports = function(config) {
  'use strict';
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
    files: [
      'node_modules/angular/angular.min.js',
      'node_modules/chart.js/dist/Chart.min.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/chai-string/chai-string.js',
      'dist/angular-chart.js',
      'test/test.unit.js',
    ],
    exclude: [],
    preprocessors: {
      'dist/angular-chart.js': ['coverage'],
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
  });
};
