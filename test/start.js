var dir = '/tmp/level-trigger-test'
require('rimraf').sync(dir)
var Trigger = require('../')
var test    = require('tape')

test('start a trigger manually', function (t) {

  var db = require('level-sublevel')(require('levelup')(dir))
  var sum = 0, _sum = 0

  db.batch('abcdef'.split('').map(function (e) {
    var v = Math.round(100 * Math.random())
    sum += v
    return {key: e, value: v.toString(), type: 'put'}
  }), function () {
    //this trigger doesn't do any IO, so it can just be a prehook,
    //I'm using it in this test, though, because I just want to check trigDb.start() works
    var seq = Trigger(db, 'seq', function (key, done) {
      db.get(key, function (err, val) {
        if(err) return done(err)
        console.log('SEQ', key, val)
        _sum += Number(val)
        if(_sum === sum)
          t.end()
        console.log(sum, _sum)
        seq.put(key, val, done)
      })
    }).start()
  })

})
