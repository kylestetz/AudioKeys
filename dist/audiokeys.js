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

AudioKeys.prototype._toFrequency = function(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
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
      keyCode: e.keyCode,
      // this shouldn't be here
      isActive: true
    };
    // add the newKey to the list of keys
    self._keys = (self._keys || []).concat(newKey);
    // reevaluate the active notes based on our priority rules.
    // give it the new note to use if there is an event to trigger.
    // self._prioritize(newKey);
  }
};

AudioKeys.prototype._removeKey = function(e) {
  var self = this;
  // if the keyCode is active, remove it from the key object.
  if(self._isPressed(e.keyCode)) {
    var keyToRemove;
    for(var i = 0; i < self._keys.length; i++) {
      if(self._keys[i].keyCode === e.keyCode) {
        keyToRemove = self._keys[i];
        break;
      }
    }

    if(keyToRemove.isActive) {
      // trigger an event to remove the key
      self._keys.splice(self._keys.indexOf(keyToRemove), 1);
      self._trigger('up', self._makeNote(keyToRemove));
    }
  }
};

AudioKeys.prototype._isPressed = function(keyCode) {
  var self = this;

  if(!self._keys || !self._keys.length) {
    return false;
  }

  for(var i = 0; i < self._keys.length; i++) {
    if(self._keys[i].keyCode === keyCode) {
      return true;
    }
  }
  return false;
};

