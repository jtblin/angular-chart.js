'use strict'

require('should')
var _s = require('underscore.string')
var Dot = require('../index')

describe('Object test:', function () {
  it('Should expand dotted keys', function () {
    var row = {
      'id': 2,
      'contact.name.first': 'John',
      'contact.name.last': 'Doe',
      'contact.email': 'example@gmail.com',
      'contact.info.about.me': 'classified'
    }

    Dot.object(row)

    row.should.eql({
      'id': 2,
      'contact': {
        'name': {
          'first': 'John',
          'last': 'Doe'
        },
        'email': 'example@gmail.com',
        'info': {
          'about': {
            'me': 'classified'
          }
        }
      }
    })
  })

  it('Should expand dotted keys with array notation', function () {
    var row = {
      'id': 2,
      'my.arr.0': 'one',
      'my.arr.1': 'two',
      'my.arr.2': 'three',
      'my.arr2[0]': 'one',
      'my.arr2[1]': 'two',
      'my.arr2[2]': 'three'
    }

    Dot.object(row)

    row.should.eql({
      'id': 2,
      'my': {
        'arr': ['one', 'two', 'three'],
        'arr2': ['one', 'two', 'three']
      }
    })
  })

  it('Should expand dotted string', function () {
    var tgt = {}

    Dot.str('this.is.my.string', 'value', tgt)

    tgt.should.eql({
      'this': {
        'is': {
          'my': {
            'string': 'value'
          }
        }
      }
    })
  })

  it('Dot.str Redefinition should fail', function () {
    var tgt = {
      'already': 'set'
    }

    ;(function () {
      Dot.str('already.new', 'value', tgt)
    }).should.throw('Trying to redefine `already` which is a string')
  })

  it('Dot.str should process a modifier', function () {
    var tgt = {}

    Dot.str('this.is.my.string', 'value', tgt, _s.capitalize)

    tgt.should.eql({
      'this': {
        'is': {
          'my': {
            'string': 'Value'
          }
        }
      }
    })
  })

  it('Dot.str should process multiple modifiers', function () {
    var tgt = {}

    Dot.str(
      'this.is.my.string',
      '  this is a test   ',
      tgt, [_s.trim, _s.underscored]
    )

    tgt.should.eql({
      'this': {
        'is': {
          'my': {
            'string': 'this_is_a_test'
          }
        }
      }
    })
  })

  it('Dot.object should process a modifier', function () {
    var row = {
      'page.title': 'my page',
      'page.slug': 'My Page'
    }

    var mods = {
      'page.title': _s.titleize,
      'page.slug': _s.slugify
    }

    Dot.object(row, mods)

    row.should.eql({'page': {'title': 'My Page', 'slug': 'my-page'}})
  })

  it('should not process non dot value with modifier when override is false',
    function () {
      var row = {'title': 'my page', 'slug': 'My Page'}

      var mods = {'title': _s.titleize, 'slug': _s.slugify}

      Dot.object(row, mods)

      row.should.eql({'title': 'my page', 'slug': 'My Page'})
    }
  )

  it('Dot.object should process multiple modifiers', function () {
    var row = {'page.name': '    My Page    '}

    var mods = {'page.name': [_s.trim, _s.underscored]}

    Dot.object(row, mods)

    row.should.eql({'page': {'name': 'my_page'}})
  })

  it('Dot.object should work with a different seperator', function () {
    var row = {'page=>name': '    My Page    '}

    var mods = {'page=>name': [_s.trim, _s.underscored]}

    var dot = new Dot('=>', false)
    dot.object(row, mods)

    row.should.eql({'page': {'name': 'my_page'}})
  })
})
