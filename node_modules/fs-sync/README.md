# fs-sync

> Synchronous fs with more fun

## Getting Started
This module is created for the favor of use of `fs.xxxSync`.

Once `fs-sync` is installed, you can use:

```js
var fs = require('fs-sync');

if(fs.exists('package.json')){
	var pkg = fs.readJSON('package.json');
}
```	
	
## Methods

```js
var fs = require('fs-sync');
```
	
### fs.defaultEncoding
Type: `String`

Default value: `'utf-8'`

Global default encoding

```js
fs.defaultEncoding = 'utf-8'
```

### fs.copy(from, to, options)

Copy a file or a whole directory to the destination. During this, necessary directories will be created.

#### Syntax

```js
fs.copy(file, destpath, options);
fs.copy(dir, destpath, options);
```
	
#### file
Type: `String`

Path of file to be copied

#### dir
Type: `String`

Path of directory to be copied

#### options.force
Type: `Boolean`

Default value: `false`

By default, `fs.copy` will not override existed files, set `options.force` as `true` to override.


### fs.mkdir(path)

Commandline `mkdir` or `mkdir -p`


### fs.expand(patterns, options)

Like `grunt.file.expand`, but the sequence of the arguments is different
	

### fs.write(file, content, options)

#### options
Type: `Object`

The same as the `options` argument of [fs.writeFile](http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback)

### fs.read(file, options)
Read a file

#### options
Type: `Object`

The same as the `options` argument of [fs.writeFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback), except:

#### options.encoding
Type: `String`

Default value: `fs.defaultEncoding`

### fs.readJSON(file, options)
Read a file as the JSON format, if the file content fails to be parsed as JSON, an error will be thrown.

### fs.remove()

Delete a file or a whole directory. It's a dangerous action, be careful.

Equivalent to `rm -rf`(remove a folder and all its contents) or `rm -f`(unlink a file)

#### Syntax

```js	
fs.remove(file)
fs.remove(dir)
```

### fs.exists(...)

`arguments` will be called with `path.join`

### fs.isDir(path)

### fs.isFile(path)

### fs.isLink(path)

### fs.isPathAbsolute(path)

#### Returns `Boolean`

Whether the given `path` is an absolute path (starting with `'/'`)

### fs.doesPathContain(ancestor, path...)

```js
if(fs.doesPathContain(ancestor, path, path2)){
	console.log(path, 'and', path2, 'are inside', ancestor);
}
```

#### Returns `Boolean`

Whether path `ancestor` contains all `path`s after

#### ancestor `String`

Ancestor path

#### path `String`

The arguments of `fs.doesPathContain` could be more than 2.




	
