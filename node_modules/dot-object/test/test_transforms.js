'use strict'

require('should')
var Dot = require('../index')

var testData = [
  require('./transforms/twitter'),
  require('./transforms/contact')
]

describe('Test Transforms:', function () {
  var dot = new Dot()
  function testIt (test) {
    it(test.name, function () {
      if (test.options) {
        Object.keys(test.options).forEach(function (name) {
          dot[name] = test.options[name]
        })
      }
      var tgt1 = {}
      var tgt2 = dot.transform(test.transform, test.input, tgt1)
      JSON.stringify(tgt1).should.eql(JSON.stringify(test.expected))
      JSON.stringify(tgt2).should.eql(JSON.stringify(test.expected))
    })
  }

  testData.forEach(testIt)
})
