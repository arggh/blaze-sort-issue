Meteor.methods({

  /**
   * Inserts a new document with order of 0, maintaining a linear order between all documents.
   */
  insert() {
    Documents.update({}, { $inc: { order: 1 }}, { multi: true });
    Documents.insert({
      name: Random.id(10),
      order: 0
    });
  },

  /**
   * Removes a document, maintaining a linear order between all documents.
   */
  remove(docId) {
    const removedDocOrder = Documents.findOne(docId).order;
    Documents.remove(docId);
    return Documents.update({
      order: {
        $gte: removedDocOrder
      }
    }, {
      $inc: {
        order: -1
      }
    }, { multi: true });
  },

  /**
   * Changes a Document's order-property, maintaining a linear order between all documents.
   */
  moveTo(docId, position) {
    const doc = Documents.findOne(docId);
    const top = Documents.findOne({}, { sort: { order: -1 } });
    position = Math.max(0, Math.min(top.order, position));

    const selector = {};
    const modifier = {};

    if (position > doc.order) {
      selector.order = {
        $gt: doc.order,
        $lte: position
      };

      modifier.$inc = {
        order: -1
      }
      Documents.update(selector, modifier, { multi: true });
    } else if (position < doc.order) {
      selector.order = {
        $gte: position,
        $lt: doc.order
      };

      modifier.$inc = {
        order: 1
      }

      Documents.update(selector, modifier, { multi: true });
    } else {
      return;
    }

    return Documents.update({ _id: docId }, { $set: { order: position }});
  }
});
