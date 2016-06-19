/*
 * imgur-upload
 * https://github.com/jamiees2/imgur-node-api/
 *
 * Copyright (c) 2013 jamiees2
 * Licensed under the MIT license.
 */

 'use strict';

var fs = require('fs');
var request = require('request');
var request = request.defaults({
  json: true
});

var imgur = {
  _clientID : null,
  setClientID : function(clientID){
    this._clientID = clientID;
  },
  upload: function(_file,_cb) {
    if(this._clientID && _file) {
      var options = {
        url: 'https://api.imgur.com/3/upload',
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      var post = request.post(options, function (err, req, body){
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });

      var upload = post.form();
      if (_file.match(/^https?:\/\//i)) {
        upload.append('type','url');
        upload.append('image',_file);
      } else {
        upload.append('type', 'file');
        upload.append('image', fs.createReadStream(_file));
      }
    }
  },
  delete: function(_id, _cb) {
    if(this._clientID && _id) {
      var options = {
        url: 'https://api.imgur.com/3/image/' + _id,
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      request.del(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  },
  update: function(_params, _cb) {
    if(this._clientID && _params.id && (_params.title || _params.description)) {
      var options = {
        url: 'https://api.imgur.com/3/image/' + _params.id,
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        },
        form: {
          title: _params.title ? _params.title : null,
          description: _params.description ? _params.description : null
        }
      };
      request.post(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  },
  getCredits: function(_cb) {
    if(this._clientID) {
      var options = {
        url: 'https://api.imgur.com/3/credits',
        headers: {
          'Authorization': 'Client-ID ' + this._clientID
        }
      };
      request(options, function (err, req, body) {
        if(err) {
          return _cb(err);
        }
        _cb(null, body);
      });
    }
  }
};

exports.setClientID = imgur.setClientID;
exports.upload = imgur.upload;
exports.update = imgur.update;
exports.delete = imgur.delete;
exports.getCredits = imgur.getCredits;