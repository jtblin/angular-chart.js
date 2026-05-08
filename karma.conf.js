module.exports = function(config) {
  'use strict';
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
    files: [
      'node_modules/angular/angular.min.js',
      'node_modules/chart.js/dist/chart.umd.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/chai-string/chai-string.js',
      'dist/test.unit.bundled.js',
    ],
    exclude: [],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
  });
};
