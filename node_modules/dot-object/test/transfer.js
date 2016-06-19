'use strict'

require('should')
var Dot = require('../index')

describe('Transfer:', function () {
  it('Should be able to transfer properties', function () {
    var src = {
      name: 'John',
      stuff: {
        phone: {
          brand: 'iphone',
          version: 6
        }
      }
    }

    var tgt = {
      name: 'Brandon'
    }

    var srcExpected = {name: 'John', stuff: {}}

    var tgtExpected = {
      name: 'Brandon',
      wanna: {
        haves: {
          phone: {
            brand: 'iphone',
            version: 6
          }
        }
      }
    }

    Dot.transfer('stuff.phone', 'wanna.haves.phone', src, tgt)

    src.should.eql(srcExpected)
    tgt.should.eql(tgtExpected)
  })

  it('Should process modifiers', function () {
    var up = function (val) {
      val.brand = val.brand.toUpperCase()
      return val
    }

    var src = {
      name: 'John',
      stuff: {
        phone: {
          brand: 'iphone',
          version: 6
        }
      }
    }

    var tgt = {
      name: 'Brandon'
    }

    var srcExpected = {name: 'John', stuff: {}}

    var tgtExpected = {
      name: 'Brandon',
      wanna: {
        haves: {
          phone: {
            brand: 'IPHONE',
            version: 6
          }
        }
      }
    }

    Dot.transfer('stuff.phone', 'wanna.haves.phone', src, tgt, up)

    src.should.eql(srcExpected)
    tgt.should.eql(tgtExpected)
  })
})
