// ================================================================
// KEY BUFFER
// ================================================================

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

// ================================================================
// NOTE BUFFER
// ================================================================