function AudioKeys(options) {
  var self = this;

  if(!options) {
    options = {};
  }

  // the state is kept in this object
  self._state           = {};
  self._state.polyphony = options.polyphony || 4;
  self._state.rows      = options.rows      || 1;
  self._state.octaves   = options.octaves   || true;
  self._state.behavior  = options.behavior  || 'last';

  // all listeners are stored in arrays in their respective properties.
  // e.g. self._listeners.down = [fn1, fn2, ... ]
  self._listeners = {};

  // bind events
  // self.bind();
}

// Play well with require so that we can run a test suite and use browserify.
if(module) {
  module.exports = AudioKeys;
}
