# testatic

Setup a static web server for testing with basic options.

# Installation

    npm install --save[-dev] testatic

# Usage

```
var server = require('testatic')('./public', 8080);
server.close();
```

## API

* `dir`: directory to serve static files from (default **./**)
* `port`: directory to serve static files from (default **8080**)

# Contributing

Open issues in [github](https://github.com/jtblin/testatic/issues). 
Pull requests welcome!

# Author

Jerome Touffe-Blin, [@jtblin](https://twitter.com/jtblin), [About me](http://about.me/jtblin)

# License

testatic is copyright 2015 Jerome Touffe-Blin and contributors. 
It is licensed under the BSD license. See the include LICENSE file for details.
