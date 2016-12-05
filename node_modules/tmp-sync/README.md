# tmp-sync [![NPM version](https://badge.fury.io/js/tmp-sync.svg)](http://badge.fury.io/js/tmp-sync) [![Build Status](https://travis-ci.org/kaelzhang/node-tmp-sync.svg?branch=master)](https://travis-ci.org/kaelzhang/node-tmp-sync) [![Dependency Status](https://gemnasium.com/kaelzhang/node-tmp-sync.svg)](https://gemnasium.com/kaelzhang/node-tmp-sync)

The sync version of tmp just for test cases, making our life it much easier.

## Why?

I got tired of write asynchronous codes of [`tmp`](http://www.npmjs.org/package/tmp) even just in test cases.

Only use this package in your test cases, not in production environment for you should always using asynchronous fs.

## Usage

```js
var tmp = require('tmp-sync');
``` 

### tmp.in(root)

- root `path` the root path for the temp directory (default to OS tmp directory)

Makes a temp dir inside `root` and returns `path` the newly created dir.

### tmp.mark(dir)

- dir `path` the path of a directory

Marks a dir, and the dir will be removed when the current process exits.

### tmp.clean()

Cleans all marked tmp dirs. Most usually you need not to call this method manually.
