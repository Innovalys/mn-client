/**
 * archiver-tar
 *
 * Copyright (c) 2015 Chris Talkington.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/archiver-tar/blob/master/LICENSE
 */
var tar = require('tar-stream');
var through = require('through2');

module.exports = function(opts) {
  opts = opts || {};

  return through.ctor({objectMode: true}, function (file, enc, cb) {
    cb(null, file);
    return;
  });
};