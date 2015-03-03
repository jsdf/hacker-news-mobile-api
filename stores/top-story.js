var _ = require('underscore')

var getFirebase = require('../config/firebase')
var bind = require('../util/bind')
var FirebaseCollectionStore = require('./firebase-collection')

class TopStoryStore extends FirebaseCollectionStore {
  constructor(orderPath = '/topstories', itemPath = '/item') {
    this.handleOrderUpdate = bind(this.handleOrderUpdate, this)
    this.cleanupItems = false

    super(itemPath)

    this.orderPath = orderPath || itemPath
    this.orderIds = []
    this.orderFirebase = getFirebase(this.orderPath)
    this.orderFirebase.on('value', this.handleOrderUpdate)
  }
  reset({items, orderIds}) {
    super.reset(items)
    this.orderIds = orderIds
    orderIds.forEach((orderId) => this.addItem(orderId))
  }
  handleOrderUpdate(dataSnapshot) {
    var currentOrderIds = dataSnapshot.val()
    var previousOrderIds = this.orderIds
    this.handleCollectionUpdate(currentOrderIds, previousOrderIds)

    this.orderIds = currentOrderIds
    this.emitChange()
  }
  getCurrentIds() {
    return this.orderIds
  }
  ordered() {
    return this.orderIds.reduce((orderedItems, itemId, index) => {
      var item = this.get(itemId)
      if (item) {
        orderedItems.push(Object.assign({position: index+1}, item))
      }
      return orderedItems
    }, [])
  }
  toJSON() {
    return {
      items: this.items,
      orderIds: this.orderIds,
    }
  }
}

module.exports = TopStoryStore
