(function () {
  'use strict';

  // install with npm: npm i --save angular-chart.js
  // build with `npm bin`/webpack --config examples/webpack.commonjs.js --display-modules --progress
  module.exports = {
    entry: './examples/commonjs.js',
    output: {
      filename: './examples/commonjs.bundle.js'
    },
    resolve: {
      alias: {
        'angular-chart': '../angular-chart.js' // not required when you install with npm
      }
    }
  };

})();
