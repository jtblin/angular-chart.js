var crypto = require('crypto');
var childProcess = require('child_process');

function calculateBlobId(content) {
  var header  = 'blob ' + content.length + '\0';
  var store   = header + content;
  var shasum  = crypto.createHash('sha1');
  shasum.update(store);
  return shasum.digest("hex");
}

module.exports = {

  head: function(cb) {
    childProcess.exec("git log -1 --pretty=format:%H", function (error, stdout, stderr) {
      return cb(error, stdout);
    });
  },

  committedAt: function(cb) {
    childProcess.exec("git log -1 --pretty=format:%ct", function (error, stdout, stderr) {
      var result = null;
      var timestamp = null;
      if (stdout) {
        timestamp = parseInt(stdout, 10);
        if (!isNaN(timestamp) && timestamp !== 0) {
          result = timestamp;
        }
      }
      return cb(error, result);
    });
  },

  branch: function(cb) {
    childProcess.exec("git branch", function (error, stdout, stderr) {
      var returnBranch = null;
      if (stdout) {
        var branches = stdout.split("\n");
        branches.forEach(function(val) {
          if(val.charAt(0) === "*") {
            returnBranch = val;
          }
        });
        if (returnBranch) {
          returnBranch = returnBranch.replace("* ", "");
        }
      }
      return cb(error, returnBranch);
    });
  },

  calculateBlobId: calculateBlobId,

  blobId: function(path, content) {
    var stdout, returnBlobId = null;

    try {
      stdout = childProcess.execSync("git hash-object " + path, { stdio: [0, "pipe", "ignore"] });
    } catch (e) { }

    if (stdout) {
      returnBlobId = stdout.toString().trim();
    } else {
      returnBlobId = calculateBlobId(content);
    }

    return returnBlobId;
  }
};
