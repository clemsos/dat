var log = require('single-line-log').stderr
var prettyBytes = require('pretty-bytes')
var through = require('through2')

module.exports = function (prefix) {
  var read = 0
  return through.obj(function (data, enc, next) {
    read += data.size || data.length || 1
    log(prefix + ' ' + prettyBytes(read) + '.\n')
    next(null, data)
  })
}
