// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Model
  // ----------

  var Item = Backbone.Model.extend({

    // Default attributes.
    defaults: function() {
      return {
        Q: "Q",
        A: "",		
        order: Items.nextOrder(),
      };
    },

  });

  // Collection
  // ---------------

  // The collection is backed by *localStorage* instead of a remote server.
  var ItemsList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Item,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("backbone-1"),

    // We keep the items in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // sorted by their original insertion order.
    comparator: 'order'

  });

  // Create our global collection of **Todos**.
  var Items = new ItemsList;

  // Item View
  // --------------

  // The DOM element for a item...
  var ItemView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
//      "blur .edit"      : "close",
      "keypress .edit2"  : "updateOnEnter",
//      "blur .edit2"      : "close"	  
    },

    // The View listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Item** and a **ItemView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      //this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      this.input2 = this.$('.edit2');	  
      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },
	
    // Close the `"editing"` mode, saving changes.
    close: function() {
      var value = this.input.val();
      var value2 = this.input2.val();	  
      if (!value) {
        this.clear();
      } else {
        this.model.save({Q: value, A: value2});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new":  "createOnEnter",
    },

    // At initialization we bind to the relevant events on the `Items`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new");
      this.input2 = this.$("#new2");	  

      this.listenTo(Items, 'add', this.addOne);
      this.listenTo(Items, 'reset', this.addAll);
      this.listenTo(Items, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Items.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      if (Items.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({total: Items.length}));
      } else {
        this.main.hide();
        this.footer.hide();
      }
    },

    // Add a single item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(it) {
      var view = new ItemView({model: it});
      this.$("#list").append(view.render().el);
    },

    // Add all items in the **Items** collection at once.
    addAll: function() {
      Items.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Item** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Items.create({Q: this.input.val(),A: this.input2.val()});
      this.input.val(''); this.input2.val('');
    },

  });

  // Finally, we kick things off by creating the **App**.
  //var App = new AppView;

});
