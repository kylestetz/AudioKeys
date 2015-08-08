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