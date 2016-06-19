'use strict'

require('should')
var Dot = require('../index')

describe('Remove/del:', function () {
  var obj
  var expected

  beforeEach(function () {
    obj = {
      id: 'my-id',
      nes: {
        ted: {
          gone: 'value',
          still: 'there'
        }
      },
      ehrm: 123
    }

    expected = {
      id: 'my-id',
      nes: {
        ted: {
          still: 'there'
        }
      }
    }
  })

  it('Should be able to remove() properties', function () {
    Dot.remove('ehrm', obj).should.equal(123)
    Dot.remove('nes.ted.gone', obj).should.equal('value')
    obj.should.eql(expected)
  })

  it('Should be able to use del() alias', function () {
    Dot.del('ehrm', obj).should.equal(123)
    Dot.del('nes.ted.gone', obj).should.equal('value')
    obj.should.eql(expected)
  })
})
