function AudioKeys(options) {
  var self = this;

  self._setState(options);

  // all listeners are stored in arrays in their respective properties.
  // e.g. self._listeners.down = [fn1, fn2, ... ]
  self._listeners = {};

  // bind DOM events
  self._bind();
}

// Play well with require so that we can run a test suite and use browserify.
if(typeof module !== 'undefined') {
  module.exports = AudioKeys;
}

AudioKeys.prototype._setState = function(options) {
  var self = this;

  if(!options) {
    options = {};
  }

  // the state is kept in this object
  self._state = {};

  // set some defaults ...
  self._extendState({
    polyphony: 4,
    rows: 1,
    octaves: true,
    priority: 'last',
    rootNote: 48
  });

  // ... and override them with options.
  self._extendState(options);
};

AudioKeys.prototype._extendState = function(options) {
  var self = this;

  for(var o in options) {
    self._state[o] = options[o];
  }
};

AudioKeys.prototype.set = function(/* options || property, value */) {
  var self = this;

  if(arguments.length === 1) {
    self._extendState(arguments[0]);
  } else {
    self._state[arguments[0]] = arguments[1];
  }

  return this;
};

AudioKeys.prototype.get = function(property) {
  var self = this;

  return self._state[property];
};

// ================================================================
// Event Listeners
// ================================================================

// AudioKeys has a very simple event handling system. Internally
// we'll call self._trigger('down', argument) when we want to fire
// an event for the user.

AudioKeys.prototype.down = function(fn) {
  var self = this;

  // add the function to our list of listeners
  self._listeners.down = (self._listeners.down || []).concat(fn);
};

AudioKeys.prototype.up = function(fn) {
  var self = this;

  // add the function to our list of listeners
  self._listeners.up = (self._listeners.up || []).concat(fn);
};

AudioKeys.prototype._trigger = function(action /* args */) {
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
};

// ================================================================
// DOM Bindings
// ================================================================

AudioKeys.prototype._bind = function() {
  var self = this;

  if(typeof window !== 'undefined' && window.document) {
    window.document.addEventListener('keydown', self._addKey);
    window.document.addEventListener('keyup', self._removeKey);
  }
};
// _map returns the midi note for a given keyCode.
AudioKeys.prototype._map = function(keyCode) {
  var self = this;
  return self._keyMap[self._state.rows][keyCode];
};

// _isNote determines whether a keyCode is a note or not.
AudioKeys.prototype._isNote = function(keyCode) {
  var self = this;
  return !!self._keyMap[self._state.rows][keyCode];
};

// the keys correspond to `rows`, so `_keyMap[rows]` should retrieve
// that particular mapping.
AudioKeys.prototype._keyMap = {
  1: {
    65:  60,
    87:  61,
    83:  62,
    69:  63,
    68:  64,
    70:  65,
    84:  66,
    71:  67,
    89:  68,
    72:  69,
    85:  70,
    74:  71,
    75:  72,
    79:  73,
    76:  74,
    80:  75,
    186: 76,
    222: 77
  },
  2: {
    // bottom row
    90:  60,
    83:  61,
    88:  62,
    68:  63,
    67:  64,
    86:  65,
    71:  66,
    66:  67,
    72:  68,
    78:  69,
    74:  70,
    77:  71,
    188: 72,
    76:  73,
    190: 74,
    186: 75,
    191: 76,
    // top row
    81:  77,
    50:  78,
    87:  79,
    51:  80,
    69:  81,
    82:  82,
    53:  83,
    84:  84,
    54:  85,
    89:  86,
    55:  87,
    85:  88,
    73:  89,
    57:  90,
    79:  91,
    48:  92,
    80:  93,
    219: 94,
    187: 95,
    221: 96
  }
};

// The process is:

// key press
//   add to self._keys
//   (an accurate representation of keys currently pressed)
// resolve self.buffer
//   based on polyphony and priority, determine the notes
//   that get triggered for the user

