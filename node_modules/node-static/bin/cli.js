#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    tty = require('tty'),
    statik = require('./../lib/node-static');

    var argv = require('optimist')
        .usage([
            'USAGE: $0 [-p <port>] [<directory>]',
            'simple, rfc 2616 compliant file streaming module for node']
            .join('\n\n'))
        .option('port', {
            alias: 'p',
            'default': 8080,
            description: 'TCP port at which the files will be served'
        })
        .option('host-address', {
            alias: 'a',
            'default': '127.0.0.1',
            description: 'the local network interface at which to listen'
        })
        .option('cache', {
            alias: 'c',
            description: '"Cache-Control" header setting, defaults to 3600'
        })
        .option('version', {
            alias: 'v',
            description: 'node-static version'
        })
        .option('headers', {
            alias: 'H',
            description: 'additional headers (in JSON format)'
        })
        .option('header-file', {
            alias: 'f',
            description: 'JSON file of additional headers'
        })
        .option('gzip', {
            alias: 'z',
            description: 'enable compression (tries to serve file of same name plus \'.gz\')'
        })
        .option('help', {
            alias: 'h',
            description: 'display this help message'
        })
        .argv;

    var dir = argv._[0] || '.';

    var colors = require('colors');

    var log = function(request, response, statusCode) {
        var d = new Date();
        var seconds = d.getSeconds() < 10? '0'+d.getSeconds() : d.getSeconds(),
            datestr = d.getHours() + ':' + d.getMinutes() + ':' + seconds,
            line = datestr + ' [' + response.statusCode + ']: ' + request.url,
            colorized = line;
        if (tty.isatty(process.stdout.fd))
            colorized = (response.statusCode >= 500) ? line.red.bold :
                        (response.statusCode >= 400) ? line.red :
                        line;
        console.log(colorized);
    };

    var file, options;

if (argv.help){
    require('optimist').showHelp(console.log);
    process.exit(0);
}

if (argv.version){
    console.log('node-static', statik.version.join('.'));
    process.exit(0);
}

if (argv.cache){
    (options = options || {}).cache = argv.cache;
}

if (argv.headers){
    (options = options || {}).headers = JSON.parse(argv.headers);
}

if (argv['header-file']){
    (options = options || {}).headers =
        JSON.parse(fs.readFileSync(argv['header-file']));
}

if (argv.gzip){
    (options = options || {}).gzip = true;
}

file = new(statik.Server)(dir, options);

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response, function(e, rsp) {
            if (e && e.status === 404) {
                response.writeHead(e.status, e.headers);
                response.end("Not Found");
                log(request, response);
            } else {
                log(request, response);
            }
        });
    }).resume();
}).listen(+argv.port, argv['host-address']);

console.log('serving "' + dir + '" at http://' + argv['host-address'] + ':' + argv.port);
