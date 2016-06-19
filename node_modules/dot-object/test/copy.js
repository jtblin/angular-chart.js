'use strict'

require('should')
var Dot = require('../index')

describe('Copy:', function () {
  it('Should be able to copy properties', function () {
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

    var srcExpected = JSON.parse(JSON.stringify(src))

    var tgtExpected = {
      name: 'Brandon',
      copied: 'John',
      wanna: {
        haves: {
          phone: {
            brand: 'iphone',
            version: 6
          }
        }
      }
    }

    // copy object
    Dot.copy('stuff.phone', 'wanna.haves.phone', src, tgt)

    // copy string
    Dot.copy('name', 'copied', src, tgt)

    src.should.eql(srcExpected)
    tgt.should.eql(tgtExpected)
  })

  it('Should process modifiers', function () {
    function up (val) {
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

    var srcExpected = JSON.parse(JSON.stringify(src))

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

    Dot.copy('stuff.phone', 'wanna.haves.phone', src, tgt, up)

    src.should.eql(srcExpected)
    tgt.should.eql(tgtExpected)
  })
})
