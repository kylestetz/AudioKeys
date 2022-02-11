// This file maps special keys to the state— octave shifting and
// velocity selection, both available when `rows` = 1.
module.exports = {
  _isSpecialKey: function(code) {
    return this._state.rows === 1 && this._specialKeyMap[code];
  },

  _specialKey: function(code) {
    var self = this;
    if(
      self._specialKeyMap[code].type === 'octave' &&
      self._state.octaveControls
    ) {
      // shift the state of the `octave`
      self._state.octave += self._specialKeyMap[code].value;
    } else if(
      self._specialKeyMap[code].type === 'velocity' &&
      self._state.velocityControls
    ) {
      // set the `velocity` to a new value
      self._state.velocity = self._specialKeyMap[code].value;
    }
  },

  _getSpecialKeyMap: function(useLayoutIndependentMapping) {
    if (useLayoutIndependentMapping) {
      return {
        // octaves
        KeyZ: {
          type: 'octave',
          value: -1,
        },
        KeyX: {
          type: 'octave',
          value: 1,
        },
        // velocity
        Digit1: {
          type: 'velocity',
          value: 1,
        },
        Digit2: {
          type: 'velocity',
          value: 14,
        },
        Digit3: {
          type: 'velocity',
          value: 28,
        },
        Digit4: {
          type: 'velocity',
          value: 42,
        },
        Digit5: {
          type: 'velocity',
          value: 56,
        },
        Digit6: {
          type: 'velocity',
          value: 70,
        },
        Digit7: {
          type: 'velocity',
          value: 84,
        },
        Digit8: {
          type: 'velocity',
          value: 98,
        },
        Digit9: {
          type: 'velocity',
          value: 112,
        },
        Digit0: {
          type: 'velocity',
          value: 127,
        },
      }
    } else {
      return {
        // octaves
        90: {
          type: 'octave',
          value: -1,
        },
        88: {
          type: 'octave',
          value: 1,
        },
        // velocity
        49: {
          type: 'velocity',
          value: 1,
        },
        50: {
          type: 'velocity',
          value: 14,
        },
        51: {
          type: 'velocity',
          value: 28,
        },
        52: {
          type: 'velocity',
          value: 42,
        },
        53: {
          type: 'velocity',
          value: 56,
        },
        54: {
          type: 'velocity',
          value: 70,
        },
        55: {
          type: 'velocity',
          value: 84,
        },
        56: {
          type: 'velocity',
          value: 98,
        },
        57: {
          type: 'velocity',
          value: 112,
        },
        48: {
          type: 'velocity',
          value: 127,
        },
      }
    }
  },

};
