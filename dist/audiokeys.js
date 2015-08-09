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
    rootNote: 60,
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
};
// _map returns the midi note for a given keyCode.
AudioKeys.prototype._map = function(keyCode) {
  return this._keyMap[this._state.rows][keyCode] + this._offset();
};

AudioKeys.prototype._offset = function() {
  return this._state.rootNote - this._keyMap[this._state.rows].root;
};

// _isNote determines whether a keyCode is a note or not.
AudioKeys.prototype._isNote = function(keyCode) {
  return !!this._keyMap[this._state.rows][keyCode];
};

// convert a midi note to a frequency. we assume here that _map has
// already been called (to account for a potential rootNote offset)
AudioKeys.prototype._toFrequency = function(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
};

// the object keys correspond to `rows`, so `_keyMap[rows]` should
// retrieve that particular mapping.
AudioKeys.prototype._keyMap = {
  1: {
    root: 60,
    // starting with the 'a' key
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
    root: 60,
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

    // remove the key from _keys
    self._state.keys.splice(self._state.keys.indexOf(keyToRemove), 1);
    self._update();
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

// clear any active notes
AudioKeys.prototype.clear = function() {
  var self = this;
  // trigger note off for the notes in the buffer before
  // removing them.
  self._state.buffer.forEach( function(key) {
    self._trigger('up', key);
  });
  self._state.keys = [];
  self._state.buffer = [];
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
    // set all keys to inactive.
    self._state.keys = self._state.keys.map( function(key) {
      key.isActive = false;
      return key;
    });

    self['_' + self._state.priority]();
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

AudioKeys.prototype._last = function() {
  var self = this;
  // set the last bunch to active based on the polyphony.
  for(var i = self._state.keys.length - self._state.polyphony; i < self._state.keys.length; i++) {
    self._state.keys[i].isActive = true;
  }
};

AudioKeys.prototype._first = function() {
  var self = this;
  // set the last bunch to active based on the polyphony.
  for(var i = 0; i < self._state.polyphony; i++) {
    self._state.keys[i].isActive = true;
  }
};

AudioKeys.prototype._highest = function() {
  var self = this;
  // get the highest notes and set them to active
  var notes = self._state.keys.map( function(key) {
    return key.note;
  });

  notes.sort( function(b,a) {
    if(a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  });

  notes.splice(self._state.polyphony, Number.MAX_VALUE);

  self._state.keys.forEach( function(key) {
    if(notes.indexOf(key.note) !== -1) {
      key.isActive = true;
    }
  });
};

AudioKeys.prototype._lowest = function() {
  var self = this;
  // get the lowest notes and set them to active
  var notes = self._state.keys.map( function(key) {
    return key.note;
  });

  notes.sort( function(a,b) {
    if(a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  });

  notes.splice(self._state.polyphony, Number.MAX_VALUE);

  self._state.keys.forEach( function(key) {
    if(notes.indexOf(key.note) !== -1) {
      key.isActive = true;
    }
  });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiLCJBdWRpb0tleXMucHJpb3JpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImF1ZGlva2V5cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEF1ZGlvS2V5cyhvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLl9zZXRTdGF0ZShvcHRpb25zKTtcblxuICAvLyBhbGwgbGlzdGVuZXJzIGFyZSBzdG9yZWQgaW4gYXJyYXlzIGluIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydGllcy5cbiAgLy8gZS5nLiBzZWxmLl9saXN0ZW5lcnMuZG93biA9IFtmbjEsIGZuMiwgLi4uIF1cbiAgc2VsZi5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gYmluZCBET00gZXZlbnRzXG4gIHNlbGYuX2JpbmQoKTtcbn1cblxuLy8gUGxheSB3ZWxsIHdpdGggcmVxdWlyZSBzbyB0aGF0IHdlIGNhbiBydW4gYSB0ZXN0IHN1aXRlIGFuZCB1c2UgYnJvd3NlcmlmeS5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gQXVkaW9LZXlzO1xufVxuIiwiQXVkaW9LZXlzLnByb3RvdHlwZS5fc2V0U3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIC8vIHRoZSBzdGF0ZSBpcyBrZXB0IGluIHRoaXMgb2JqZWN0XG4gIHNlbGYuX3N0YXRlID0ge307XG5cbiAgLy8gc2V0IHNvbWUgZGVmYXVsdHMgLi4uXG4gIHNlbGYuX2V4dGVuZFN0YXRlKHtcbiAgICBwb2x5cGhvbnk6IDQsXG4gICAgcm93czogMSxcbiAgICBvY3RhdmVzOiB0cnVlLFxuICAgIHByaW9yaXR5OiAnbGFzdCcsXG4gICAgcm9vdE5vdGU6IDYwLFxuICAgIGtleXM6IFtdLFxuICAgIGJ1ZmZlcjogW11cbiAgfSk7XG5cbiAgLy8gLi4uIGFuZCBvdmVycmlkZSB0aGVtIHdpdGggb3B0aW9ucy5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUob3B0aW9ucyk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9leHRlbmRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGZvcih2YXIgbyBpbiBvcHRpb25zKSB7XG4gICAgc2VsZi5fc3RhdGVbb10gPSBvcHRpb25zW29dO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKC8qIG9wdGlvbnMgfHwgcHJvcGVydHksIHZhbHVlICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZi5fZXh0ZW5kU3RhdGUoYXJndW1lbnRzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zdGF0ZVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gc2VsZi5fc3RhdGVbcHJvcGVydHldO1xufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IExpc3RlbmVyc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBBdWRpb0tleXMgaGFzIGEgdmVyeSBzaW1wbGUgZXZlbnQgaGFuZGxpbmcgc3lzdGVtLiBJbnRlcm5hbGx5XG4vLyB3ZSdsbCBjYWxsIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBhcmd1bWVudCkgd2hlbiB3ZSB3YW50IHRvIGZpcmVcbi8vIGFuIGV2ZW50IGZvciB0aGUgdXNlci5cblxuQXVkaW9LZXlzLnByb3RvdHlwZS5kb3duID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy5kb3duID0gKHNlbGYuX2xpc3RlbmVycy5kb3duIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS51cCA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMudXAgPSAoc2VsZi5fbGlzdGVuZXJzLnVwIHx8IFtdKS5jb25jYXQoZm4pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fdHJpZ2dlciA9IGZ1bmN0aW9uKGFjdGlvbiAvKiBhcmdzICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiB3ZSBoYXZlIGFueSBsaXN0ZW5lcnMgYnkgdGhpcyBuYW1lIC4uLlxuICBpZihzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXSAmJiBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5sZW5ndGgpIHtcbiAgICAvLyBncmFiIHRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbGlzdGVuZXJzIC4uLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICBhcmdzLnNwbGljZSgwLCAxKTtcbiAgICAvLyBhbmQgY2FsbCB0aGVtIVxuICAgIHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dLmZvckVhY2goIGZ1bmN0aW9uKGZuKSB7XG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRE9NIEJpbmRpbmdzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2JpbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5fYWRkS2V5KGUpO1xuICAgIH0pO1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX3JlbW92ZUtleShlKTtcbiAgICB9KTtcblxuICAgIHZhciBsYXN0Rm9jdXMgPSB0cnVlO1xuICAgIHNldEludGVydmFsKCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHdpbmRvdy5kb2N1bWVudC5oYXNGb2N1cygpID09PSBsYXN0Rm9jdXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbGFzdEZvY3VzID0gIWxhc3RGb2N1cztcbiAgICAgIGlmKCFsYXN0Rm9jdXMpIHtcbiAgICAgICAgc2VsZi5jbGVhcigpO1xuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cbn07IiwiLy8gX21hcCByZXR1cm5zIHRoZSBtaWRpIG5vdGUgZm9yIGEgZ2l2ZW4ga2V5Q29kZS5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX21hcCA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgcmV0dXJuIHRoaXMuX2tleU1hcFt0aGlzLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXSArIHRoaXMuX29mZnNldCgpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fb2Zmc2V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9zdGF0ZS5yb290Tm90ZSAtIHRoaXMuX2tleU1hcFt0aGlzLl9zdGF0ZS5yb3dzXS5yb290O1xufTtcblxuLy8gX2lzTm90ZSBkZXRlcm1pbmVzIHdoZXRoZXIgYSBrZXlDb2RlIGlzIGEgbm90ZSBvciBub3QuXG5BdWRpb0tleXMucHJvdG90eXBlLl9pc05vdGUgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHJldHVybiAhIXRoaXMuX2tleU1hcFt0aGlzLl9zdGF0ZS5yb3dzXVtrZXlDb2RlXTtcbn07XG5cbi8vIGNvbnZlcnQgYSBtaWRpIG5vdGUgdG8gYSBmcmVxdWVuY3kuIHdlIGFzc3VtZSBoZXJlIHRoYXQgX21hcCBoYXNcbi8vIGFscmVhZHkgYmVlbiBjYWxsZWQgKHRvIGFjY291bnQgZm9yIGEgcG90ZW50aWFsIHJvb3ROb3RlIG9mZnNldClcbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RvRnJlcXVlbmN5ID0gZnVuY3Rpb24obm90ZSkge1xuICByZXR1cm4gKCBNYXRoLnBvdygyLCAoIG5vdGUtNjkgKSAvIDEyKSApICogNDQwLjA7XG59O1xuXG4vLyB0aGUgb2JqZWN0IGtleXMgY29ycmVzcG9uZCB0byBgcm93c2AsIHNvIGBfa2V5TWFwW3Jvd3NdYCBzaG91bGRcbi8vIHJldHJpZXZlIHRoYXQgcGFydGljdWxhciBtYXBwaW5nLlxuQXVkaW9LZXlzLnByb3RvdHlwZS5fa2V5TWFwID0ge1xuICAxOiB7XG4gICAgcm9vdDogNjAsXG4gICAgLy8gc3RhcnRpbmcgd2l0aCB0aGUgJ2EnIGtleVxuICAgIDY1OiAgNjAsXG4gICAgODc6ICA2MSxcbiAgICA4MzogIDYyLFxuICAgIDY5OiAgNjMsXG4gICAgNjg6ICA2NCxcbiAgICA3MDogIDY1LFxuICAgIDg0OiAgNjYsXG4gICAgNzE6ICA2NyxcbiAgICA4OTogIDY4LFxuICAgIDcyOiAgNjksXG4gICAgODU6ICA3MCxcbiAgICA3NDogIDcxLFxuICAgIDc1OiAgNzIsXG4gICAgNzk6ICA3MyxcbiAgICA3NjogIDc0LFxuICAgIDgwOiAgNzUsXG4gICAgMTg2OiA3NixcbiAgICAyMjI6IDc3XG4gIH0sXG4gIDI6IHtcbiAgICByb290OiA2MCxcbiAgICAvLyBib3R0b20gcm93XG4gICAgOTA6ICA2MCxcbiAgICA4MzogIDYxLFxuICAgIDg4OiAgNjIsXG4gICAgNjg6ICA2MyxcbiAgICA2NzogIDY0LFxuICAgIDg2OiAgNjUsXG4gICAgNzE6ICA2NixcbiAgICA2NjogIDY3LFxuICAgIDcyOiAgNjgsXG4gICAgNzg6ICA2OSxcbiAgICA3NDogIDcwLFxuICAgIDc3OiAgNzEsXG4gICAgMTg4OiA3MixcbiAgICA3NjogIDczLFxuICAgIDE5MDogNzQsXG4gICAgMTg2OiA3NSxcbiAgICAxOTE6IDc2LFxuICAgIC8vIHRvcCByb3dcbiAgICA4MTogIDc3LFxuICAgIDUwOiAgNzgsXG4gICAgODc6ICA3OSxcbiAgICA1MTogIDgwLFxuICAgIDY5OiAgODEsXG4gICAgODI6ICA4MixcbiAgICA1MzogIDgzLFxuICAgIDg0OiAgODQsXG4gICAgNTQ6ICA4NSxcbiAgICA4OTogIDg2LFxuICAgIDU1OiAgODcsXG4gICAgODU6ICA4OCxcbiAgICA3MzogIDg5LFxuICAgIDU3OiAgOTAsXG4gICAgNzk6ICA5MSxcbiAgICA0ODogIDkyLFxuICAgIDgwOiAgOTMsXG4gICAgMjE5OiA5NCxcbiAgICAxODc6IDk1LFxuICAgIDIyMTogOTZcbiAgfVxufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEtFWSBCVUZGRVJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gVGhlIHByb2Nlc3MgaXM6XG5cbi8vIGtleSBwcmVzc1xuLy8gICBhZGQgdG8gc2VsZi5fc3RhdGUua2V5c1xuLy8gICAoYW4gYWNjdXJhdGUgcmVwcmVzZW50YXRpb24gb2Yga2V5cyBjdXJyZW50bHkgcHJlc3NlZClcbi8vIHJlc29sdmUgc2VsZi5idWZmZXJcbi8vICAgYmFzZWQgb24gcG9seXBob255IGFuZCBwcmlvcml0eSwgZGV0ZXJtaW5lIHRoZSBub3Rlc1xuLy8gICB0aGF0IGdldCB0cmlnZ2VyZWQgZm9yIHRoZSB1c2VyXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2FkZEtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBpZiB0aGUga2V5Q29kZSBpcyBvbmUgdGhhdCBjYW4gYmUgbWFwcGVkIGFuZCBpc24ndFxuICAvLyBhbHJlYWR5IHByZXNzZWQsIGFkZCBpdCB0byB0aGUga2V5IG9iamVjdC5cbiAgaWYoc2VsZi5faXNOb3RlKGUua2V5Q29kZSkgJiYgIXNlbGYuX2lzUHJlc3NlZChlLmtleUNvZGUpKSB7XG4gICAgdmFyIG5ld0tleSA9IHNlbGYuX21ha2VOb3RlKGUua2V5Q29kZSk7XG4gICAgLy8gYWRkIHRoZSBuZXdLZXkgdG8gdGhlIGxpc3Qgb2Yga2V5c1xuICAgIHNlbGYuX3N0YXRlLmtleXMgPSAoc2VsZi5fc3RhdGUua2V5cyB8fCBbXSkuY29uY2F0KG5ld0tleSk7XG4gICAgLy8gcmVldmFsdWF0ZSB0aGUgYWN0aXZlIG5vdGVzIGJhc2VkIG9uIG91ciBwcmlvcml0eSBydWxlcy5cbiAgICAvLyBnaXZlIGl0IHRoZSBuZXcgbm90ZSB0byB1c2UgaWYgdGhlcmUgaXMgYW4gZXZlbnQgdG8gdHJpZ2dlci5cbiAgICBzZWxmLl91cGRhdGUoKTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fcmVtb3ZlS2V5ID0gZnVuY3Rpb24oZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIGlmIHRoZSBrZXlDb2RlIGlzIGFjdGl2ZSwgcmVtb3ZlIGl0IGZyb20gdGhlIGtleSBvYmplY3QuXG4gIGlmKHNlbGYuX2lzUHJlc3NlZChlLmtleUNvZGUpKSB7XG4gICAgdmFyIGtleVRvUmVtb3ZlO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWxmLl9zdGF0ZS5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZihzZWxmLl9zdGF0ZS5rZXlzW2ldLmtleUNvZGUgPT09IGUua2V5Q29kZSkge1xuICAgICAgICBrZXlUb1JlbW92ZSA9IHNlbGYuX3N0YXRlLmtleXNbaV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlbW92ZSB0aGUga2V5IGZyb20gX2tleXNcbiAgICBzZWxmLl9zdGF0ZS5rZXlzLnNwbGljZShzZWxmLl9zdGF0ZS5rZXlzLmluZGV4T2Yoa2V5VG9SZW1vdmUpLCAxKTtcbiAgICBzZWxmLl91cGRhdGUoKTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5faXNQcmVzc2VkID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYoIXNlbGYuX3N0YXRlLmtleXMgfHwgIXNlbGYuX3N0YXRlLmtleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yKHZhciBpID0gMDsgaSA8IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZihzZWxmLl9zdGF0ZS5rZXlzW2ldLmtleUNvZGUgPT09IGtleUNvZGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyB0dXJuIGEga2V5IG9iamVjdCBpbnRvIGEgbm90ZSBvYmplY3QgZm9yIHRoZSBldmVudCBsaXN0ZW5lcnMuXG5BdWRpb0tleXMucHJvdG90eXBlLl9tYWtlTm90ZSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXR1cm4ge1xuICAgIGtleUNvZGU6IGtleUNvZGUsXG4gICAgbm90ZTogc2VsZi5fbWFwKGtleUNvZGUpLFxuICAgIGZyZXF1ZW5jeTogc2VsZi5fdG9GcmVxdWVuY3koIHNlbGYuX21hcChrZXlDb2RlKSApXG4gIH07XG59O1xuXG4vLyBjbGVhciBhbnkgYWN0aXZlIG5vdGVzXG5BdWRpb0tleXMucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gdHJpZ2dlciBub3RlIG9mZiBmb3IgdGhlIG5vdGVzIGluIHRoZSBidWZmZXIgYmVmb3JlXG4gIC8vIHJlbW92aW5nIHRoZW0uXG4gIHNlbGYuX3N0YXRlLmJ1ZmZlci5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBzZWxmLl90cmlnZ2VyKCd1cCcsIGtleSk7XG4gIH0pO1xuICBzZWxmLl9zdGF0ZS5rZXlzID0gW107XG4gIHNlbGYuX3N0YXRlLmJ1ZmZlciA9IFtdO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTk9URSBCVUZGRVJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gZXZlcnkgdGltZSBhIGNoYW5nZSBpcyBtYWRlIHRvIF9rZXlzIGR1ZSB0byBhIGtleSBvbiBvciBrZXkgb2ZmXG4vLyB3ZSBuZWVkIHRvIGNhbGwgYF91cGRhdGVgLiBJdCBjb21wYXJlcyB0aGUgYF9rZXlzYCBhcnJheSB0byB0aGVcbi8vIGBidWZmZXJgIGFycmF5LCB3aGljaCBpcyB0aGUgYXJyYXkgb2Ygbm90ZXMgdGhhdCBhcmUgcmVhbGx5XG4vLyBiZWluZyBwbGF5ZWQsIG1ha2VzIHRoZSBuZWNlc3NhcnkgY2hhbmdlcyB0byBgYnVmZmVyYCBhbmRcbi8vIHRyaWdnZXJzIGFueSBldmVudHMgdGhhdCBuZWVkIHRyaWdnZXJpbmcuXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYSBrZXkgaGFzIGJlZW4gYWRkZWQgdG8gc2VsZi5fc3RhdGUua2V5cy5cbiAgLy8gc3Rhc2ggdGhlIG9sZCBidWZmZXJcbiAgdmFyIG9sZEJ1ZmZlciA9IHNlbGYuX3N0YXRlLmJ1ZmZlcjtcbiAgLy8gc2V0IHRoZSBuZXcgcHJpb3JpdHkgaW4gc2VsZi5zdGF0ZS5fa2V5c1xuICBzZWxmLl9wcmlvcml0aXplKCk7XG4gIC8vIGNvbXBhcmUgdGhlIGJ1ZmZlcnMgYW5kIHRyaWdnZXIgZXZlbnRzIGJhc2VkIG9uXG4gIC8vIHRoZSBkaWZmZXJlbmNlcy5cbiAgc2VsZi5fZGlmZihvbGRCdWZmZXIpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZGlmZiA9IGZ1bmN0aW9uKG9sZEJ1ZmZlcikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgaXQncyBub3QgaW4gdGhlIE9MRCBidWZmZXIsIGl0J3MgYSBub3RlIE9OLlxuICAvLyBpZiBpdCdzIG5vdCBpbiB0aGUgTkVXIGJ1ZmZlciwgaXQncyBhIG5vdGUgT0ZGLlxuXG4gIHZhciBvbGROb3RlcyA9IG9sZEJ1ZmZlci5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkua2V5Q29kZTtcbiAgfSk7XG5cbiAgdmFyIG5ld05vdGVzID0gc2VsZi5fc3RhdGUuYnVmZmVyLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGtleS5rZXlDb2RlO1xuICB9KTtcblxuICAvLyBjaGVjayBmb3Igb2xkIChyZW1vdmVkKSBub3Rlc1xuICB2YXIgbm90ZXNUb1JlbW92ZSA9IFtdO1xuICBvbGROb3Rlcy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihuZXdOb3Rlcy5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICBub3Rlc1RvUmVtb3ZlLnB1c2goa2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGNoZWNrIGZvciBuZXcgbm90ZXNcbiAgdmFyIG5vdGVzVG9BZGQgPSBbXTtcbiAgbmV3Tm90ZXMuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYob2xkTm90ZXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgbm90ZXNUb0FkZC5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcblxuICBub3Rlc1RvQWRkLmZvckVhY2goIGZ1bmN0aW9uKGtleSkge1xuICAgIHNlbGYuX3RyaWdnZXIoJ2Rvd24nLCBzZWxmLl9tYWtlTm90ZShrZXkpKTtcbiAgfSk7XG5cbiAgbm90ZXNUb1JlbW92ZS5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBzZWxmLl90cmlnZ2VyKCd1cCcsIHNlbGYuX21ha2VOb3RlKGtleSkpO1xuICB9KTtcbn07XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLl9wcmlvcml0aXplID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBpZiBhbGwgdGhlIGtleXMgaGF2ZSBiZWVuIHR1cm5lZCBvZmYsIG5vIG5lZWRcbiAgLy8gdG8gZG8gYW55dGhpbmcgaGVyZS5cbiAgaWYoIXNlbGYuX3N0YXRlLmtleXMubGVuZ3RoKSB7XG4gICAgc2VsZi5fc3RhdGUuYnVmZmVyID0gW107XG4gICAgcmV0dXJuO1xuICB9XG5cblxuICBpZihzZWxmLl9zdGF0ZS5wb2x5cGhvbnkgPj0gc2VsZi5fc3RhdGUua2V5cy5sZW5ndGgpIHtcbiAgICAvLyBldmVyeSBub3RlIGlzIGFjdGl2ZVxuICAgIHNlbGYuX3N0YXRlLmtleXMgPSBzZWxmLl9zdGF0ZS5rZXlzLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgICBrZXkuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBzZXQgYWxsIGtleXMgdG8gaW5hY3RpdmUuXG4gICAgc2VsZi5fc3RhdGUua2V5cyA9IHNlbGYuX3N0YXRlLmtleXMubWFwKCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGtleS5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcblxuICAgIHNlbGZbJ18nICsgc2VsZi5fc3RhdGUucHJpb3JpdHldKCk7XG4gIH1cblxuICAvLyBub3cgdGFrZSB0aGUgaXNBY3RpdmUga2V5cyBhbmQgc2V0IHRoZSBuZXcgYnVmZmVyLlxuICBzZWxmLl9zdGF0ZS5idWZmZXIgPSBbXTtcblxuICBzZWxmLl9zdGF0ZS5rZXlzLmZvckVhY2goIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKGtleS5pc0FjdGl2ZSkge1xuICAgICAgc2VsZi5fc3RhdGUuYnVmZmVyLnB1c2goa2V5KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGRvbmUuXG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9sYXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gc2V0IHRoZSBsYXN0IGJ1bmNoIHRvIGFjdGl2ZSBiYXNlZCBvbiB0aGUgcG9seXBob255LlxuICBmb3IodmFyIGkgPSBzZWxmLl9zdGF0ZS5rZXlzLmxlbmd0aCAtIHNlbGYuX3N0YXRlLnBvbHlwaG9ueTsgaSA8IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBzZWxmLl9zdGF0ZS5rZXlzW2ldLmlzQWN0aXZlID0gdHJ1ZTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZmlyc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBzZXQgdGhlIGxhc3QgYnVuY2ggdG8gYWN0aXZlIGJhc2VkIG9uIHRoZSBwb2x5cGhvbnkuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzZWxmLl9zdGF0ZS5wb2x5cGhvbnk7IGkrKykge1xuICAgIHNlbGYuX3N0YXRlLmtleXNbaV0uaXNBY3RpdmUgPSB0cnVlO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9oaWdoZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gZ2V0IHRoZSBoaWdoZXN0IG5vdGVzIGFuZCBzZXQgdGhlbSB0byBhY3RpdmVcbiAgdmFyIG5vdGVzID0gc2VsZi5fc3RhdGUua2V5cy5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkubm90ZTtcbiAgfSk7XG5cbiAgbm90ZXMuc29ydCggZnVuY3Rpb24oYixhKSB7XG4gICAgaWYoYSA9PT0gYikge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfSk7XG5cbiAgbm90ZXMuc3BsaWNlKHNlbGYuX3N0YXRlLnBvbHlwaG9ueSwgTnVtYmVyLk1BWF9WQUxVRSk7XG5cbiAgc2VsZi5fc3RhdGUua2V5cy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihub3Rlcy5pbmRleE9mKGtleS5ub3RlKSAhPT0gLTEpIHtcbiAgICAgIGtleS5pc0FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2xvd2VzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIGdldCB0aGUgbG93ZXN0IG5vdGVzIGFuZCBzZXQgdGhlbSB0byBhY3RpdmVcbiAgdmFyIG5vdGVzID0gc2VsZi5fc3RhdGUua2V5cy5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkubm90ZTtcbiAgfSk7XG5cbiAgbm90ZXMuc29ydCggZnVuY3Rpb24oYSxiKSB7XG4gICAgaWYoYSA9PT0gYikge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfSk7XG5cbiAgbm90ZXMuc3BsaWNlKHNlbGYuX3N0YXRlLnBvbHlwaG9ueSwgTnVtYmVyLk1BWF9WQUxVRSk7XG5cbiAgc2VsZi5fc3RhdGUua2V5cy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihub3Rlcy5pbmRleE9mKGtleS5ub3RlKSAhPT0gLTEpIHtcbiAgICAgIGtleS5pc0FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=