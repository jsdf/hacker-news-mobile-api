var _ = require('underscore')
var {EventEmitter} = require('events')

var getFirebase = require('../config/firebase')
var bind = require('../util/bind')

// TODO: move batching somewhere sensible
var BATCH_INTERVAL = 100

class FirebaseCollectionStore extends EventEmitter {
  constructor(itemPath) {
    this.emitChange = _.debounce(() => this.emit('change'), BATCH_INTERVAL)
    this.handleItemUpdate = bind(this.handleItemUpdate, this)

    this.itemPath = itemPath
    this.items = {}
    this.itemFirebases = {}
  }
  emitChange() {
    throw new Error('method not yet defined')
  }
  reset(items) {
    this.items = items
    _.each(items, (item) => this.addItem(item.id))
  }
  handleItemUpdate(dataSnapshot) {
    var item = dataSnapshot.val()
    if (!(item && item.id != null)) return 
    var prevItem = this.items[item.id]
    this.items[item.id] = item
    if (item.kids) {
      var prevKids = prevItem && prevItem.kids || []
      this.handleCollectionUpdate(item.kids, prevKids)
    }
    this.emitChange()
  }
  handleCollectionUpdate(current, previous) {
    var added = _.difference(current, previous)
    var removed = _.difference(previous, current)

    added.forEach(itemId => this.addItem(itemId))
    removed.forEach(itemId => this.removeItem(itemId))
  }
  addItem(itemId) {
    if (this.itemFirebases[itemId]) return

    var itemFirebase = getFirebase(this.itemPath, itemId)
    itemFirebase.on('value', this.handleItemUpdate)
    this.itemFirebases[itemId] = itemFirebase
    this.emitChange()
  }
  removeItem(itemId) {
    if (!this.itemFirebases[itemId]) return
    
    var itemFirebase = this.itemFirebases[itemId]
    itemFirebase.off('value', this.handleItemUpdate)
    delete this.itemFirebases[itemId]
    delete this.items[itemId]
    this.emitChange()
  }
  get(id) {
    return this.items[id]
  }
  getNested(id) {
    var itemNested
    var item = this.items[id]
    if (item && item.kids) {
      itemNested = Object.assign({}, item, {
        childItems: item.kids.map(childId => this.getNested(childId)).filter(Boolean)
      })
    }
    return itemNested || item
  }
  all() {
    return _.values(this.items)
  }
  toJSON() {
    return this.items
  }
}

module.exports = FirebaseCollectionStore