// turn a key object into a note object for the event listeners.
AudioKeys.prototype._makeNote = function(key) {
  return {
    key: key.keyCode,
    note: key.note,
    frequency: self._toFrequency(key.note)
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXVkaW9rZXlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gQXVkaW9LZXlzKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuX3NldFN0YXRlKG9wdGlvbnMpO1xuXG4gIC8vIGFsbCBsaXN0ZW5lcnMgYXJlIHN0b3JlZCBpbiBhcnJheXMgaW4gdGhlaXIgcmVzcGVjdGl2ZSBwcm9wZXJ0aWVzLlxuICAvLyBlLmcuIHNlbGYuX2xpc3RlbmVycy5kb3duID0gW2ZuMSwgZm4yLCAuLi4gXVxuICBzZWxmLl9saXN0ZW5lcnMgPSB7fTtcblxuICAvLyBiaW5kIERPTSBldmVudHNcbiAgc2VsZi5fYmluZCgpO1xufVxuXG4vLyBQbGF5IHdlbGwgd2l0aCByZXF1aXJlIHNvIHRoYXQgd2UgY2FuIHJ1biBhIHRlc3Qgc3VpdGUgYW5kIHVzZSBicm93c2VyaWZ5LlxuaWYodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBBdWRpb0tleXM7XG59XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLl9zZXRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgLy8gdGhlIHN0YXRlIGlzIGtlcHQgaW4gdGhpcyBvYmplY3RcbiAgc2VsZi5fc3RhdGUgPSB7fTtcblxuICAvLyBzZXQgc29tZSBkZWZhdWx0cyAuLi5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUoe1xuICAgIHBvbHlwaG9ueTogNCxcbiAgICByb3dzOiAxLFxuICAgIG9jdGF2ZXM6IHRydWUsXG4gICAgcHJpb3JpdHk6ICdsYXN0JyxcbiAgICByb290Tm90ZTogNDhcbiAgfSk7XG5cbiAgLy8gLi4uIGFuZCBvdmVycmlkZSB0aGVtIHdpdGggb3B0aW9ucy5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUob3B0aW9ucyk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9leHRlbmRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGZvcih2YXIgbyBpbiBvcHRpb25zKSB7XG4gICAgc2VsZi5fc3RhdGVbb10gPSBvcHRpb25zW29dO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKC8qIG9wdGlvbnMgfHwgcHJvcGVydHksIHZhbHVlICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZi5fZXh0ZW5kU3RhdGUoYXJndW1lbnRzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zdGF0ZVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gc2VsZi5fc3RhdGVbcHJvcGVydHldO1xufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IExpc3RlbmVyc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBBdWRpb0tleXMgaGFzIGEgdmVyeSBzaW1wbGUgZXZlbnQgaGFuZGxpbmcgc3lzdGVtLiBJbnRlcm5hbGx5XG4vLyB3ZSdsbCBjYWxsIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBhcmd1bWVudCkgd2hlbiB3ZSB3YW50IHRvIGZpcmVcbi8vIGFuIGV2ZW50IGZvciB0aGUgdXNlci5cblxuQXVkaW9LZXlzLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy5kb3duID0gKHNlbGYuX2xpc3RlbmVycy5kb3duIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMudXAgPSAoc2VsZi5fbGlzdGVuZXJzLnVwIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fdHJpZ2dlciA9IGZ1bmN0aW9uKGFjdGlvbiAvKiBhcmdzICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiB3ZSBoYXZlIGFueSBsaXN0ZW5lcnMgYnkgdGhpcyBuYW1lIC4uLlxuICBpZihzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXSAmJiBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5sZW5ndGgpIHtcbiAgICAvLyBncmFiIHRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbGlzdGVuZXJzIC4uLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBhcmdzLnNwbGljZSgwLCAxKTtcbiAgICAvLyBhbmQgY2FsbCB0aGVtIVxuICAgIHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dLmZvckVhY2goIGZ1bmN0aW9uKGZuKSB7XG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRE9NIEJpbmRpbmdzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5fYWRkS2V5KTtcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZWxmLl9yZW1vdmVLZXkpO1xuICB9XG59OyIsIi8vIF9tYXAgcmV0dXJucyB0aGUgbWlkaSBub3RlIGZvciBhIGdpdmVuIGtleUNvZGUuXG5BdWRpb0tleXMucHJvdG90eXBlLl9tYXAgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbi8vIF9pc05vdGUgZGV0ZXJtaW5lcyB3aGV0aGVyIGEga2V5Q29kZSBpcyBhIG5vdGUgb3Igbm90LlxuQXVkaW9LZXlzLnByb3RvdHlwZS5faXNOb3RlID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiAhIXNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RvRnJlcXVlbmN5ID0gZnVuY3Rpb24obm90ZSkge1xuICByZXR1cm4gKCBNYXRoLnBvdygyLCAoIG5vdGUtNjkgKSAvIDEyKSApICogNDQwLjA7XG59O1xuXG4vLyB0aGUga2V5cyBjb3JyZXNwb25kIHRvIGByb3dzYCwgc28gYF9rZXlNYXBbcm93c11gIHNob3VsZCByZXRyaWV2ZVxuLy8gdGhhdCBwYXJ0aWN1bGFyIG1hcHBpbmcuXG5BdWRpb0tleXMucHJvdG90eXBlLl9rZXlNYXAgPSB7XG4gIDE6IHtcbiAgICA2NTogIDYwLFxuICAgIDg3OiAgNjEsXG4gICAgODM6ICA2MixcbiAgICA2OTogIDYzLFxuICAgIDY4OiAgNjQsXG4gICAgNzA6ICA2NSxcbiAgICA4NDogIDY2LFxuICAgIDcxOiAgNjcsXG4gICAgODk6ICA2OCxcbiAgICA3MjogIDY5LFxuICAgIDg1OiAgNzAsXG4gICAgNzQ6ICA3MSxcbiAgICA3NTogIDcyLFxuICAgIDc5OiAgNzMsXG4gICAgNzY6ICA3NCxcbiAgICA4MDogIDc1LFxuICAgIDE4NjogNzYsXG4gICAgMjIyOiA3N1xuICB9LFxuICAyOiB7XG4gICAgLy8gYm90dG9tIHJvd1xuICAgIDkwOiAgNjAsXG4gICAgODM6ICA2MSxcbiAgICA4ODogIDYyLFxuICAgIDY4OiAgNjMsXG4gICAgNjc6ICA2NCxcbiAgICA4NjogIDY1LFxuICAgIDcxOiAgNjYsXG4gICAgNjY6ICA2NyxcbiAgICA3MjogIDY4LFxuICAgIDc4OiAgNjksXG4gICAgNzQ6ICA3MCxcbiAgICA3NzogIDcxLFxuICAgIDE4ODogNzIsXG4gICAgNzY6ICA3MyxcbiAgICAxOTA6IDc0LFxuICAgIDE4NjogNzUsXG4gICAgMTkxOiA3NixcbiAgICAvLyB0b3Agcm93XG4gICAgODE6ICA3NyxcbiAgICA1MDogIDc4LFxuICAgIDg3OiAgNzksXG4gICAgNTE6ICA4MCxcbiAgICA2OTogIDgxLFxuICAgIDgyOiAgODIsXG4gICAgNTM6ICA4MyxcbiAgICA4NDogIDg0LFxuICAgIDU0OiAgODUsXG4gICAgODk6ICA4NixcbiAgICA1NTogIDg3LFxuICAgIDg1OiAgODgsXG4gICAgNzM6ICA4OSxcbiAgICA1NzogIDkwLFxuICAgIDc5OiAgOTEsXG4gICAgNDg6ICA5MixcbiAgICA4MDogIDkzLFxuICAgIDIxOTogOTQsXG4gICAgMTg3OiA5NSxcbiAgICAyMjE6IDk2XG4gIH1cbn07XG4iLCIvLyBUaGUgcHJvY2VzcyBpczpcblxuLy8ga2V5IHByZXNzXG4vLyAgIGFkZCB0byBzZWxmLl9rZXlzXG4vLyAgIChhbiBhY2N1cmF0ZSByZXByZXNlbnRhdGlvbiBvZiBrZXlzIGN1cnJlbnRseSBwcmVzc2VkKVxuLy8gcmVzb2x2ZSBzZWxmLmJ1ZmZlclxuLy8gICBiYXNlZCBvbiBwb2x5cGhvbnkgYW5kIHByaW9yaXR5LCBkZXRlcm1pbmUgdGhlIG5vdGVzXG4vLyAgIHRoYXQgZ2V0IHRyaWdnZXJlZCBmb3IgdGhlIHVzZXJcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fYWRkS2V5ID0gZnVuY3Rpb24oZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIGlmIHRoZSBrZXlDb2RlIGlzIG9uZSB0aGF0IGNhbiBiZSBtYXBwZWQgYW5kIGlzbid0XG4gIC8vIGFscmVhZHkgcHJlc3NlZCwgYWRkIGl0IHRvIHRoZSBrZXkgb2JqZWN0LlxuICBpZihzZWxmLl9pc05vdGUoZS5rZXlDb2RlKSAmJiAhc2VsZi5faXNQcmVzc2VkKGUua2V5Q29kZSkpIHtcbiAgICB2YXIgbmV3S2V5ID0ge1xuICAgICAgbm90ZTogc2VsZi5fbWFwKGUua2V5Q29kZSksXG4gICAgICBrZXlDb2RlOiBlLmtleUNvZGUsXG4gICAgICAvLyB0aGlzIHNob3VsZG4ndCBiZSBoZXJlXG4gICAgICBpc0FjdGl2ZTogdHJ1ZVxuICAgIH07XG4gICAgLy8gYWRkIHRoZSBuZXdLZXkgdG8gdGhlIGxpc3Qgb2Yga2V5c1xuICAgIHNlbGYuX2tleXMgPSAoc2VsZi5fa2V5cyB8fCBbXSkuY29uY2F0KG5ld0tleSk7XG4gICAgLy8gcmVldmFsdWF0ZSB0aGUgYWN0aXZlIG5vdGVzIGJhc2VkIG9uIG91ciBwcmlvcml0eSBydWxlcy5cbiAgICAvLyBnaXZlIGl0IHRoZSBuZXcgbm90ZSB0byB1c2UgaWYgdGhlcmUgaXMgYW4gZXZlbnQgdG8gdHJpZ2dlci5cbiAgICAvLyBzZWxmLl9wcmlvcml0aXplKG5ld0tleSk7XG4gIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3JlbW92ZUtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBpZiB0aGUga2V5Q29kZSBpcyBhY3RpdmUsIHJlbW92ZSBpdCBmcm9tIHRoZSBrZXkgb2JqZWN0LlxuICBpZihzZWxmLl9pc1ByZXNzZWQoZS5rZXlDb2RlKSkge1xuICAgIHZhciBrZXlUb1JlbW92ZTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VsZi5fa2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYoc2VsZi5fa2V5c1tpXS5rZXlDb2RlID09PSBlLmtleUNvZGUpIHtcbiAgICAgICAga2V5VG9SZW1vdmUgPSBzZWxmLl9rZXlzW2ldO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihrZXlUb1JlbW92ZS5pc0FjdGl2ZSkge1xuICAgICAgLy8gdHJpZ2dlciBhbiBldmVudCB0byByZW1vdmUgdGhlIGtleVxuICAgICAgc2VsZi5fa2V5cy5zcGxpY2Uoc2VsZi5fa2V5cy5pbmRleE9mKGtleVRvUmVtb3ZlKSwgMSk7XG4gICAgICBzZWxmLl90cmlnZ2VyKCd1cCcsIHNlbGYuX21ha2VOb3RlKGtleVRvUmVtb3ZlKSk7XG4gICAgfVxuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9pc1ByZXNzZWQgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighc2VsZi5fa2V5cyB8fCAhc2VsZi5fa2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IodmFyIGkgPSAwOyBpIDwgc2VsZi5fa2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHNlbGYuX2tleXNbaV0ua2V5Q29kZSA9PT0ga2V5Q29kZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIHR1cm4gYSBrZXkgb2JqZWN0IGludG8gYSBub3RlIG9iamVjdCBmb3IgdGhlIGV2ZW50IGxpc3RlbmVycy5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX21ha2VOb3RlID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXkua2V5Q29kZSxcbiAgICBub3RlOiBrZXkubm90ZSxcbiAgICBmcmVxdWVuY3k6IHNlbGYuX3RvRnJlcXVlbmN5KGtleS5ub3RlKVxuICB9O1xufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=