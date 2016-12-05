[![Build Status](https://travis-ci.org/brenden/node-webshot.svg?branch=master)](https://travis-ci.org/brenden/node-webshot)
# node-webshot

Webshot provides a simple API for taking webpage screenshots. The module is a
light wrapper around PhantomJS, which utilizes WebKit to perform the page
rendering.

## Examples

A simple url example:

```javascript
var webshot = require('webshot');

webshot('google.com', 'google.png', function(err) {
  // screenshot now saved to google.png
});
```

An html example:

```javascript
var webshot = require('webshot');

webshot('<html><body>Hello World</body></html>', 'hello_world.png', {siteType:'html'}, function(err) {
  // screenshot now saved to hello_world.png
});
```

Alternately, the screenshot can be streamed back to the caller:

```javascript
var webshot = require('webshot');
var fs      = require('fs');

var renderStream = webshot('google.com');
var file = fs.createWriteStream('google.png', {encoding: 'binary'});

renderStream.on('data', function(data) {
  file.write(data.toString('binary'), 'binary');
});
```

An example showing how to take a screenshot of a site's mobile version:

```javascript
var webshot = require('webshot');

var options = {
  screenSize: {
    width: 320
  , height: 480
  }
, shotSize: {
    width: 320
  , height: 'all'
  }
, userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
    + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
};

webshot('flickr.com', 'flickr.jpeg', options, function(err) {
  // screenshot now saved to flickr.jpeg
});
```

## Options
An optional `options` object can be passed as the parameter directly preceding
the callback in a call to webshot.

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Default Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>windowSize</th>
      <td>
<pre>{ width: 1024
, height: 768 }</pre>
      </td>
      <td>The dimensions of the browser window. <em>screenSize</em> is an alias
      for this property.</td>
    </tr>
    <tr>
      <th>shotSize</th>
      <td>
<pre>{ width: 'window'
, height: 'window' }</pre>
      </td>
      <td>The area of the page document, starting at the upper left corner, to
      render. Possible values are 'screen', 'all', and a number defining a
      pixel length.
      <br /> <br />
      <strong>'window'</strong> causes the length to be set to the length of
      the window (i.e. the shot displays what is initially visible within the
      browser window).
      <br /> <br />
      <strong>'all'</strong> causes the length to be set to the length of the
      document along the given dimension. </td>
    </tr>
    <tr>
      <th>shotOffset</th>
      <td><pre>{ left: 0
, right: 0
, top: 0
, bottom: 0 }</pre></td>
      <td>The left and top offsets define the upper left corner of the
      screenshot rectangle. The right and bottom offsets allow pixels to be
      removed from the shotSize dimensions (e.g. a shotSize height of 'all' with
      a bottom offset of 30 would cause all but the last 30 rows of pixels on
      the site to be rendered).</td>
    </tr>
    <tr>
      <th>phantomPath</th>
      <td>'phantomjs'</td>
      <td>The location of phantomjs. Webshot tries to use the binary provided by
      the phantomjs NPM module, and falls back to 'phantomjs' if the module
      isn't available.</td>
    </tr>
    <tr>
      <th>phantomConfig</th>
      <td>{}</td>
      <td>Object with key value pairs corresponding to phantomjs <a
      href="http://phantomjs.org/api/command-line.html">command
      line options</a>. Don't include `--`. For example:
      `phantomConfig: {'ignore-ssl-errors': 'true'}`</td>
    </tr>
    <tr>
      <th>cookies</th>
      <td>[]</td>
      <td>List of cookie objects to use, or null to disable cookies.</td>
    </tr>
    <tr>
      <th>customHeaders</th>
      <td>null</td>
      <td>Any additional headers to be sent in the HTTP request.</td>
    </tr>
    <tr>
      <th>defaultWhiteBackground</th>
      <td>false</td>
      <td>When taking the screenshot, adds a white background if not defined
      elsewhere.</td>
    </tr>
    <tr>
      <th>customCSS</th>
      <td>''</td>
      <td>When taking the screenshot, adds custom CSS rules if defined.</td>
    </tr>
    <tr>
      <th>quality</th>
      <td>75</td>
      <td>JPEG compression quality. A higher number will look better, but creates
        a larger file. Quality setting has no effect when streaming.</td>
    </tr>
    <tr>
      <th>streamType</th>
      <td>'png'</td>
      <td>If streaming is used, this designates the file format of the streamed
      rendering. Possible values are 'png', 'jpg', and 'jpeg'.  </td>
    </tr>
    <tr>
      <th>siteType</th>
      <td>'url'</td>
      <td>siteType indicates whether the content needs to be requested ('url'),
      loaded locally ('file'), or is being provided directly as a string
      ('html').</td>
    </tr>
    <tr>
      <th>renderDelay</th>
      <td>0</td>
      <td>Number of milliseconds to wait after a page loads before taking the
      screenshot.</td>
    </tr>
    <tr>
      <th>timeout</th>
      <td>0</td>
      <td>Number of milliseconds to wait before killing the phantomjs process
      and assuming webshotting has failed.  (0 is no timeout.)</td>
    </tr>
    <tr>
      <th>takeShotOnCallback</th>
      <td>false</td>
      <td>Wait for the web page to signal to webshot when to take the photo
      using <code>window.callPhantom('takeShot');</code></td>
    </tr>
    <tr>
      <th>errorIfStatusIsNot200</th>
      <td>false</td>
      <td>If the loaded page has a non-200 status code, don't take a screenshot, cause an error instead.</td>
    </tr>
    <tr>
      <th>errorIfJSException</th>
      <td>false</td>
      <td>If a script on the page throws an exception, don't take a screenshot, cause an error instead.</td>
    </tr>
    <tr>
      <th>captureSelector</th>
      <td>false</td>
      <td>Captures the page area containing the provided selector and saves it to file.</td>
    </tr>
  </tbody>
</table>

### PhantomJS version
By default this package installs PhantomJS 1.9.x. Several issues exist in this version that are fixed in v2, but v2 is not yet stable across all platforms. The `phantomPath` option can be used to get around this if you want to try a more recent PhantomJS version. See this issue: https://github.com/brenden/node-webshot/issues/100

### Phantom page properties
In addition to these options, the following options can be specified and will be
passed to the [Phantom page
object](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage):
`paperSize`, `zoomFactor`, `cookies`, `customHeaders`, and `settings`.

### Phantom callbacks
Arbitrary scripts can be run on the page before it gets rendered by using any of
Phantom's [page callbacks](https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#callbacks-list),
such as `onLoadFinished` or `onResourceRequested`. For example, the script below
changes the text of every link on the page:

```javascript
var options = {
  onLoadFinished: function() {
    var links = document.getElementsByTagName('a');

    for (var i=0; i<links.length; i++) {
      var link = links[i];
      link.innerHTML = 'My custom text';
    } 
  }
};
```

Note that the script will be serialized and then passed to Phantom as text, so all
variable scope information will be lost. However, variables from the caller can be 
passed into the script as follows:

```javascript
var options = {
  onLoadFinished: {
    fn: function() {
      var links = document.getElementsByTagName('a');

      for (var i=0; i<links.length; i++) {
        var link = links[i];
        link.innerHTML = this.foo;
      } 
    }
  , context: {foo: 'My custom text'}
  }
};
```

## Tests
Tests are written with [Mocha](http://visionmedia.github.com/mocha/) and can be
run with `npm test`. The tests use [node-imagemagick](http://github.com/rsms/node-imagemagick) and thus require
that the [imagemagick CLI tools](http://www.imagemagick.org) be installed.

## Running on Heroku
[See this comment.](https://github.com/brenden/node-webshot/issues/25#issuecomment-23019665)

## Grunt
[grunt-webshot](https://npmjs.org/package/grunt-webshot) is a Grunt wrapper for this package.

## CLI
[webshot-cli](https://npmjs.org/package/webshot-cli) is a CLI interface for this package.

## License
```
(The MIT License)

Copyright (c) 2012 Brenden Kokoszka

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
