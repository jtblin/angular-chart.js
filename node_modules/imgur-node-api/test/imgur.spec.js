'use strict';

var nock = require('nock');
var path = require('path');
var imgur = require('../lib/imgur');
var clientId = 'myTestId';
var imageId = 'W0JfyHW';

exports.setUp = function(callback) {
  imgur.setClientID(clientId);
  nock('https://api.imgur.com').post('/3/upload').reply(200, {
    success: true,
    status: 200,
    data: {
      link: 'http://i.imgur.com/'+imageId+'.gif'
    }
  });
  nock('https://api.imgur.com').get('/3/credits').reply(200, {
    data: {
      UserLimit: 500,
      UserRemaining: 500,
      UserReset: 1417550317,
      ClientLimit: 12500,
      ClientRemaining: 12268
    },
    success: true,
    status: 200
  });
  nock('https://api.imgur.com').post('/3/image/' + imageId, {
    title: 'MyTitle',
    description: 'MyDescription'
  }).reply(200, {
    success: true,
    status: 200
  });
  nock('https://api.imgur.com').delete('/3/image/' + imageId).reply(200, {
    success: true,
    status: 200
  });
  callback();
};

exports.testUrlUpload = function(test) {
  imgur.upload('http://i.imgur.com/'+imageId+'.gif', function (error, res) {
    test.equal(error, null);
    test.ok(res.success, 'Should be a successful upload.');
    test.equal(res.status, 200);
    test.done();
  });
};

exports.testFileUpload = function(test) {
  imgur.upload(path.join(__dirname, (imageId + '.gif')), function (error, res) {
    test.equal(error, null);
    test.ok(res.success, 'Should be a successful upload.');
    test.equal(res.status, 200);
    test.done();
  });
};

exports.delete = function(test) {
  imgur.delete(imageId, function (error, res) {
    test.equal(error, null);
    test.ok(res.success, 'Should successfully delete the image.');
    test.equal(res.status, 200);
    test.done();
  });
};

exports.update = function(test) {
  imgur.update({
    id: imageId,
    title: 'MyTitle',
    description: 'MyDescription',
  }, function (error, res) {
    test.equal(error, null);
    test.ok(res.success, 'Should successfully update the image.');
    test.equal(res.status, 200);
    test.done();
  });
};

exports.getCredits = function(test) {
  imgur.getCredits(function (error, res) {
    test.equal(error, null);
    test.ok(res.success, 'Should successfully return the credits left.');
    test.equal(res.status, 200);
    test.done();
  });
};