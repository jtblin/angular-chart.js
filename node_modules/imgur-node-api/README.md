imgur anonymous upload in nodejs using the imgur api.

## Getting Started
Install the module with: `npm install imgur-node-api`

```javascript
var imgur = require('imgur-node-api'),
path = require('path');

imgur.setClientID(myClientID);
imgur.upload(path.join(__dirname, 'someimage.png'), function (err, res) {
  console.log(res.data.link); // Log the imgur url
});

imgur.upload('http://25.media.tumblr.com/tumblr_md1yfw1Dcz1rsx19no1_1280.png', function (err,res) {
  console.log(res.data.link);
});

imgur.delete('W0JfyHW', function (err,res) {
  console.log(res.data);
});

imgur.update({
  id: 'W0JfyHW',
  title: 'My Title',
  description: 'My Description'
}, function (err,res) {
  console.log(res.data);
});

imgur.getCredits(function (err, res) {
  console.log(res.data);
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 jamiees2
Licensed under the MIT license.
