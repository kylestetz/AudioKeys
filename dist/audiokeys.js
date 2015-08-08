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
    rootNote: 48,
    keys: [],
    buffer: []
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

// ================================================================
// KEY BUFFER
// ================================================================

// The process is:

// key press
//   add to self._state.keys
//   (an accurate representation of keys currently pressed)
// resolve self.buffer
//   based on polyphony and priority, determine the notes
//   that get triggered for the user

AudioKeys.prototype._addKey = function(e) {
  var self = this;
  // if the keyCode is one that can be mapped and isn't
  // already pressed, add it to the key object.
  if(self._isNote(e.keyCode) && !self._isPressed(e.keyCode)) {
    var newKey = self._makeNote(e.keyCode);
    // add the newKey to the list of keys
    self._state.keys = (self._state.keys || []).concat(newKey);
    // reevaluate the active notes based on our priority rules.
    // give it the new note to use if there is an event to trigger.
    self._update();
  }
};

AudioKeys.prototype._removeKey = function(e) {
  var self = this;
  // if the keyCode is active, remove it from the key object.
  if(self._isPressed(e.keyCode)) {
    var keyToRemove;
    for(var i = 0; i < self._state.keys.length; i++) {
      if(self._state.keys[i].keyCode === e.keyCode) {
        keyToRemove = self._state.keys[i];
        break;
      }
    }

    if(keyToRemove.isActive) {
      // remove the key from _keys
      self._state.keys.splice(self._state.keys.indexOf(keyToRemove), 1);
      self._update();
    }
  }
};

AudioKeys.prototype._isPressed = function(keyCode) {
  var self = this;

  if(!self._state.keys || !self._state.keys.length) {
    return false;
  }

  for(var i = 0; i < self._state.keys.length; i++) {
    if(self._state.keys[i].keyCode === keyCode) {
      return true;
    }
  }
  return false;
};

// turn a key object into a note object for the event listeners.
AudioKeys.prototype._makeNote = function(keyCode) {
  var self = this;
  return {
    keyCode: keyCode,
    note: self._map(keyCode),
    frequency: self._toFrequency( self._map(keyCode) )
  };
};

// ================================================================
// NOTE BUFFER
// ================================================================

// every time a change is made to _keys due to a key on or key off
// we need to call `_update`. It compares the `_keys` array to the
// `buffer` array, which is the array of notes that are really
// being played, makes the necessary changes to `buffer` and
// triggers any events that need triggering.

AudioKeys.prototype._update = function() {
  var self = this;

  // a key has been added to self._state.keys.
  // stash the old buffer
  var oldBuffer = self._state.buffer;
  // set the new priority in self.state._keys
  self._prioritize();
  // compare the buffers and trigger events based on
  // the differences.
  self._diff(oldBuffer);
};

AudioKeys.prototype._diff = function(oldBuffer) {
  var self = this;

  // if it's not in the OLD buffer, it's a note ON.
  // if it's not in the NEW buffer, it's a note OFF.

  var oldNotes = oldBuffer.map( function(key) {
    return key.keyCode;
  });

  var newNotes = self._state.buffer.map( function(key) {
    return key.keyCode;
  });

  // check for old (removed) notes
  var notesToRemove = [];
  oldNotes.forEach( function(key) {
    if(newNotes.indexOf(key) === -1) {
      notesToRemove.push(key);
    }
  });

  // check for new notes
  var notesToAdd = [];
  newNotes.forEach( function(key) {
    if(oldNotes.indexOf(key) === -1) {
      notesToAdd.push(key);
    }
  });

  notesToAdd.forEach( function(key) {
    self._trigger('down', self._makeNote(key));
  });

  notesToRemove.forEach( function(key) {
    self._trigger('up', self._makeNote(key));
  });
};

