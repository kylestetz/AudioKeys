// ================================================================
// Event Listeners
// ================================================================

// AudioKeys has a very simple event handling system. Internally
// we'll call self._trigger('down', argument) when we want to fire
// an event for the user.

module.exports = {
  down: function(fn) {
    var self = this;

    // add the function to our list of listeners
    self._listeners.down = (self._listeners.down || []).concat(fn);
  },

  up: function(fn) {
    var self = this;

    // add the function to our list of listeners
    self._listeners.up = (self._listeners.up || []).concat(fn);
  },

  _trigger: function(action /* args */) {
    var self = this;

    // if we have any listeners by this name ...
    if(self._listeners[action] && self._listeners[action].length) {
      // grab the arguments to pass to the listeners ...
      var args = Array.prototype.slice.call(arguments);
      args.splice(0, 1);
      // and call them!
      self._listeners[action].forEach( function(fn) {
        fn.apply(self, args);
      });
    }
  },

  // ================================================================
  // DOM Bindings
  // ================================================================

  _bind: function() {
    var self = this;

    if(typeof window !== 'undefined' && window.document) {
      window.document.addEventListener('keydown', function(e) {
        self._addKey(e);
      });
      window.document.addEventListener('keyup', function(e) {
        self._removeKey(e);
      });

      var lastFocus = true;
      setInterval( function() {
        if(window.document.hasFocus() === lastFocus) {
          return;
        }
        lastFocus = !lastFocus;
        if(!lastFocus) {
          self.clear();
        }
      }, 100);
    }
  },

};
