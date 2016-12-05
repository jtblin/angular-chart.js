var request = require("request");
var url     = require("url");
var pjson   = require('./package.json');

var host = process.env.CODECLIMATE_API_HOST || "https://codeclimate.com";

var options = {
  url: host + "/test_reports",
  method: "POST",
  headers: {
    "User-Agent": "Code Climate (JavaScript Test Reporter v" + pjson.version + ")",
    "Content-Type": "application/json"
  },
  timeout: 5000
};

var proxy = process.env.HTTP_PROXY || false;

if (proxy) {
  options.proxy = proxy;
}

var postJson = function(data) {

  var parts = url.parse(options.url);

  options.body = JSON.stringify(data);
  console.log("Sending test coverage results to " + parts.host + " ...");
  request(options, function(error, response, body) {
    if (error) {
      console.error("A problem occurred", error);
    }
    if (response) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log("Test coverage data sent.");
      } else if (response.statusCode === 401) {
        console.log("An invalid CODECLIMATE_REPO_TOKEN repo token was specified.");
      } else {
        console.log("Status code: " + response.statusCode);
      }
    }
  });

};

module.exports = { postJson: postJson };
