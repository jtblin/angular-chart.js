'use strict'

require('should')
var _s = require('underscore.string')
var Dot = require('../index')

describe('Override test:', function () {
  it('Redefinition should _not_ fail if override is true', function () {
    var dot = new Dot('.', true)

    var obj = {
      'some': 'value',
      'already': 'set'
    }

    dot.str('already.new', 'value', obj)

    obj.should.eql({
      'some': 'value',
      'already': {'new': 'value'}
    })
  })

  it('Redefinition should _not_ fail if override is true (2)', function () {
    var dot = new Dot('.', true)

    var obj = {
      'some': 'value',
      'already': 'set'
    }

    dot.str('already.new', 'value', obj)
    dot.str('some', 'new_value', obj)

    obj.should.eql({
      'some': 'new_value',
      'already': {'new': 'value'}
    })
  })

  it('Allow override even when target is non-empty object',
    function () {
      var obj = {
        sample: {
          dotted: {
            bar: {
              baz: 'baz'
            }
          }
        }
      }

      Dot.override = true

      Dot.str('sample.dotted.bar', {baz: 'boom'}, obj)

      Dot.override = false

      obj.should.eql({
        sample: {
          dotted: {
            bar: {
              baz: 'boom'
            }
          }
        }
      })
    }
  )

  it('should process non dot notation value with modifier if override is true',
    function () {
      var dot = new Dot('.', true)

      var row = {
        'title': 'my page',
        'slug': 'My Page'
      }

      var mods = {
        'title': _s.titleize,
        'slug': _s.slugify
      }

      dot.object(row, mods)

      row.should.eql({
        'title': 'My Page',
        'slug': 'my-page'
      })
    }
  )
})
