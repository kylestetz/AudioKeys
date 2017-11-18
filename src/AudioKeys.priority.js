module.exports = {
  _prioritize: function() {
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
  },

  _last: function() {
    var self = this;
    // set the last bunch to active based on the polyphony.
    for(var i = self._state.keys.length - self._state.polyphony; i < self._state.keys.length; i++) {
      self._state.keys[i].isActive = true;
    }
  },

  _first: function() {
    var self = this;
    // set the last bunch to active based on the polyphony.
    for(var i = 0; i < self._state.polyphony; i++) {
      self._state.keys[i].isActive = true;
    }
  },

  _highest: function() {
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
  },

  _lowest: function() {
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
  },

};
