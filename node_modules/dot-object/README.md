[![Build Status](https://travis-ci.org/rhalff/dot-object.png)](https://travis-ci.org/rhalff/dot-object)

Dot-Object
========

Dot-Object makes it possible to transform javascript objects using dot notation.

### Installation

Install from npm:
```
  npm install dot-object --save
```

Install from bower:

```
  bower install dot-object --save
```

### Download

  * Development version: https://npmcdn.com/dot-object/dist/dot-object.js *Uncompressed with Comments*
  * Production version: https://npmcdn.com/dot-object/dist/dot-object.min.js *Minified*

## Usage

#### Move a property within one object to another location
```javascript
var dot = require('dot-object');

var obj = {
  'first_name': 'John',
  'last_name': 'Doe'
};

dot.move('first_name', 'contact.firstname', obj);
dot.move('last_name', 'contact.lastname', obj);

console.log(obj);

{
  contact: {
    firstname: 'John',
    lastname: 'Doe'
  }
}

```

#### Copy property from one object to another
```javascript
var dot = require('dot-object');

var src = {
  name: 'John',
  stuff: {
    phone: {
      brand: 'iphone',
      version: 6
    }
  }
};

var tgt = {name: 'Brandon'};

dot.copy('stuff.phone', 'wanna.haves.phone', src, tgt);

console.log(tgt);

{
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

```

#### Transfer property from one object to another

Does the same as copy but removes the value from the source object:

```javascript
dot.transfer('stuff.phone', 'wanna.haves.phone', src, tgt);

// src: {"name":"John","stuff":{}}
// tgt: {"name":"Brandon","wanna":{"haves":{"phone":{"brand":"iphone","version":6}}}
```


#### Expand to an object

```javascript
var dot = require('dot-object');

var row = {
  'id': 2,
  'contact.name.first': 'John',
  'contact.name.last': 'Doe',
  'contact.email': 'example@gmail.com',
  'contact.info.about.me': 'classified',
  'devices[0]': 'mobile',
  'devices[1]': 'laptop',
  'some.other.things.0': 'this',
  'some.other.things.1': 'that'
};

dot.object(row);

console.log(row);

{
  "id": 2,
  "contact": {
    "name": {
      "first": "John",
      "last": "Doe"
    },
    "email": "example@gmail.com",
    "info": {
      "about": {
        "me": "classified"
      }
    }
  },
  "devices": [
    "mobile",
    "laptop"
  ],
  "some": {
    "other": {
      "things": [
        "this",
        "that"
      ]
    }
  }
}
```

To convert manually per string use:
```javascript
var dot = require('dot-object');

var tgt = { val: 'test' };
dot.str('this.is.my.string', 'value', tgt);

console.log(tgt);

{
  "val": "test",
  "this": {
    "is": {
      "my": {
        "string": "value"
      }
    }
  }
}
```

#### Pick/remove a value using dot notation:
```
var dot = require('dot-object');

var obj = {
 some: {
   nested: {
     value: 'Hi there!'
   }
 }
};

var val = dot.pick('some.nested.value', obj);
console.log(val);

Hi there!

// Pick & Remove the value
val = dot.pick('some.nested.value', obj, true);

// shorthand
val = dot.remove('some.nested.value', obj);

// or use the alias `del`
val = dot.del('some.nested.value', obj);

```

### Using modifiers

You can use modifiers to translate values on the fly.

This example uses the [underscore.string](https://github.com/epeli/underscore.string) library.



```javascript
var dot = require('dot-object');

var _s = require('underscore.string');

var row = {
  'nr': 200,
  'doc.name': '    My Document   '
};

var mods = {
  "doc.name": [_s.trim, _s.underscored],
};

dot.object(row, mods);

console.log(row);
```

```
{
  "nr": 200,
  "doc": {
    "name": "my_document"
  }
}
```

Or using .str() directy:

```javascript

var dot = require('dot-object');
var _s = require('underscore.string');
var obj = { id: 100 };

// use one modifier
dot.str('my.title', 'this is my title', obj, _s.slugify);

// multiple modifiers
dot.str('my.title', '   this is my title  ', obj, [_s.trim, _s.slugify]);

console.log(obj);
```
Result:
```json
{
  "id": 100,
  "my": {
    "title": "this-is-my-title"
  }
}
```

#### Transform object

```javascript
var dot = require('dot-object');

var source = {
  "id": 1,
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "example@gmail.com",
  }
}

var recipe = {
  'id': 'nr',
  'contact.firstName': 'name.first',
  'contact.lastName': 'name.last',
  'contact.email': 'email'
};

var tgt = {}
dot.transform(recipe, source, tgt);

// OR

var tgt = dot.transform(recipe, source);

console.log(tgt);
{
  "nr": 1,
  "name": {
    "first": "John",
    "last": "Doe"
  },
  "email": "example@gmail.com"
}
```


### Convert object to dotted-key/value pair

```javascript
var dot = require('dot-object');

var obj = {
  id: 'my-id',
  nes: { ted: { value: true } },
  other: { nested: { stuff: 5 } },
  some: { array: ['A', 'B'] }
};

var tgt = dot.dot(obj);

// or

var tgt = {};
dot.dot(obj, tgt);

console.log(tgt);
```
Result:
```json
{
  "id": "my-id",
  "nes.ted.value": true,
  "other.nested.stuff": 5,
  "some.array.0": "A",
  "some.array.1": "B"
}
```

## Using a different seperator

If you do not like dot notation, you are free to specify a different seperator.

```javascript
var Dot = require('dot-object');

var dot = new Dot('->');

var _s = require('underscore.string');

var row = {
  'nr': 200,
  'doc->name': '    My Document   '
};

var mods = {
  "doc->name": [_s.trim, _s.underscored],
};

dot.object(row, mods);

console.log(row);
```

```
{
  "nr": 200,
  "doc": {
    "name": "my_document"
  }
}
```

## Transforming SQL results to JSON

SQL translation on the fly:

```javascript
 // TODO

```


> Copyright © 2013 Rob Halff, released under the MIT license
