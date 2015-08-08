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
    window.document.addEventListener('keydown', self._addKey);
    window.document.addEventListener('keyup', self._removeKey);
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
  // get the highest notes and set them to active
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiLCJBdWRpb0tleXMucHJpb3JpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhdWRpb2tleXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBBdWRpb0tleXMob3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5fc2V0U3RhdGUob3B0aW9ucyk7XG5cbiAgLy8gYWxsIGxpc3RlbmVycyBhcmUgc3RvcmVkIGluIGFycmF5cyBpbiB0aGVpciByZXNwZWN0aXZlIHByb3BlcnRpZXMuXG4gIC8vIGUuZy4gc2VsZi5fbGlzdGVuZXJzLmRvd24gPSBbZm4xLCBmbjIsIC4uLiBdXG4gIHNlbGYuX2xpc3RlbmVycyA9IHt9O1xuXG4gIC8vIGJpbmQgRE9NIGV2ZW50c1xuICBzZWxmLl9iaW5kKCk7XG59XG5cbi8vIFBsYXkgd2VsbCB3aXRoIHJlcXVpcmUgc28gdGhhdCB3ZSBjYW4gcnVuIGEgdGVzdCBzdWl0ZSBhbmQgdXNlIGJyb3dzZXJpZnkuXG5pZih0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IEF1ZGlvS2V5cztcbn1cbiIsIkF1ZGlvS2V5cy5wcm90b3R5cGUuX3NldFN0YXRlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICAvLyB0aGUgc3RhdGUgaXMga2VwdCBpbiB0aGlzIG9iamVjdFxuICBzZWxmLl9zdGF0ZSA9IHt9O1xuXG4gIC8vIHNldCBzb21lIGRlZmF1bHRzIC4uLlxuICBzZWxmLl9leHRlbmRTdGF0ZSh7XG4gICAgcG9seXBob255OiA0LFxuICAgIHJvd3M6IDEsXG4gICAgb2N0YXZlczogdHJ1ZSxcbiAgICBwcmlvcml0eTogJ2xhc3QnLFxuICAgIHJvb3ROb3RlOiA2MCxcbiAgICBrZXlzOiBbXSxcbiAgICBidWZmZXI6IFtdXG4gIH0pO1xuXG4gIC8vIC4uLiBhbmQgb3ZlcnJpZGUgdGhlbSB3aXRoIG9wdGlvbnMuXG4gIHNlbGYuX2V4dGVuZFN0YXRlKG9wdGlvbnMpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZXh0ZW5kU3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBmb3IodmFyIG8gaW4gb3B0aW9ucykge1xuICAgIHNlbGYuX3N0YXRlW29dID0gb3B0aW9uc1tvXTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbigvKiBvcHRpb25zIHx8IHByb3BlcnR5LCB2YWx1ZSAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHNlbGYuX2V4dGVuZFN0YXRlKGFyZ3VtZW50c1swXSk7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc3RhdGVbYXJndW1lbnRzWzBdXSA9IGFyZ3VtZW50c1sxXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgcmV0dXJuIHNlbGYuX3N0YXRlW3Byb3BlcnR5XTtcbn07XG4iLCIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBFdmVudCBMaXN0ZW5lcnNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gQXVkaW9LZXlzIGhhcyBhIHZlcnkgc2ltcGxlIGV2ZW50IGhhbmRsaW5nIHN5c3RlbS4gSW50ZXJuYWxseVxuLy8gd2UnbGwgY2FsbCBzZWxmLl90cmlnZ2VyKCdkb3duJywgYXJndW1lbnQpIHdoZW4gd2Ugd2FudCB0byBmaXJlXG4vLyBhbiBldmVudCBmb3IgdGhlIHVzZXIuXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMuZG93biA9IChzZWxmLl9saXN0ZW5lcnMuZG93biB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUudXAgPSBmdW5jdGlvbihmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byBvdXIgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgc2VsZi5fbGlzdGVuZXJzLnVwID0gKHNlbGYuX2xpc3RlbmVycy51cCB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RyaWdnZXIgPSBmdW5jdGlvbihhY3Rpb24gLyogYXJncyAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgd2UgaGF2ZSBhbnkgbGlzdGVuZXJzIGJ5IHRoaXMgbmFtZSAuLi5cbiAgaWYoc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0gJiYgc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0ubGVuZ3RoKSB7XG4gICAgLy8gZ3JhYiB0aGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGxpc3RlbmVycyAuLi5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgYXJncy5zcGxpY2UoMCwgMSk7XG4gICAgLy8gYW5kIGNhbGwgdGhlbSFcbiAgICBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5mb3JFYWNoKCBmdW5jdGlvbihmbikge1xuICAgICAgZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIERPTSBCaW5kaW5nc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5BdWRpb0tleXMucHJvdG90eXBlLl9iaW5kID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQpIHtcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2FkZEtleSk7XG4gICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc2VsZi5fcmVtb3ZlS2V5KTtcbiAgfVxufTsiLCIvLyBfbWFwIHJldHVybnMgdGhlIG1pZGkgbm90ZSBmb3IgYSBnaXZlbiBrZXlDb2RlLlxuQXVkaW9LZXlzLnByb3RvdHlwZS5fbWFwID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICByZXR1cm4gdGhpcy5fa2V5TWFwW3RoaXMuX3N0YXRlLnJvd3NdW2tleUNvZGVdICsgdGhpcy5fb2Zmc2V0KCk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9vZmZzZXQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3N0YXRlLnJvb3ROb3RlIC0gdGhpcy5fa2V5TWFwW3RoaXMuX3N0YXRlLnJvd3NdLnJvb3Q7XG59O1xuXG4vLyBfaXNOb3RlIGRldGVybWluZXMgd2hldGhlciBhIGtleUNvZGUgaXMgYSBub3RlIG9yIG5vdC5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2lzTm90ZSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgcmV0dXJuICEhdGhpcy5fa2V5TWFwW3RoaXMuX3N0YXRlLnJvd3NdW2tleUNvZGVdO1xufTtcblxuLy8gY29udmVydCBhIG1pZGkgbm90ZSB0byBhIGZyZXF1ZW5jeS4gd2UgYXNzdW1lIGhlcmUgdGhhdCBfbWFwIGhhc1xuLy8gYWxyZWFkeSBiZWVuIGNhbGxlZCAodG8gYWNjb3VudCBmb3IgYSBwb3RlbnRpYWwgcm9vdE5vdGUgb2Zmc2V0KVxuQXVkaW9LZXlzLnByb3RvdHlwZS5fdG9GcmVxdWVuY3kgPSBmdW5jdGlvbihub3RlKSB7XG4gIHJldHVybiAoIE1hdGgucG93KDIsICggbm90ZS02OSApIC8gMTIpICkgKiA0NDAuMDtcbn07XG5cbi8vIHRoZSBvYmplY3Qga2V5cyBjb3JyZXNwb25kIHRvIGByb3dzYCwgc28gYF9rZXlNYXBbcm93c11gIHNob3VsZFxuLy8gcmV0cmlldmUgdGhhdCBwYXJ0aWN1bGFyIG1hcHBpbmcuXG5BdWRpb0tleXMucHJvdG90eXBlLl9rZXlNYXAgPSB7XG4gIDE6IHtcbiAgICByb290OiA2MCxcbiAgICAvLyBzdGFydGluZyB3aXRoIHRoZSAnYScga2V5XG4gICAgNjU6ICA2MCxcbiAgICA4NzogIDYxLFxuICAgIDgzOiAgNjIsXG4gICAgNjk6ICA2MyxcbiAgICA2ODogIDY0LFxuICAgIDcwOiAgNjUsXG4gICAgODQ6ICA2NixcbiAgICA3MTogIDY3LFxuICAgIDg5OiAgNjgsXG4gICAgNzI6ICA2OSxcbiAgICA4NTogIDcwLFxuICAgIDc0OiAgNzEsXG4gICAgNzU6ICA3MixcbiAgICA3OTogIDczLFxuICAgIDc2OiAgNzQsXG4gICAgODA6ICA3NSxcbiAgICAxODY6IDc2LFxuICAgIDIyMjogNzdcbiAgfSxcbiAgMjoge1xuICAgIHJvb3Q6IDYwLFxuICAgIC8vIGJvdHRvbSByb3dcbiAgICA5MDogIDYwLFxuICAgIDgzOiAgNjEsXG4gICAgODg6ICA2MixcbiAgICA2ODogIDYzLFxuICAgIDY3OiAgNjQsXG4gICAgODY6ICA2NSxcbiAgICA3MTogIDY2LFxuICAgIDY2OiAgNjcsXG4gICAgNzI6ICA2OCxcbiAgICA3ODogIDY5LFxuICAgIDc0OiAgNzAsXG4gICAgNzc6ICA3MSxcbiAgICAxODg6IDcyLFxuICAgIDc2OiAgNzMsXG4gICAgMTkwOiA3NCxcbiAgICAxODY6IDc1LFxuICAgIDE5MTogNzYsXG4gICAgLy8gdG9wIHJvd1xuICAgIDgxOiAgNzcsXG4gICAgNTA6ICA3OCxcbiAgICA4NzogIDc5LFxuICAgIDUxOiAgODAsXG4gICAgNjk6ICA4MSxcbiAgICA4MjogIDgyLFxuICAgIDUzOiAgODMsXG4gICAgODQ6ICA4NCxcbiAgICA1NDogIDg1LFxuICAgIDg5OiAgODYsXG4gICAgNTU6ICA4NyxcbiAgICA4NTogIDg4LFxuICAgIDczOiAgODksXG4gICAgNTc6ICA5MCxcbiAgICA3OTogIDkxLFxuICAgIDQ4OiAgOTIsXG4gICAgODA6ICA5MyxcbiAgICAyMTk6IDk0LFxuICAgIDE4NzogOTUsXG4gICAgMjIxOiA5NlxuICB9XG59O1xuIiwiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gS0VZIEJVRkZFUlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBUaGUgcHJvY2VzcyBpczpcblxuLy8ga2V5IHByZXNzXG4vLyAgIGFkZCB0byBzZWxmLl9zdGF0ZS5rZXlzXG4vLyAgIChhbiBhY2N1cmF0ZSByZXByZXNlbnRhdGlvbiBvZiBrZXlzIGN1cnJlbnRseSBwcmVzc2VkKVxuLy8gcmVzb2x2ZSBzZWxmLmJ1ZmZlclxuLy8gICBiYXNlZCBvbiBwb2x5cGhvbnkgYW5kIHByaW9yaXR5LCBkZXRlcm1pbmUgdGhlIG5vdGVzXG4vLyAgIHRoYXQgZ2V0IHRyaWdnZXJlZCBmb3IgdGhlIHVzZXJcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fYWRkS2V5ID0gZnVuY3Rpb24oZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIGlmIHRoZSBrZXlDb2RlIGlzIG9uZSB0aGF0IGNhbiBiZSBtYXBwZWQgYW5kIGlzbid0XG4gIC8vIGFscmVhZHkgcHJlc3NlZCwgYWRkIGl0IHRvIHRoZSBrZXkgb2JqZWN0LlxuICBpZihzZWxmLl9pc05vdGUoZS5rZXlDb2RlKSAmJiAhc2VsZi5faXNQcmVzc2VkKGUua2V5Q29kZSkpIHtcbiAgICB2YXIgbmV3S2V5ID0gc2VsZi5fbWFrZU5vdGUoZS5rZXlDb2RlKTtcbiAgICAvLyBhZGQgdGhlIG5ld0tleSB0byB0aGUgbGlzdCBvZiBrZXlzXG4gICAgc2VsZi5fc3RhdGUua2V5cyA9IChzZWxmLl9zdGF0ZS5rZXlzIHx8IFtdKS5jb25jYXQobmV3S2V5KTtcbiAgICAvLyByZWV2YWx1YXRlIHRoZSBhY3RpdmUgbm90ZXMgYmFzZWQgb24gb3VyIHByaW9yaXR5IHJ1bGVzLlxuICAgIC8vIGdpdmUgaXQgdGhlIG5ldyBub3RlIHRvIHVzZSBpZiB0aGVyZSBpcyBhbiBldmVudCB0byB0cmlnZ2VyLlxuICAgIHNlbGYuX3VwZGF0ZSgpO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9yZW1vdmVLZXkgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gaWYgdGhlIGtleUNvZGUgaXMgYWN0aXZlLCByZW1vdmUgaXQgZnJvbSB0aGUga2V5IG9iamVjdC5cbiAgaWYoc2VsZi5faXNQcmVzc2VkKGUua2V5Q29kZSkpIHtcbiAgICB2YXIga2V5VG9SZW1vdmU7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHNlbGYuX3N0YXRlLmtleXNbaV0ua2V5Q29kZSA9PT0gZS5rZXlDb2RlKSB7XG4gICAgICAgIGtleVRvUmVtb3ZlID0gc2VsZi5fc3RhdGUua2V5c1tpXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoa2V5VG9SZW1vdmUuaXNBY3RpdmUpIHtcbiAgICAgIC8vIHJlbW92ZSB0aGUga2V5IGZyb20gX2tleXNcbiAgICAgIHNlbGYuX3N0YXRlLmtleXMuc3BsaWNlKHNlbGYuX3N0YXRlLmtleXMuaW5kZXhPZihrZXlUb1JlbW92ZSksIDEpO1xuICAgICAgc2VsZi5fdXBkYXRlKCk7XG4gICAgfVxuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9pc1ByZXNzZWQgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighc2VsZi5fc3RhdGUua2V5cyB8fCAhc2VsZi5fc3RhdGUua2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IodmFyIGkgPSAwOyBpIDwgc2VsZi5fc3RhdGUua2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHNlbGYuX3N0YXRlLmtleXNbaV0ua2V5Q29kZSA9PT0ga2V5Q29kZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIHR1cm4gYSBrZXkgb2JqZWN0IGludG8gYSBub3RlIG9iamVjdCBmb3IgdGhlIGV2ZW50IGxpc3RlbmVycy5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX21ha2VOb3RlID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiB7XG4gICAga2V5Q29kZToga2V5Q29kZSxcbiAgICBub3RlOiBzZWxmLl9tYXAoa2V5Q29kZSksXG4gICAgZnJlcXVlbmN5OiBzZWxmLl90b0ZyZXF1ZW5jeSggc2VsZi5fbWFwKGtleUNvZGUpIClcbiAgfTtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE5PVEUgQlVGRkVSXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIGV2ZXJ5IHRpbWUgYSBjaGFuZ2UgaXMgbWFkZSB0byBfa2V5cyBkdWUgdG8gYSBrZXkgb24gb3Iga2V5IG9mZlxuLy8gd2UgbmVlZCB0byBjYWxsIGBfdXBkYXRlYC4gSXQgY29tcGFyZXMgdGhlIGBfa2V5c2AgYXJyYXkgdG8gdGhlXG4vLyBgYnVmZmVyYCBhcnJheSwgd2hpY2ggaXMgdGhlIGFycmF5IG9mIG5vdGVzIHRoYXQgYXJlIHJlYWxseVxuLy8gYmVpbmcgcGxheWVkLCBtYWtlcyB0aGUgbmVjZXNzYXJ5IGNoYW5nZXMgdG8gYGJ1ZmZlcmAgYW5kXG4vLyB0cmlnZ2VycyBhbnkgZXZlbnRzIHRoYXQgbmVlZCB0cmlnZ2VyaW5nLlxuXG5BdWRpb0tleXMucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGEga2V5IGhhcyBiZWVuIGFkZGVkIHRvIHNlbGYuX3N0YXRlLmtleXMuXG4gIC8vIHN0YXNoIHRoZSBvbGQgYnVmZmVyXG4gIHZhciBvbGRCdWZmZXIgPSBzZWxmLl9zdGF0ZS5idWZmZXI7XG4gIC8vIHNldCB0aGUgbmV3IHByaW9yaXR5IGluIHNlbGYuc3RhdGUuX2tleXNcbiAgc2VsZi5fcHJpb3JpdGl6ZSgpO1xuICAvLyBjb21wYXJlIHRoZSBidWZmZXJzIGFuZCB0cmlnZ2VyIGV2ZW50cyBiYXNlZCBvblxuICAvLyB0aGUgZGlmZmVyZW5jZXMuXG4gIHNlbGYuX2RpZmYob2xkQnVmZmVyKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2RpZmYgPSBmdW5jdGlvbihvbGRCdWZmZXIpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGlmIGl0J3Mgbm90IGluIHRoZSBPTEQgYnVmZmVyLCBpdCdzIGEgbm90ZSBPTi5cbiAgLy8gaWYgaXQncyBub3QgaW4gdGhlIE5FVyBidWZmZXIsIGl0J3MgYSBub3RlIE9GRi5cblxuICB2YXIgb2xkTm90ZXMgPSBvbGRCdWZmZXIubWFwKCBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4ga2V5LmtleUNvZGU7XG4gIH0pO1xuXG4gIHZhciBuZXdOb3RlcyA9IHNlbGYuX3N0YXRlLmJ1ZmZlci5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkua2V5Q29kZTtcbiAgfSk7XG5cbiAgLy8gY2hlY2sgZm9yIG9sZCAocmVtb3ZlZCkgbm90ZXNcbiAgdmFyIG5vdGVzVG9SZW1vdmUgPSBbXTtcbiAgb2xkTm90ZXMuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYobmV3Tm90ZXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgbm90ZXNUb1JlbW92ZS5wdXNoKGtleSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBjaGVjayBmb3IgbmV3IG5vdGVzXG4gIHZhciBub3Rlc1RvQWRkID0gW107XG4gIG5ld05vdGVzLmZvckVhY2goIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKG9sZE5vdGVzLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgIG5vdGVzVG9BZGQucHVzaChrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgbm90ZXNUb0FkZC5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBzZWxmLl90cmlnZ2VyKCdkb3duJywgc2VsZi5fbWFrZU5vdGUoa2V5KSk7XG4gIH0pO1xuXG4gIG5vdGVzVG9SZW1vdmUuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG4gICAgc2VsZi5fdHJpZ2dlcigndXAnLCBzZWxmLl9tYWtlTm90ZShrZXkpKTtcbiAgfSk7XG59O1xuIiwiQXVkaW9LZXlzLnByb3RvdHlwZS5fcHJpb3JpdGl6ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgYWxsIHRoZSBrZXlzIGhhdmUgYmVlbiB0dXJuZWQgb2ZmLCBubyBuZWVkXG4gIC8vIHRvIGRvIGFueXRoaW5nIGhlcmUuXG4gIGlmKCFzZWxmLl9zdGF0ZS5rZXlzLmxlbmd0aCkge1xuICAgIHNlbGYuX3N0YXRlLmJ1ZmZlciA9IFtdO1xuICAgIHJldHVybjtcbiAgfVxuXG5cbiAgaWYoc2VsZi5fc3RhdGUucG9seXBob255ID49IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoKSB7XG4gICAgLy8gZXZlcnkgbm90ZSBpcyBhY3RpdmVcbiAgICBzZWxmLl9zdGF0ZS5rZXlzID0gc2VsZi5fc3RhdGUua2V5cy5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgICAga2V5LmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG5cbiAgICAvLyBpIHRoaW5rIHRoaXMgaXMgd2hlcmUgdGhlIGJlaGF2aW9ycyB3aWxsIGJlIHJ1bj9cblxuICAgIC8vIHNldCBhbGwga2V5cyB0byBpbmFjdGl2ZS5cbiAgICBzZWxmLl9zdGF0ZS5rZXlzID0gc2VsZi5fc3RhdGUua2V5cy5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgICAga2V5LmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH0pO1xuXG4gICAgc2VsZlsnXycgKyBzZWxmLl9zdGF0ZS5wcmlvcml0eV0oKTtcbiAgfVxuXG4gIC8vIG5vdyB0YWtlIHRoZSBpc0FjdGl2ZSBrZXlzIGFuZCBzZXQgdGhlIG5ldyBidWZmZXIuXG4gIHNlbGYuX3N0YXRlLmJ1ZmZlciA9IFtdO1xuXG4gIHNlbGYuX3N0YXRlLmtleXMuZm9yRWFjaCggZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYoa2V5LmlzQWN0aXZlKSB7XG4gICAgICBzZWxmLl9zdGF0ZS5idWZmZXIucHVzaChrZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gZG9uZS5cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2xhc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBzZXQgdGhlIGxhc3QgYnVuY2ggdG8gYWN0aXZlIGJhc2VkIG9uIHRoZSBwb2x5cGhvbnkuXG4gIGZvcih2YXIgaSA9IHNlbGYuX3N0YXRlLmtleXMubGVuZ3RoIC0gc2VsZi5fc3RhdGUucG9seXBob255OyBpIDwgc2VsZi5fc3RhdGUua2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHNlbGYuX3N0YXRlLmtleXNbaV0uaXNBY3RpdmUgPSB0cnVlO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9maXJzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIC8vIHNldCB0aGUgbGFzdCBidW5jaCB0byBhY3RpdmUgYmFzZWQgb24gdGhlIHBvbHlwaG9ueS5cbiAgZm9yKHZhciBpID0gMDsgaSA8IHNlbGYuX3N0YXRlLnBvbHlwaG9ueTsgaSsrKSB7XG4gICAgc2VsZi5fc3RhdGUua2V5c1tpXS5pc0FjdGl2ZSA9IHRydWU7XG4gIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2hpZ2hlc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBnZXQgdGhlIGhpZ2hlc3Qgbm90ZXMgYW5kIHNldCB0aGVtIHRvIGFjdGl2ZVxuICB2YXIgbm90ZXMgPSBzZWxmLl9zdGF0ZS5rZXlzLm1hcCggZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGtleS5ub3RlO1xuICB9KTtcblxuICBub3Rlcy5zb3J0KCBmdW5jdGlvbihiLGEpIHtcbiAgICBpZihhID09PSBiKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9KTtcblxuICBub3Rlcy5zcGxpY2Uoc2VsZi5fc3RhdGUucG9seXBob255LCBOdW1iZXIuTUFYX1ZBTFVFKTtcblxuICBzZWxmLl9zdGF0ZS5rZXlzLmZvckVhY2goIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKG5vdGVzLmluZGV4T2Yoa2V5Lm5vdGUpICE9PSAtMSkge1xuICAgICAga2V5LmlzQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fbG93ZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gZ2V0IHRoZSBoaWdoZXN0IG5vdGVzIGFuZCBzZXQgdGhlbSB0byBhY3RpdmVcbiAgdmFyIG5vdGVzID0gc2VsZi5fc3RhdGUua2V5cy5tYXAoIGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBrZXkubm90ZTtcbiAgfSk7XG5cbiAgbm90ZXMuc29ydCggZnVuY3Rpb24oYSxiKSB7XG4gICAgaWYoYSA9PT0gYikge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfSk7XG5cbiAgbm90ZXMuc3BsaWNlKHNlbGYuX3N0YXRlLnBvbHlwaG9ueSwgTnVtYmVyLk1BWF9WQUxVRSk7XG5cbiAgc2VsZi5fc3RhdGUua2V5cy5mb3JFYWNoKCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZihub3Rlcy5pbmRleE9mKGtleS5ub3RlKSAhPT0gLTEpIHtcbiAgICAgIGtleS5pc0FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=