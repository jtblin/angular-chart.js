'use strict'

require('should')
var Dot = require('../index')

describe('dotted-key/value pairs:', function () {
  var obj
  var expected

  beforeEach(function () {
    obj = {
      id: 'my-id',
      nes: {
        ted: {
          value: true
        }
      },
      other: {
        nested: {
          stuff: 5
        }
      },
      some: {
        array: ['A', 'B']
      },
      ehrm: 123
    }

    expected = {
      id: 'my-id',
      'nes.ted.value': true,
      'other.nested.stuff': 5,
      'some.array.0': 'A',
      'some.array.1': 'B',
      ehrm: 123
    }
  })

  it('Should be able to convert to dotted-key/value pairs', function () {
    Dot.dot(obj).should.eql(expected)
  })

  it('dot() should equal object()', function () {
    var pkg = require('./fixtures/package.json')
    Dot.object(Dot.dot(pkg)).should.eql(pkg)
  })
})
