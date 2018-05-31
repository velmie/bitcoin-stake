var levelup = require('levelup')
var leveldown = require('leveldown')
var layout = require('bcoin/lib/blockchain/layout')
var db = levelup(leveldown('./data/chain.ldb'))

db.get(layout.R, function (err, value) {
  console.log(value.toString('hex'));
  if (err) return console.log('Ooops!', err)
})


var hash = [109, 184, 90, 176, 118, 20, 19, 177, 176, 128, 178, 162, 97, 155, 168, 39, 232, 185, 208, 121, 232, 158, 171, 186, 46, 94, 137, 27, 97, 195, 150, 25]

// db.get(layout.h(hash), function (err, value) {
//   console.log(value.toString('hex'));
//   if (err) return console.log('Ooops!', err)
// })
