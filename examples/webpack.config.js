// install with npm: npm i --save angular-chart.js
module.exports = {
  entry: './amd.js',
  output: {
    filename: './bundle.js'
  },
  resolve: {
    alias: {
      'angular-chart': '../angular-chart.js' // should not be required if you installed with npm
    }
  }
};
