# rcloader

[![Travis CI](https://travis-ci.org/spalger/rcloader.svg)](https://travis-ci.org/spalger/rcloader)

For build system plugins that need to fetch relative config files (like .jshintrc).

## Features
  - Find the closest config file (like .jshintrc) relative to the file you are linting
  - Lookups are cached to limit IO operations
  - Accepts input directly from plugin consumers to
    - specifiy a file that should always be used
    - specify a default file
    - specify overrides
    - disable file lookup

## Install
```sh
npm install rcloader
```

## Use
This plugin was written to specifically address this issue for a couple of gulp plugins.

### within a gulp plugin
```js
var RcLoader = require('rcloader');
var map = require('map-stream');

module.exports = function MyGulpPlugin(options) {
  var rcLoader = new RcLoader('.configfilename', options);

  return map(function (file, cb) {
    // get the options for this file specifically
    rcLoader.for(file.path, function (err, fileOpts) {
      // do something cool

      // send the file along
      cb(null, file);
    });
  });
};
```

If you would rather, just skip the callback and it will run synchronously.
```js
var fileOpts = rcLoader.for(file.path, options);
```

## Options
The second argument to the `RcLoader` constructor should be the options that plugin consumers define, and it can take a few different forms.

**If the user specifies a string**, it is used as a path to the only config file that they care about. Calling `rcLoader.for(path)` will always return a copy of the config file at that path.

**If the user specifies an object**, the following keys will be stripped from it:

- `lookup`, Boolean: Find the closest config file each time `.for()` is called. default is true, unless `options` is a path.
- `defaultFile`, string: Specify a default configuration file.

If `defaultFile` is not specified, all values except `lookup` will override values found in the config file.
