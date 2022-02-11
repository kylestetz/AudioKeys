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

module.exports = {
  _addKey: function(e) {
    const identifier = this._getIdentifier(e);

    var self = this;
    // if the code is one that can be mapped and isn't
    // already pressed, add it to the key object.
    if(self._isNote(identifier) && !self._isPressed(identifier)) {
      var newKey = self._makeNote(identifier);
      // add the newKey to the list of keys
      self._state.keys = (self._state.keys || []).concat(newKey);
      // reevaluate the active notes based on our priority rules.
      // give it the new note to use if there is an event to trigger.
      self._update();
    } else if(self._isSpecialKey(identifier)) {
      self._specialKey(identifier);
    }
  },

  _removeKey: function(e) {
    const identifier = this._getIdentifier(e);

    var self = this;
    // if the code is active, remove it from the key object.
    if(self._isPressed(identifier)) {
      var keyToRemove;
      for (var i = 0; i < self._state.keys.length; i++) {
        const other = self._getIdentifier(self._state.keys[i]);
        if(other === identifier) {
          keyToRemove = self._state.keys[i];
          break;
        }
      }

      // remove the key from _keys
      self._state.keys.splice(self._state.keys.indexOf(keyToRemove), 1);
      self._update();
    }
  },

  _isPressed: function(code) {
    var self = this;

    if(!self._state.keys || !self._state.keys.length) {
      return false;
    }

    for (var i = 0; i < self._state.keys.length; i++) {
      const other = self._getIdentifier(self._state.keys[i]);
      if(other === code) {
        return true;
      }
    }
    return false;
  },

  // turn a key object into a note object for the event listeners.
  _makeNote: function(code) {
    var self = this;
    const note = {
      note: self._map(code),
      frequency: self._toFrequency(self._map(code)),
      velocity: self._state.velocity,
    };
    const identifier = self._state.layoutIndependentMapping ? 'code' : 'keyCode';
    note[identifier] = code;
    return note;
  },

  // clear any active notes
  clear: function() {
    var self = this;
    // trigger note off for the notes in the buffer before
    // removing them.
    self._state.buffer.forEach( function(key) {
      // note up events should have a velocity of 0
      key.velocity = 0;
      self._trigger('up', key);
    });
    self._state.keys = [];
    self._state.buffer = [];
  },

  // ================================================================
  // NOTE BUFFER
  // ================================================================

  // every time a change is made to _keys due to a key on or key off
  // we need to call `_update`. It compares the `_keys` array to the
  // `buffer` array, which is the array of notes that are really
  // being played, makes the necessary changes to `buffer` and
  // triggers any events that need triggering.

  _update: function() {
    var self = this;

    // a key has been added to self._state.keys.
    // stash the old buffer
    var oldBuffer = self._state.buffer;
    // set the new priority in self.state._keys
    self._prioritize();
    // compare the buffers and trigger events based on
    // the differences.
    self._diff(oldBuffer);
  },

  _diff: function(oldBuffer) {
    var self = this;

    // if it's not in the OLD buffer, it's a note ON.
    // if it's not in the NEW buffer, it's a note OFF.

    var oldNotes = oldBuffer.map(self._getIdentifier.bind(self));

    var newNotes = self._state.buffer.map(self._getIdentifier.bind(self));

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
      for(var i = 0; i < self._state.buffer.length; i++) {
        const other = self._getIdentifier(self._state.buffer[i]);
        if(other === key) {
          self._trigger('down', self._state.buffer[i]);
          break;
        }
      }
    });

    notesToRemove.forEach(function(key) {
      // these need to fire the entire object
      for(var i = 0; i < oldBuffer.length; i++) {
        const other = self._getIdentifier(oldBuffer[i]);
        if(other === key) {
          // note up events should have a velocity of 0
          oldBuffer[i].velocity = 0;
          self._trigger('up', oldBuffer[i]);
          break;
        }
      }
    });
  },

};