AudioKeys.prototype._addKey = function(e) {
  var self = this;
  // if the keyCode is one that can be mapped and isn't
  // already pressed, add it to the key object.
  if(self._isNote(e.keyCode) && !self._isPressed(e.keyCode)) {
    var newKey = {
      note: self._map(e.keyCode),
      keyCode: e.keyCode
    };
    // add the newKey to the list of keys
    self._keys = (self._keys || []).concat(newKey);
    // reevaluate the active notes based on our priority rules.
    // give it the new note to use if there is an event to trigger.
    self._prioritize(newKey);
  }
};

AudioKeys.prototype._removeKey = function(e) {
  var self = this;
  // if the keyCode is active, remove it from the key object.
  if(self._isPressed(e.keyCode)) {
    var keyToRemove;
    for(var i = 0; i < self._keys.length; i++) {
      if(self._keys[i].keyCode === e.keyCode) {
        keyToRemove = self.keys[i];
      }
    }

    if(keyToRemove.isActive) {
      // trigger an event to remove the key

    }
  }
};

AudioKeys.prototype._isPressed = function(e) {

};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXVkaW9rZXlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gQXVkaW9LZXlzKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuX3NldFN0YXRlKG9wdGlvbnMpO1xuXG4gIC8vIGFsbCBsaXN0ZW5lcnMgYXJlIHN0b3JlZCBpbiBhcnJheXMgaW4gdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0aWVzLlxuICAvLyBlLmcuIHNlbGYuX2xpc3RlbmVycy5kb3duID0gW2ZuMSwgZm4yLCAuLi4gXVxuICBzZWxmLl9saXN0ZW5lcnMgPSB7fTtcblxuICAvLyBiaW5kIERPTSBldmVudHNcbiAgc2VsZi5fYmluZCgpO1xufVxuXG4vLyBQbGF5IHdlbGwgd2l0aCByZXF1aXJlIHNvIHRoYXQgd2UgY2FuIHJ1biBhIHRlc3Qgc3VpdGUgYW5kIHVzZSBicm93c2VyaWZ5LlxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBBdWRpb0tleXM7XG59XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLl9zZXRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgLy8gdGhlIHN0YXRlIGlzIGtlcHQgaW4gdGhpcyBvYmplY3RcbiAgc2VsZi5fc3RhdGUgPSB7fTtcblxuICAvLyBzZXQgc29tZSBkZWZhdWx0cyAuLi5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUoe1xuICAgIHBvbHlwaG9ueTogNCxcbiAgICByb3dzOiAxLFxuICAgIG9jdGF2ZXM6IHRydWUsXG4gICAgcHJpb3JpdHk6ICdsYXN0JyxcbiAgICByb290Tm90ZTogNDhcbiAgfSk7XG5cbiAgLy8gLi4uIGFuZCBvdmVycmlkZSB0aGVtIHdpdGggb3B0aW9ucy5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUob3B0aW9ucyk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9leHRlbmRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGZvcih2YXIgbyBpbiBvcHRpb25zKSB7XG4gICAgc2VsZi5fc3RhdGVbb10gPSBvcHRpb25zW29dO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKC8qIG9wdGlvbnMgfHwgcHJvcGVydHksIHZhbHVlICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZi5fZXh0ZW5kU3RhdGUoYXJndW1lbnRzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zdGF0ZVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gc2VsZi5fc3RhdGVbcHJvcGVydHldO1xufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IExpc3RlbmVyc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBBdWRpb0tleXMgaGFzIGEgdmVyeSBzaW1wbGUgZXZlbnQgaGFuZGxpbmcgc3lzdGVtLiBJbnRlcm5hbGx5XG4vLyB3ZSdsbCBjYWxsIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBhcmd1bWVudCkgd2hlbiB3ZSB3YW50IHRvIGZpcmVcbi8vIGFuIGV2ZW50IGZvciB0aGUgdXNlci5cblxuQXVkaW9LZXlzLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy5kb3duID0gKHNlbGYuX2xpc3RlbmVycy5kb3duIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMudXAgPSAoc2VsZi5fbGlzdGVuZXJzLnVwIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fdHJpZ2dlciA9IGZ1bmN0aW9uKGFjdGlvbiAvKiBhcmdzICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiB3ZSBoYXZlIGFueSBsaXN0ZW5lcnMgYnkgdGhpcyBuYW1lIC4uLlxuICBpZihzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXSAmJiBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5sZW5ndGgpIHtcbiAgICAvLyBncmFiIHRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbGlzdGVuZXJzIC4uLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBhcmdzLnNwbGljZSgwLCAxKTtcbiAgICAvLyBhbmQgY2FsbCB0aGVtIVxuICAgIHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dLmZvckVhY2goIGZ1bmN0aW9uKGZuKSB7XG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRE9NIEJpbmRpbmdzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5fYWRkS2V5KTtcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZWxmLl9yZW1vdmVLZXkpO1xuICB9XG59OyIsIi8vIF9tYXAgcmV0dXJucyB0aGUgbWlkaSBub3RlIGZvciBhIGdpdmVuIGtleUNvZGUuXG5BdWRpb0tleXMucHJvdG90eXBlLl9tYXAgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbi8vIF9pc05vdGUgZGV0ZXJtaW5lcyB3aGV0aGVyIGEga2V5Q29kZSBpcyBhIG5vdGUgb3Igbm90LlxuQXVkaW9LZXlzLnByb3RvdHlwZS5faXNOb3RlID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiAhIXNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbi8vIHRoZSBrZXlzIGNvcnJlc3BvbmQgdG8gYHJvd3NgLCBzbyBgX2tleU1hcFtyb3dzXWAgc2hvdWxkIHJldHJpZXZlXG4vLyB0aGF0IHBhcnRpY3VsYXIgbWFwcGluZy5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2tleU1hcCA9IHtcbiAgMToge1xuICAgIDY1OiAgNjAsXG4gICAgODc6ICA2MSxcbiAgICA4MzogIDYyLFxuICAgIDY5OiAgNjMsXG4gICAgNjg6ICA2NCxcbiAgICA3MDogIDY1LFxuICAgIDg0OiAgNjYsXG4gICAgNzE6ICA2NyxcbiAgICA4OTogIDY4LFxuICAgIDcyOiAgNjksXG4gICAgODU6ICA3MCxcbiAgICA3NDogIDcxLFxuICAgIDc1OiAgNzIsXG4gICAgNzk6ICA3MyxcbiAgICA3NjogIDc0LFxuICAgIDgwOiAgNzUsXG4gICAgMTg2OiA3NixcbiAgICAyMjI6IDc3XG4gIH0sXG4gIDI6IHtcbiAgICAvLyBib3R0b20gcm93XG4gICAgOTA6ICA2MCxcbiAgICA4MzogIDYxLFxuICAgIDg4OiAgNjIsXG4gICAgNjg6ICA2MyxcbiAgICA2NzogIDY0LFxuICAgIDg2OiAgNjUsXG4gICAgNzE6ICA2NixcbiAgICA2NjogIDY3LFxuICAgIDcyOiAgNjgsXG4gICAgNzg6ICA2OSxcbiAgICA3NDogIDcwLFxuICAgIDc3OiAgNzEsXG4gICAgMTg4OiA3MixcbiAgICA3NjogIDczLFxuICAgIDE5MDogNzQsXG4gICAgMTg2OiA3NSxcbiAgICAxOTE6IDc2LFxuICAgIC8vIHRvcCByb3dcbiAgICA4MTogIDc3LFxuICAgIDUwOiAgNzgsXG4gICAgODc6ICA3OSxcbiAgICA1MTogIDgwLFxuICAgIDY5OiAgODEsXG4gICAgODI6ICA4MixcbiAgICA1MzogIDgzLFxuICAgIDg0OiAgODQsXG4gICAgNTQ6ICA4NSxcbiAgICA4OTogIDg2LFxuICAgIDU1OiAgODcsXG4gICAgODU6ICA4OCxcbiAgICA3MzogIDg5LFxuICAgIDU3OiAgOTAsXG4gICAgNzk6ICA5MSxcbiAgICA0ODogIDkyLFxuICAgIDgwOiAgOTMsXG4gICAgMjE5OiA5NCxcbiAgICAxODc6IDk1LFxuICAgIDIyMTogOTZcbiAgfVxufTtcbiIsIi8vIFRoZSBwcm9jZXNzIGlzOlxuXG4vLyBrZXkgcHJlc3Ncbi8vICAgYWRkIHRvIHNlbGYuX2tleXNcbi8vICAgKGFuIGFjY3VyYXRlIHJlcHJlc2VudGF0aW9uIG9mIGtleXMgY3VycmVudGx5IHByZXNzZWQpXG4vLyByZXNvbHZlIHNlbGYuYnVmZmVyXG4vLyAgIGJhc2VkIG9uIHBvbHlwaG9ueSBhbmQgcHJpb3JpdHksIGRldGVybWluZSB0aGUgbm90ZXNcbi8vICAgdGhhdCBnZXQgdHJpZ2dlcmVkIGZvciB0aGUgdXNlclxuXG5BdWRpb0tleXMucHJvdG90eXBlLl9hZGRLZXkgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gaWYgdGhlIGtleUNvZGUgaXMgb25lIHRoYXQgY2FuIGJlIG1hcHBlZCBhbmQgaXNuJ3RcbiAgLy8gYWxyZWFkeSBwcmVzc2VkLCBhZGQgaXQgdG8gdGhlIGtleSBvYmplY3QuXG4gIGlmKHNlbGYuX2lzTm90ZShlLmtleUNvZGUpICYmICFzZWxmLl9pc1ByZXNzZWQoZS5rZXlDb2RlKSkge1xuICAgIHZhciBuZXdLZXkgPSB7XG4gICAgICBub3RlOiBzZWxmLl9tYXAoZS5rZXlDb2RlKSxcbiAgICAgIGtleUNvZGU6IGUua2V5Q29kZVxuICAgIH07XG4gICAgLy8gYWRkIHRoZSBuZXdLZXkgdG8gdGhlIGxpc3Qgb2Yga2V5c1xuICAgIHNlbGYuX2tleXMgPSAoc2VsZi5fa2V5cyB8fCBbXSkuY29uY2F0KG5ld0tleSk7XG4gICAgLy8gcmVldmFsdWF0ZSB0aGUgYWN0aXZlIG5vdGVzIGJhc2VkIG9uIG91ciBwcmlvcml0eSBydWxlcy5cbiAgICAvLyBnaXZlIGl0IHRoZSBuZXcgbm90ZSB0byB1c2UgaWYgdGhlcmUgaXMgYW4gZXZlbnQgdG8gdHJpZ2dlci5cbiAgICBzZWxmLl9wcmlvcml0aXplKG5ld0tleSk7XG4gIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3JlbW92ZUtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBpZiB0aGUga2V5Q29kZSBpcyBhY3RpdmUsIHJlbW92ZSBpdCBmcm9tIHRoZSBrZXkgb2JqZWN0LlxuICBpZihzZWxmLl9pc1ByZXNzZWQoZS5rZXlDb2RlKSkge1xuICAgIHZhciBrZXlUb1JlbW92ZTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VsZi5fa2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYoc2VsZi5fa2V5c1tpXS5rZXlDb2RlID09PSBlLmtleUNvZGUpIHtcbiAgICAgICAga2V5VG9SZW1vdmUgPSBzZWxmLmtleXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoa2V5VG9SZW1vdmUuaXNBY3RpdmUpIHtcbiAgICAgIC8vIHRyaWdnZXIgYW4gZXZlbnQgdG8gcmVtb3ZlIHRoZSBrZXlcblxuICAgIH1cbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5faXNQcmVzc2VkID0gZnVuY3Rpb24oZSkge1xuXG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9