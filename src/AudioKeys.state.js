module.exports = {
  _setState: function(options) {
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
      priority: 'last',
      rootNote: 60,
      octaveControls: true,
      octave: 0,
      velocityControls: true,
      velocity: 127,
      keys: [],
      buffer: []
    });

    // ... and override them with options.
    self._extendState(options);
  },

  _extendState: function(options) {
    var self = this;

    for(var o in options) {
      self._state[o] = options[o];
    }
  },

  set: function(/* options || property, value */) {
    var self = this;

    if(arguments.length === 1) {
      self._extendState(arguments[0]);
    } else {
      self._state[arguments[0]] = arguments[1];
    }

    return this;
  },

  get: function(property) {
    var self = this;

    return self._state[property];
  },

};
