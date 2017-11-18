// This file maps special keys to the state— octave shifting and
// velocity selection, both available when `rows` = 1.
module.exports = {
  _isSpecialKey: function(keyCode) {
    return (this._state.rows === 1 && this._specialKeyMap[keyCode]);
  },

  _specialKey: function(keyCode) {
    var self = this;
    if(self._specialKeyMap[keyCode].type === 'octave' && self._state.octaveControls) {
      // shift the state of the `octave`
      self._state.octave += self._specialKeyMap[keyCode].value;
    } else if(self._specialKeyMap[keyCode].type === 'velocity' && self._state.velocityControls) {
      // set the `velocity` to a new value
      self._state.velocity = self._specialKeyMap[keyCode].value;
    }
  },

  _specialKeyMap: {
    // octaves
    90: {
      type: 'octave',
      value: -1
    },
    88: {
      type: 'octave',
      value: 1
    },
    // velocity
    49: {
      type: 'velocity',
      value: 1
    },
    50: {
      type: 'velocity',
      value: 14
    },
    51: {
      type: 'velocity',
      value: 28
    },
    52: {
      type: 'velocity',
      value: 42
    },
    53: {
      type: 'velocity',
      value: 56
    },
    54: {
      type: 'velocity',
      value: 70
    },
    55: {
      type: 'velocity',
      value: 84
    },
    56: {
      type: 'velocity',
      value: 98
    },
    57: {
      type: 'velocity',
      value: 112
    },
    48: {
      type: 'velocity',
      value: 127
    },
  },

};
