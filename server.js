var fs = require('fs')
var http2 = require('http2')
var express = require('express')
var _ = require('underscore')
var cors = require('cors')

var Store = require('./store')

var app = express()
app.use(cors())

var store = new Store()

const MAX_ITEMS = 50

app.get('/', function (req, res) {
  res.json(_.first(store.topStories.ordered(), MAX_ITEMS))
})

app.get('/item/:id', function (req, res) {
  store.getNested(req.params.id, (err, item) => {
    if (err) return res.sendStatus(err.notFound ? 404 : 500)
    else return res.json(item)
  })
})

var server = app.listen(process.env.PORT || 3030, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
})

// var http2Opts = {
//   key: fs.readFileSync('./localhost.key'),
//   cert: fs.readFileSync('./localhost.crt')
// }

// var server = http2.createServer(http2Opts, app)
// server.listen(3030, function () {
//   console.log('Example app listening')
// })