'use strict'

require('should')
var Dot = require('../index')

var testData = [
  require('./data/array_deep_bug'),
  require('./data/array_deep_bug2'),
  require('./data/object_deep_numeric_keys'),
  require('./data/object_deep_numeric_keys2')
]

describe('Test Data:', function () {
  var dot = new Dot()
  function testIt (test) {
    it(test.name, function () {
      if (test.options) {
        Object.keys(test.options).forEach(function (name) {
          dot[name] = test.options[name]
        })
      }
      dot.object(test.input)
      JSON.stringify(test.input).should.eql(JSON.stringify(test.expected))
    })
  }

  // note with object() it is possible to cleanup, with del it is not.

  testData.forEach(testIt)
})
