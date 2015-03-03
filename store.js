var levelup = require('levelup')
var TopStories = require('./stores/top-story')
var bind = require('./util/bind')
var db = levelup('./db')

class Store {
  constructor() {
    this.topStories = new TopStories()
    this.topStories.on('change', () => this.persistState())
  }
  persistState() {
    var batch = db.batch()
    this.topStories.all().forEach(item => batch.put(item.id, this.topStories.getNested(item.id)))
    batch.write()
  }
  getNested(id, cb) {
    var itemCached = this.topStories.getNested(id)
    if (itemCached) {
      cb(null, itemCached)
    } else {
      db.get(id, cb)
    }
  }
}

module.exports = Store
