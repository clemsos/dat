var pump = require('pump')
var fs = require('fs')
var debug = require('debug')('bin/write')
var openDat = require('../lib/util/open-dat.js')
var abort = require('../lib/util/abort.js')
var usage = require('../lib/util/usage.js')('write.txt')

module.exports = {
  name: 'write',
  command: handleWrite,
  options: [
    {
      name: 'dataset',
      boolean: false,
      abbr: 'd'
    },
    {
      name: 'name',
      boolean: false,
      abbr: 'n'
    },
    {
      name: 'message',
      boolean: false,
      abbr: 'm'
    }
  ]
}

function handleWrite (args) {
  debug('handleWrite', args)

  if (args.help || args._.length === 0) {
    return usage()
  }

  if (!args.dataset) abort(new Error('Error: Must specify dataset (-d)'), args)

  openDat(args, function (err, db) {
    if (err) abort(err, args)
    var path = args._[0]
    var stream = args._[1]
    var key = args.n || path

    var inputStream
    if (stream === '-') {
      inputStream = process.stdin
    } else {
      if (!fs.existsSync(path)) {
        usage()
        abort(new Error('File at ' + path + ' does not exist'), args)
      }
      inputStream = fs.createReadStream(path)
    }

    var opts = {
      dataset: args.dataset,
      message: args.message
    }

    pump(inputStream, db.createFileWriteStream(key, opts), function done (err) {
      if (err) abort(err, args, 'dat: err in write')

      if (args.json) {
        var output = {
          version: db.head
        }
        console.log(JSON.stringify(output))
      } else console.error('Done writing binary data. \nVersion: ' + db.head)

    })
  })
}
