var clean  = require('gulp-clean');
var fs     = require('fs');
var gulp   = require('gulp');
var log    = require('gulp-util').log;
var gzip   = require('../');
var nid    = require('nid');
var rename = require('gulp-rename');
var should = require('should');
var Stream = require('stream');
var tap    = require('gulp-tap');
var zlib   = require('zlib');

// monkeys are fixing cwd for gulp-mocha
// node lives in one process/scope/directory
process.chdir('./test');

describe('gulp-gzip', function() {

  describe('config', function() {

    it('should have default config', function(done) {
      var instance = gzip();
      instance.config.should.eql({
        append: true,
        gzipOptions: {},
        skipGrowingFiles: false,
        threshold:  false
      });
      done();
    });

    it('should merge options with defaults', function(done) {
      var instance = gzip({ append: false });
      instance.config.should.eql({
        append: false,
        gzipOptions: {},
        skipGrowingFiles: false,
        threshold:  false
      });
      done();
    });
  });

  describe('file extension', function() {

    it('should append .gz to the file extension, by default', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.path.should.endWith('.gz');
          done();
        }));
    });

    it('should not append .gz to the file extension receiving { append: false }', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip({ append: false }))
        .pipe(tap(function(file) {
          file.path.should.not.endWith('.gz');
          done();
        }));
    });

    it('should accept an arbitrary extension with the `extension` option', function(done) {
        gulp.src('files/small.txt')
          .pipe(gzip({ extension: 'zip' }))
          .pipe(tap(function(file) {
            file.path.should.endWith('.zip');
            done();
          }));
    });

    it('should accept an arbitrary pre-extension with the `preExtension` option', function(done) {
        gulp.src('files/small.txt')
          .pipe(gzip({ preExtension: 'gz' }))
          .pipe(tap(function(file) {
            file.path.should.endWith('.gz.txt');
            done();
          }));
    });
  });

  describe('file type', function() {

    it('should return file contents as a Buffer', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.contents.should.be.instanceof(Buffer);
          done();
        }));
    });

    it('should return file contents as a Stream', function(done) {
      gulp.src('files/small.txt', { buffer: false })
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.contents.should.be.instanceof(Stream);
          done();
        }));
    });
  });

  describe('file properties', function() {
    it('should not lose any properties from the Vinyl file', function(done) {
      gulp.src('files/small.txt')
        .pipe(tap(function(file) {
          file.test = 'test';
        }))
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.should.have.property('test', 'test');
          done();
        }));
    });

    it('should set `contentEncoding`', function(done) {
      gulp.src('files/small.txt')
        .pipe(gzip())
        .pipe(tap(function(file) {
          file.should.have.property('contentEncoding');
          file.contentEncoding.should.containEql('gzip');
          done();
        }));
    });
  });

  describe('gzip options', function() {

    it('should set gzipOptions object', function(done) {
      var instance = gzip({ gzipOptions: { level: 9, memLevel: 1} });
      instance.config.should.have.property('gzipOptions');
      instance.config.gzipOptions.should.have.property('level', 9);
      instance.config.gzipOptions.should.have.property('memLevel', 1);
      done();
    });

    it('should handle compression level in buffer mode', function(done) {
      var id_lowest_compression = nid();
      var id_highest_compression = nid();

      var out_lowest_compression = gulp.dest('tmp');
      var out_highest_compression = gulp.dest('tmp');

      var size_lowest_compression = 0;
      var size_highest_compression = 0;

      out_lowest_compression.on('end', function() {
        fs.stat('./tmp/' + id_lowest_compression + '.txt.gz', function (err, stats) {
          size_lowest_compression = stats.size;

          if (size_highest_compression > 0) {
            size_highest_compression.should.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      out_highest_compression.on('end', function() {
        fs.stat('./tmp/' + id_highest_compression + '.txt.gz', function (err, stats) {
          size_highest_compression = stats.size;

          if (size_lowest_compression > 0) {
            size_highest_compression.should.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id_lowest_compression }))
        .pipe(gzip({ gzipOptions: { level: 1 } }))
        .pipe(out_lowest_compression);

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id_highest_compression }))
        .pipe(gzip({ gzipOptions: { level: 9 } }))
        .pipe(out_highest_compression);
    });

    it('should handle compression level in stream mode', function(done) {
      var id_lowest_compression = nid();
      var id_highest_compression = nid();

      var out_lowest_compression = gulp.dest('tmp');
      var out_highest_compression = gulp.dest('tmp');

      var size_lowest_compression = 0;
      var size_highest_compression = 0;

      out_lowest_compression.on('end', function() {
        fs.stat('./tmp/' + id_lowest_compression + '.txt.gz', function (err, stats) {
          size_lowest_compression = stats.size;

          if (size_highest_compression > 0) {
            size_highest_compression.should.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      out_highest_compression.on('end', function() {
        fs.stat('./tmp/' + id_highest_compression + '.txt.gz', function (err, stats) {
          size_highest_compression = stats.size;

          if (size_lowest_compression > 0) {
            size_highest_compression.should.be.lessThan(size_lowest_compression);
            done();
          }
        });
      });

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id_lowest_compression }))
        .pipe(gzip({ gzipOptions: { level: 1 } }))
        .pipe(out_lowest_compression);

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id_highest_compression }))
        .pipe(gzip({ gzipOptions: { level: 9 } }))
        .pipe(out_highest_compression);
    });
  });

  describe('threshold option', function() {

    it('should set threshold to false while receiving false', function(done) {
      var instance = gzip({ threshold: false });
      instance.config.threshold.should.be.false;
      done();
    });

    it('should set threshold to 150 while receiving true', function(done) {
      var instance = gzip({ threshold: true });
      instance.config.threshold.should.eql(150);
      done();
    });

    it('should set threshold to Number while receiving Number', function(done) {
      var instance = gzip({ threshold: 1024 });
      instance.config.should.have.property('threshold', 1024);
      done();
    });

    it('should set threshold to 150 while receiving Number < 150', function(done) {
      var instance = gzip({ threshold: 100 });
      instance.config.should.have.property('threshold', 150);
      done();
    });

    it('should set threshold to Number while receiving String (bytes result)', function(done) {
      var instance = gzip({ threshold: '1kb' });
      instance.config.should.have.property('threshold', 1024);
      done();
    });

    it('should set threshold to 150 while receiving String (bytes result < 150)', function(done) {
      var instance = gzip({ threshold: '1kb' });
      instance.config.should.have.property('threshold', 1024);
      done();
    });

    it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
          fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
            file.should.equal(original);
            done();
          });
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          zlib.unzip(file, function(err, buffer) {
            file = buffer.toString('utf-8');

            fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
              file.should.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by passing through small.txt (<1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt', { encoding: 'utf-8' }, function(err, file) {
          fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
            file.should.equal(original);
            done();
          });
        });
      });

      gulp.src('files/small.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: '1kb' }))
        .pipe(out);
    });

    it('should handle threshold of 1kb by compressing big.txt (>1kb)', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          zlib.unzip(file, function(err, buffer) {
            file = buffer.toString('utf-8');

            fs.readFile('./files/big.txt', { encoding: 'utf-8' }, function(err, original) {
              file.should.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/big.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: '1kb' }))
        .pipe(out);
    });
  });

  describe('delete mode', function() {

    it('should not delete existing gzipped files when { deleteMode : false }', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          should.not.exist(err);
          should.exist(file);
          file.should.not.be.empty;

          var out = gulp.dest('tmp');
          out.on('end', function() {
            fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
              should.not.exist(err);
              should.exist(file);
              file.should.not.be.empty;
              done();
            });
          });

          gulp.src('files/small.txt')
            .pipe(rename({ basename: id }))
            .pipe(gzip({ threshold: 1024 }))
            .pipe(out);
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: 1024 }))
        .pipe(out);
    });

    it('should delete existing gzipped files if the files changed from big.txt (over threshold) to small.txt (under threshold) when { deleteMode : true }', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          should.not.exist(err);
          should.exist(file);
          file.should.not.be.empty;

          var out = gulp.dest('tmp');

          out.on('end', function() {
            fs.exists('./tmp/' + id + '.txt.gz', function(exists) {
              exists.should.be.false;
              done();
            });
          });

          gulp.src('files/small.txt')
            .pipe(rename({ basename: id }))
            .pipe(gzip({ threshold: 1024, deleteMode: 'tmp' }))
            .pipe(out);
        });
      });

      gulp.src('files/big.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip({ threshold: 1024, deleteMode: 'tmp' }))
        .pipe(out);
    });
  });

  describe ('uncompress the compressed file', function() {

    it('should match original in buffer mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          zlib.unzip(file, function(err, buffer) {
            file = buffer.toString('utf-8', 0, buffer.length);

            fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
              file.should.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/small.txt')
        .pipe(rename({ basename: id }))
        .pipe(gzip())
        .pipe(out);
    });

    it('should match original in stream mode', function(done) {
      var id = nid();
      var out = gulp.dest('tmp');

      out.on('end', function() {
        fs.readFile('./tmp/' + id + '.txt.gz', function(err, file) {
          zlib.unzip(file, function(err, buffer) {
            file = buffer.toString('utf-8', 0, buffer.length);

            fs.readFile('./files/small.txt', { encoding: 'utf-8' }, function(err, original) {
              file.should.equal(original);
              done();
            });
          });
        });
      });

      gulp.src('files/small.txt', { buffer: false })
        .pipe(rename({ basename: id }))
        .pipe(gzip())
        .pipe(out);
    });
  });

  describe('skip files that get larger after compression', function() {
    it('handles buffers', function(done) {
      var originalBuffer;
      gulp.src('files/too_small.txt')
        .pipe(tap(function(file) {
          originalBuffer = file.contents;
        }))
        .pipe(gzip({ skipGrowingFiles: true }))
        .pipe(tap(function(file) {
          file.contents.should.equal(originalBuffer);
          done();
        }));
    });

    it('handles streams', function(done) {
      var originalStream;
      gulp.src('files/too_small.txt', { buffer: false })
        .pipe(tap(function(file) {
          originalStream = file.contents;
        }))
        .pipe(gzip({ skipGrowingFiles: true }))
        .pipe(tap(function(file) {
          file.contents.should.equal(originalStream);
          done();
        }));
    });
  });
});