AudioKeys.prototype._prioritize = function() {
  var self = this;

  // if all the keys have been turned off, no need
  // to do anything here.
  if(!self._state.keys.length) {
    self._state.buffer = [];
    return;
  }


  if(self._state.polyphony >= self._state.keys.length) {
    // every note is active
    self._state.keys = self._state.keys.map( function(key) {
      key.isActive = true;
      return key;
    });
  } else {

    // i think this is where the behaviors will be run?

    // set all keys to inactive.
    self._state.keys = self._state.keys.map( function(key) {
      key.isActive = false;
      return key;
    });
    // set the last bunch to active based on the polyphony.
    for(var i = self._state.keys.length - self._state.polyphony; i < self._state.keys.length; i++) {
      self._state.keys[i].isActive = true;
    }
  }

  // now take the isActive keys and set the new buffer.
  self._state.buffer = [];

  self._state.keys.forEach( function(key) {
    if(key.isActive) {
      self._state.buffer.push(key);
    }
  });

  // done.
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiLCJBdWRpb0tleXMucHJpb3JpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImF1ZGlva2V5cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEF1ZGlvS2V5cyhvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLl9zZXRTdGF0ZShvcHRpb25zKTtcblxuICAvLyBhbGwgbGlzdGVuZXJzIGFyZSBzdG9yZWQgaW4gYXJyYXlzIGluIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydGllcy5cbiAgLy8gZS5nLiBzZWxmLl9saXN0ZW5lcnMuZG93biA9IFtmbjEsIGZuMiwgLi4uIF1cbiAgc2VsZi5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gYmluZCBET00gZXZlbnRzXG4gIHNlbGYuX2JpbmQoKTtcbn1cblxuLy8gUGxheSB3ZWxsIHdpdGggcmVxdWlyZSBzbyB0aGF0IHdlIGNhbiBydW4gYSB0ZXN0IHN1aXRlIGFuZCB1c2UgYnJvd3NlcmlmeS5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gQXVkaW9LZXlzO1xufVxuIiwiQXVkaW9LZXlzLnByb3RvdHlwZS5fc2V0U3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIC8vIHRoZSBzdGF0ZSBpcyBrZXB0IGluIHRoaXMgb2JqZWN0XG4gIHNlbGYuX3N0YXRlID0ge307XG5cbiAgLy8gc2V0IHNvbWUgZGVmYXVsdHMgLi4uXG4gIHNlbGYuX2V4dGVuZFN0YXRlKHtcbiAgICBwb2x5cGhvbnk6IDQsXG4gICAgcm93czogMSxcbiAgICBvY3RhdmVzOiB0cnVlLFxuICAgIHByaW9yaXR5OiAnbGFzdCcsXG4gICAgcm9vdE5vdGU6IDQ4LFxuICAgIGtleXM6IFtdLFxuICAgIGJ1ZmZlcjogW11cbiAgfSk7XG5cbiAgLy8gLi4uIGFuZCBvdmVycmlkZSB0aGVtIHdpdGggb3B0aW9ucy5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUob3B0aW9ucyk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9leHRlbmRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGZvcih2YXIgbyBpbiBvcHRpb25zKSB7XG4gICAgc2VsZi5fc3RhdGVbb10gPSBvcHRpb25zW29dO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKC8qIG9wdGlvbnMgfHwgcHJvcGVydHksIHZhbHVlICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZi5fZXh0ZW5kU3RhdGUoYXJndW1lbnRzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zdGF0ZVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gc2VsZi5fc3RhdGVbcHJvcGVydHldO1xufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IExpc3RlbmVyc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBBdWRpb0tleXMgaGFzIGEgdmVyeSBzaW1wbGUgZXZlbnQgaGFuZGxpbmcgc3lzdGVtLiBJbnRlcm5hbGx5XG4vLyB3ZSdsbCBjYWxsIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBhcmd1bWVudCkgd2hlbiB3ZSB3YW50IHRvIGZpcmVcbi8vIGFuIGV2ZW50IGZvciB0aGUgdXNlci5cblxuQXVkaW9LZXlzLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy5kb3duID0gKHNlbGYuX2xpc3RlbmVycy5kb3duIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMudXAgPSAoc2VsZi5fbGlzdGVuZXJzLnVwIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fdHJpZ2dlciA9IGZ1bmN0aW9uKGFjdGlvbiAvKiBhcmdzICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiB3ZSBoYXZlIGFueSBsaXN0ZW5lcnMgYnkgdGhpcyBuYW1lIC4uLlxuICBpZihzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXSAmJiBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5sZW5ndGgpIHtcbiAgICAvLyBncmFiIHRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbGlzdGVuZXJzIC4uLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBhcmdzLnNwbGljZSgwLCAxKTtcbiAgICAvLyBhbmQgY2FsbCB0aGVtIVxuICAgIHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dLmZvckVhY2goIGZ1bmN0aW9uKGZuKSB7XG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRE9NIEJpbmRpbmdzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgc2VsZi5fYWRkS2V5KTtcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZWxmLl9yZW1vdmVLZXkpO1xuICB9XG59OyIsIi8vIF9tYXAgcmV0dXJucyB0aGUgbWlkaSBub3RlIGZvciBhIGdpdmVuIGtleUNvZGUuXG5BdWRpb0tleXMucHJvdG90eXBlLl9tYXAgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbi8vIF9pc05vdGUgZGV0ZXJtaW5lcyB3aGV0aGVyIGEga2V5Q29kZSBpcyBhIG5vdGUgb3Igbm90LlxuQXVkaW9LZXlzLnByb3RvdHlwZS5faXNOb3RlID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiAhIXNlbGYuX2tleU1hcFtzZWxmLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RvRnJlcXVlbmN5ID0gZnVuY3Rpb24obm90ZSkge1xuICByZXR1cm4gKCBNYXRoLnBvdygyLCAoIG5vdGUtNjkgKSAvIDEyKSApICogNDQwLjA7XG59O1xuXG4vLyB0aGUga2V5cyBjb3JyZXNwb25kIHRvIGByb3dzYCwgc28gYF9rZXlNYXBbcm93c11gIHNob3VsZCByZXRyaWV2ZVxuLy8gdGhhdCBwYXJ0aWN1bGFyIG1hcHBpbmcuXG5BdWRpb0tleXMucHJvdG90eXBlLl9rZXlNYXAgPSB7XG4gIDE6IHtcbiAgICA2NTogIDYwLFxuICAgIDg3OiAgNjEsXG4gICAgODM6ICA2MixcbiAgICA2OTogIDYzLFxuICAgIDY4OiAgNjQsXG4gICAgNzA6ICA2NSxcbiAgICA4NDogIDY2LFxuICAgIDcxOiAgNjcsXG4gICAgODk6ICA2OCxcbiAgICA3MjogIDY5LFxuICAgIDg1OiAgNzAsXG4gICAgNzQ6ICA3MSxcbiAgICA3NTogIDcyLFxuICAgIDc5OiAgNzMsXG4gICAgNzY6ICA3NCxcbiAgICA4MDogIDc1LFxuICAgIDE4NjogNzYsXG4gICAgMjIyOiA3N1xuICB9LFxuICAyOiB7XG4gICAgLy8gYm90dG9tIHJvd1xuICAgIDkwOiAgNjAsXG4gICAgODM6ICA2MSxcbiAgICA4ODogIDYyLFxuICAgIDY4OiAgNjMsXG4gICAgNjc6ICA2NCxcbiAgICA4NjogIDY1LFxuICAgIDcxOiAgNjYsXG4gICAgNjY6ICA2NyxcbiAgICA3MjogIDY4LFxuICAgIDc4OiAgNjksXG4gICAgNzQ6ICA3MCxcbiAgICA3NzogIDcxLFxuICAgIDE4ODogNzIsXG4gICAgNzY6ICA3MyxcbiAgICAxOTA6IDc0LFxuICAgIDE4NjogNzUsXG4gICAgMTkxOiA3NixcbiAgICAvLyB0b3Agcm93XG4gICAgODE6ICA3NyxcbiAgICA1MDogIDc4LFxuICAgIDg3OiAgNzksXG4gICAgNTE6ICA4MCxcbiAgICA2OTogIDgxLFxuICAgIDgyOiAgODIsXG4gICAgNTM6ICA4MyxcbiAgICA4NDogIDg0LFxuICAgIDU0OiAgODUsXG4gICAgODk6ICA4NixcbiAgICA1NTogIDg3LFxuICAgIDg1OiAgODgsXG4gICAgNzM6ICA4OSxcbiAgICA1NzogIDkwLFxuICAgIDc5OiAgOTEsXG4gICAgNDg6ICA5MixcbiAgICA4MDogIDkzLFxuICAgIDIxOTogOTQsXG4gICAgMTg3OiA5NSxcbiAgICAyMjE6IDk2XG4gIH1cbn07XG4iLCIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBLRVkgQlVGRkVSXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIFRoZSBwcm9jZXNzIGlzOlxuXG4vLyBrZXkgcHJlc3Ncbi8vICAgYWRkIHRvIHNlbGYuX3N0YXRlLmtleXNcbi8vICAgKGFuIGFjY3VyYXRlIHJlcHJlc2VudGF0aW9uIG9mIGtleXMgY3VycmVudGx5IHByZXNzZWQpXG4vLyByZXNvbHZlIHNlbGYuYnVmZmVyXG4vLyAgIGJhc2VkIG9uIHBvbHlwaG9ueSBhbmQgcHJpb3JpdHksIGRldGVybWluZSB0aGUgbm90ZXNcbi8vICAgdGhhdCBnZXQgdHJpZ2dlcmVkIGZvciB0aGUgdXNlclxuXG5BdWRpb0tleXMucHJvdG90eXBlLl9hZGRLZXkgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gaWYgdGhlIGtleUNvZGUgaXMgb25lIHRoYXQgY2FuIGJlIG1hcHBlZCBhbmQgaXNuJ3RcbiAgLy8gYWxyZWFkeSBwcmVzc2VkLCBhZGQgaXQgdG8gdGhlIGtleSBvYmplY3QuXG4gIGlmKHNlbGYuX2lzTm90ZShlLmtleUNvZGUpICYmICFzZWxmLl9pc1ByZXNzZWQoZS5rZXlDb2RlKSkge1xuICAgIHZhciBuZXdLZXkgPSBzZWxmLl9tYWtlTm90ZShlLmtleUNvZGUpO1xuICAgIC8vIGFkZCB0aGUgbmV3S2V5IHRvIHRoZSBsaXN0IG9mIGtleXNcbiAgICBzZWxmLl9zdGF0ZS5rZXlzID0gKHNlbGYuX3N0YXRlLmtleXMgfHwgW10pLmNvbmNhdChuZXdLZXkpO1xuICAgIC8vIHJlZXZhbHVhdGUgdGhlIGFjdGl2ZSBub3RlcyBiYXNlZCBvbiBvdXIgcHJpb3JpdHkgcnVsZXMuXG4gICAgLy8gZ2l2ZSBpdCB0aGUgbmV3IG5vdGUgdG8gdXNlIGlmIHRoZXJlIGlzIGFuIGV2ZW50IHRvIHRyaWdnZXIuXG4gICAgc2VsZi5fdXBkYXRlKCk7XG4gIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3JlbW92ZUtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBpZiB0aGUga2V5Q29kZSBpcyBhY3RpdmUsIHJlbW92ZSBpdCBmcm9tIHRoZSBrZXkgb2JqZWN0LlxuICBpZihzZWxmLl9pc1ByZXNzZWQoZS5rZXlDb2RlKSkge1xuICAgIHZhciBrZXlUb1JlbW92ZTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VsZi5fc3RhdGUua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYoc2VsZi5fc3RhdGUua2V5c1tpXS5rZXlDb2RlID09PSBlLmtleUNvZGUpIHtcbiAgICAgICAga2V5VG9SZW1vdmUgPSBzZWxmLl9zdGF0ZS5rZXlzW2ldO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihrZXlUb1JlbW92ZS5pc0FjdGl2ZSkge1xuICAgICAgLy8gcmVtb3ZlIHRoZSBrZXkgZnJvbSBfa2V5c1xuICAgICAgc2VsZi5fc3RhdGUua2V5cy5zcGxpY2Uoc2VsZi5fc3RhdGUua2V5cy5pbmRleE9mKGtleVRvUmVtb3ZlKSwgMSk7XG4gICAgICBzZWxmLl91cGRhdGUoKTtcbiAgICB9XG4gIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2lzUHJlc3NlZCA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKCFzZWxmLl9zdGF0ZS5rZXlzIHx8ICFzZWxmLl9zdGF0ZS5rZXlzLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzZWxmLl9zdGF0ZS5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYoc2VsZi5fc3RhdGUua2V5c1tpXS5rZXlDb2RlID09PSBrZXlDb2RlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLy8gdHVybiBhIGtleSBvYmplY3QgaW50byBhIG5vdGUgb2JqZWN0IGZvciB0aGUgZXZlbnQgbGlzdGVuZXJzLlxuQXVkaW9LZXlzLnByb3RvdHlwZS5fbWFrZU5vdGUgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcmV0dXJuIHtcbiAgICBrZXlDb2RlOiBrZXlDb2RlLFxuICAgIG5vdGU6IHNlbGYuX21hcChrZXlDb2RlKSxcbiAgICBmcmVxdWVuY3k6IHNlbGYuX3RvRnJlcXVlbmN5KCBzZWxmLl9tYXAoa2V5Q29kZSkgKVxuICB9O1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTk9URSBCVUZGRVJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gZXZlcnkgdGltZSBhIGNoYW5nZSBpcyBtYWRlIHRvIF9rZXlzIGR1ZSB0byBhIGtleSBvbiBvciBrZXkgb2ZmXG4vLyB3ZSBuZWVkIHRvIGNhbGwgYF91cGRhdGVgLiBJdCBjb21wYXJlcyB0aGUgYF9rZXlzYCBhcnJheSB0byB0aGVcbi8vIGBidWZmZXJgIGFycmF5LCB3aGljaCBpcyB0aGUgYXJyYXkgb2Ygbm90ZXMgdGhhdCBhcmUgcmVhbGx5XG4vLyBiZWluZyBwbGF5ZWQsIG1ha2VzIHRoZSBuZWNlc3NhcnkgY2hhbmdlcyB0byBgYnVmZmVyYCBhbmRcbi8vIHRyaWdnZXJzIGFueSBldmVudHMgdGhhdCBuZWVkIHRyaWdnZXJpbmcuXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYSBrZXkgaGFzIGJlZW4gYWRkZWQgdG8gc2VsZi5fc3RhdGUua2V5cy5cbiAgLy8gc3Rhc2ggdGhlIG9sZCBidWZmZXJcbiAgdmFyIG9sZEJ1ZmZlciA9IHNlbGYuX3N0YXRlLmJ1ZmZlcjtcbiAgLy8gc2V0IHRoZSBuZXcgcHJpb3JpdHkgaW4gc2VsZi5zdGF0ZS5fa2V5c1xuICBzZWxmLl9wcmlvcml0aXplKCk7XG4gIC8vIGNvbXBhcmUgdGhlIGJ1ZmZlcnMgYW5kIHRyaWdnZXIgZXZlbnRzIGJhc2VkIG9uXG4gIC8vIHRoZSBkaWZmZXJlbmNlcy5cbiAgc2VsZi5fZGlmZihvbGRCdWZmZXIpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZGlmZiA9IGZ1bmN0aW9uKG9sZEJ1ZmZlcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgaXQncyBub3QgaW4gdGhlIE9MRCBidWZmZXIsIGl0J3MgYSBub3RlIE9OLlxuICAvLyBpZiBpdCdzIG5vdCBpbiB0aGUgTkVXIGJ1ZmZlciwgaXQncyBhIG5vdGUgT0ZGLlxuXG4gIHZhciBvbGROb3RlcyA9IG9sZEJ1ZmZlci5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkua2V5Q29kZTtcbiAgfSk7XG5cbiAgdmFyIG5ld05vdGVzID0gc2VsZi5fc3RhdGUuYnVmZmVyLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGtleS5rZXlDb2RlO1xuICB9KTtcblxuICAvLyBjaGVjayBmb3Igb2xkIChyZW1vdmVkKSBub3Rlc1xuICB2YXIgbm90ZXNUb1JlbW92ZSA9IFtdO1xuICBvbGROb3Rlcy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihuZXdOb3Rlcy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICBub3Rlc1RvUmVtb3ZlLnB1c2goa2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGNoZWNrIGZvciBuZXcgbm90ZXNcbiAgdmFyIG5vdGVzVG9BZGQgPSBbXTtcbiAgbmV3Tm90ZXMuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYob2xkTm90ZXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgbm90ZXNUb0FkZC5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcblxuICBub3Rlc1RvQWRkLmZvckVhY2goIGZ1bmN0aW9uKGtleSkge1xuICAgIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBzZWxmLl9tYWtlTm90ZShrZXkpKTtcbiAgfSk7XG5cbiAgbm90ZXNUb1JlbW92ZS5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBzZWxmLl90cmlnZ2VyKCd1cCcsIHNlbGYuX21ha2VOb3RlKGtleSkpO1xuICB9KTtcbn07XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLl9wcmlvcml0aXplID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiBhbGwgdGhlIGtleXMgaGF2ZSBiZWVuIHR1cm5lZCBvZmYsIG5vIG5lZWRcbiAgLy8gdG8gZG8gYW55dGhpbmcgaGVyZS5cbiAgaWYoIXNlbGYuX3N0YXRlLmtleXMubGVuZ3RoKSB7XG4gICAgc2VsZi5fc3RhdGUuYnVmZmVyID0gW107XG4gICAgcmV0dXJuO1xuICB9XG5cblxuICBpZihzZWxmLl9zdGF0ZS5wb2x5cGhvbnkgPj0gc2VsZi5fc3RhdGUua2V5cy5sZW5ndGgpIHtcbiAgICAvLyBldmVyeSBub3RlIGlzIGFjdGl2ZVxuICAgIHNlbGYuX3N0YXRlLmtleXMgPSBzZWxmLl9zdGF0ZS5rZXlzLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgICBrZXkuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcblxuICAgIC8vIGkgdGhpbmsgdGhpcyBpcyB3aGVyZSB0aGUgYmVoYXZpb3JzIHdpbGwgYmUgcnVuP1xuXG4gICAgLy8gc2V0IGFsbCBrZXlzIHRvIGluYWN0aXZlLlxuICAgIHNlbGYuX3N0YXRlLmtleXMgPSBzZWxmLl9zdGF0ZS5rZXlzLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgICBrZXkuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfSk7XG4gICAgLy8gc2V0IHRoZSBsYXN0IGJ1bmNoIHRvIGFjdGl2ZSBiYXNlZCBvbiB0aGUgcG9seXBob255LlxuICAgIGZvcih2YXIgaSA9IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoIC0gc2VsZi5fc3RhdGUucG9seXBob255OyBpIDwgc2VsZi5fc3RhdGUua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgc2VsZi5fc3RhdGUua2V5c1tpXS5pc0FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHRha2UgdGhlIGlzQWN0aXZlIGtleXMgYW5kIHNldCB0aGUgbmV3IGJ1ZmZlci5cbiAgc2VsZi5fc3RhdGUuYnVmZmVyID0gW107XG5cbiAgc2VsZi5fc3RhdGUua2V5cy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihrZXkuaXNBY3RpdmUpIHtcbiAgICAgIHNlbGYuX3N0YXRlLmJ1ZmZlci5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBkb25lLlxufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=