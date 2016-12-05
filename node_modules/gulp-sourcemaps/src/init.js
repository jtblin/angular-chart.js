'use strict';
var utils = require('./utils'),
  unixStylePath = utils.unixStylePath,
  PLUGIN_NAME = utils.PLUGIN_NAME,
  urlRegex = utils.urlRegex,
  through = require('through2'),
  fs = require('graceful-fs'),
  path = require('path'),
  convert = require('convert-source-map'),
  stripBom = require('strip-bom'),
  acorn = require('acorn'),
  SourceMapGenerator = require('source-map').SourceMapGenerator,
  css = require('css');

/**
 * Initialize source mapping chain
 */
function init(options) {
  var debug = require('debug-fabulous')()(PLUGIN_NAME + ':init');

  function sourceMapInit(file, encoding, callback) {
    /*jshint validthis:true */

    // pass through if file is null or already has a source map
    if (file.isNull() || file.sourceMap) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      return callback(new Error(PLUGIN_NAME + '-init: Streaming not supported'));
    }

    if (options === undefined) {
      options = {};
    }
    debug(function() {
      return options;
    });

    var fileContent = file.contents.toString();
    var sourceMap;
    var preExisting = utils.getPreExisting(fileContent);

    if (options.loadMaps) {
      debug('loadMaps');
      var sourcePath = ''; //root path for the sources in the map

      // Try to read inline source map
      sourceMap = convert.fromSource(fileContent, options.largeFile);
      if (sourceMap) {
        sourceMap = sourceMap.toObject();
        // sources in map are relative to the source file
        sourcePath = path.dirname(file.path);
        if (!options.largeFile) {
          fileContent = convert.removeComments(fileContent);
        }
      } else {
        // look for source map comment referencing a source map file
        var mapComment = convert.mapFileCommentRegex.exec(fileContent);

        var mapFile;
        if (mapComment) {
          mapFile = path.resolve(path.dirname(file.path), mapComment[1] || mapComment[2]);
          fileContent = convert.removeMapFileComments(fileContent);
          // if no comment try map file with same name as source file
        } else {
          mapFile = file.path + '.map';
        }

        // sources in external map are relative to map file
        sourcePath = path.dirname(mapFile);

        try {
          sourceMap = JSON.parse(stripBom(fs.readFileSync(mapFile, 'utf8')));
        } catch (e) {}
      }

      // fix source paths and sourceContent for imported source map
      if (sourceMap) {
        sourceMap.sourcesContent = sourceMap.sourcesContent || [];
        sourceMap.sources.forEach(function(source, i) {
          if (source.match(urlRegex)) {
            sourceMap.sourcesContent[i] = sourceMap.sourcesContent[i] || null;
            return;
          }
          var absPath = path.resolve(sourcePath, source);
          sourceMap.sources[i] = unixStylePath(path.relative(file.base, absPath));

          if (!sourceMap.sourcesContent[i]) {
            var sourceContent = null;
            if (sourceMap.sourceRoot) {
              if (sourceMap.sourceRoot.match(urlRegex)) {
                sourceMap.sourcesContent[i] = null;
                return;
              }
              absPath = path.resolve(sourcePath, sourceMap.sourceRoot, source);
            }

            // if current file: use content
            if (absPath === file.path) {
              sourceContent = fileContent;

              // else load content from file
            } else {
              try {
                if (options.debug)
                  debug('No source content for "' + source + '". Loading from file.');
                sourceContent = stripBom(fs.readFileSync(absPath, 'utf8'));
              } catch (e) {
                if (options.debug)
                  debug('warn: source file not found: ' + absPath);
                }
              }
            sourceMap.sourcesContent[i] = sourceContent;
          }

        });
      }
      // remove source map comment from source
      file.contents = new Buffer(fileContent, 'utf8');
    }

    if (!sourceMap && options.identityMap) {
      debug(function() {
        return 'identityMap';
      });
      var fileType = path.extname(file.path);
      var source = unixStylePath(file.relative);
      var generator = new SourceMapGenerator({file: source});

      if (fileType === '.js') {
        var tokenizer = acorn.tokenizer(fileContent, {locations: true});
        while (true) {
          var token = tokenizer.getToken();
          if (token.type.label === "eof")
            break;
          var mapping = {
            original: token.loc.start,
            generated: token.loc.start,
            source: source
          };
          if (token.type.label === 'name') {
            mapping.name = token.value;
          }
          generator.addMapping(mapping);
        }
        generator.setSourceContent(source, fileContent);
        sourceMap = generator.toJSON();

      } else if (fileType === '.css') {
        debug('css');
        var ast = css.parse(fileContent, {silent: true});
        debug(function() {
          return ast;
        });
        var registerTokens = function(ast) {
          if (ast.position) {
            generator.addMapping({original: ast.position.start, generated: ast.position.start, source: source});
          }

          function logAst(key, ast) {
            debug(function() {
              return 'key: ' + key;
            });
            debug(function() {
              return ast[key];
            });
          }

          for (var key in ast) {
            logAst(key, ast);
            if (key !== "position") {
              if (Object.prototype.toString.call(ast[key]) === '[object Object]') {
                registerTokens(ast[key]);
              } else if (Array.isArray(ast[key])) {
                debug(function() {
                  return "@@@@ ast[key] isArray @@@@";
                });
                for (var i = 0; i < ast[key].length; i++) {
                  registerTokens(ast[key][i]);
                }
              }
            }
          }
        };
        registerTokens(ast);
        generator.setSourceContent(source, fileContent);
        sourceMap = generator.toJSON();
      }
    }

    if (!sourceMap) {
      // Make an empty source map
      sourceMap = {
        version: 3,
        names: [],
        mappings: '',
        sources: [unixStylePath(file.relative)],
        sourcesContent: [fileContent]
      };
    }
    else if(preExisting !== null && typeof preExisting !== 'undefined')
      sourceMap.preExisting = preExisting

    sourceMap.file = unixStylePath(file.relative);
    file.sourceMap = sourceMap;

    this.push(file);
    callback();
  }

  return through.obj(sourceMapInit);
}

module.exports = init;
