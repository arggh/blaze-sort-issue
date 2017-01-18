import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import dragula from 'dragula';

import './main.html';

Template.body.onRendered(function() {
  // Get the container element for Dragula
  const container = this.$('.documents').get(0);

  // Initialize Dragula
  const drake = dragula([container]);

  // Attach handler for drop event to prevent DOM manipulation and trigger moving
  drake.on('drop', (el, target, source, sibling) => {
    // Retrieve new order for the dragged element
    const newIndex = Array.from(el.parentNode.children).indexOf(el);

    // Get some properties from the element
    const id = el.getAttribute('data-id');
    const name = el.getAttribute('data-name');

    // Log to console for debugging purposes
    console.log(`Moving ${name} to position ${newIndex}`);

    // Cancel the drag&drop, preventing DOM manipulation by Dragula
    drake.cancel(true);

    // Call Meteor method to change dragged Document's order
    Meteor.call('moveTo', id, newIndex);
  });
});

Template.body.helpers({
  /**
   * Get all Documents, sorted by order
   */
  docs() {
    return Documents.find({}, {
      sort: {
        order: 1
      }
    });
  }
});

Template.body.events({
  'click .remove'(event, instance) {
    const docId = event.currentTarget.parentElement.dataset.id;
    Meteor.call('remove', docId);
  },
  'click button.insert'(event, instance) {
    Meteor.call('insert');
  },
  'click button.magicMove'(event, instance) {
    docIdToMove = Documents.findOne({ order: 1 })._id;
    Meteor.call('moveTo', docIdToMove, 0);
  }
});
