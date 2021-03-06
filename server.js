var fs = require('fs')
var http2 = require('http2')
var express = require('express')
var _ = require('underscore')
var cors = require('cors')
var morgan = require('morgan')

var Store = require('./store')

var config = require('./config.json')

var app = express()
app.set('trust proxy', 'loopback')
app.use(cors())
app.use(morgan('combined'))

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

const LISTEN_PORT = process.env.PORT || config.port || 3030
var server = app.listen(LISTEN_PORT, () => {
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
//   console.log('app listening on '+LISTEN_PORT)
// })
