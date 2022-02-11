module.exports = {
    // _map returns the midi note for a given code.
    _map: function(code) {
      return this._keyMap[this._state.rows][code] + this._offset();
    },

    _offset: function() {
      return this._state.rootNote - this._keyMap[this._state.rows].root + (this._state.octave * 12);
    },

    // _isNote determines whether a code is a note or not.
    _isNote: function(code) {
      return !!this._keyMap[this._state.rows][code];
    },

    // convert a midi note to a frequency. we assume here that _map has
    // already been called (to account for a potential rootNote offset)
    _toFrequency: function(note) {
      return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
    },

    // retrieve appropriate key identifier from keyboard event
    _getIdentifier: function(e) {
      var self = this;
      return e[self._state.layoutIndependentMapping ? 'code' : 'keyCode'];
    },

    _getKeyMap: function(useLayoutIndependentMapping) {
      // the object keys correspond to `rows`, so `_keyMap[rows]` should
      // retrieve that particular mapping.
      if (useLayoutIndependentMapping) {
        return {
          1: {
            root: 60,
            // starting with the 'a' key
            KeyA: 60,
            KeyW: 61,
            KeyS: 62,
            KeyE: 63,
            KeyD: 64,
            KeyF: 65,
            KeyT: 66,
            KeyG: 67,
            KeyY: 68,
            KeyH: 69,
            KeyU: 70,
            KeyJ: 71,
            KeyK: 72,
            KeyO: 73,
            KeyL: 74,
            KeyP: 75,
            SemiColon: 76,
            Quote: 77,
          },
          2: {
            root: 60,
            // bottom row
            KeyZ: 60,
            KeyS: 61,
            KeyX: 62,
            KeyD: 63,
            KeyC: 64,
            KeyV: 65,
            KeyG: 66,
            KeyB: 67,
            KeyH: 68,
            KeyN: 69,
            KeyJ: 70,
            KeyM: 71,
            Comma: 72,
            KeyL: 73,
            Period: 74,
            SemiColon: 75,
            Slash: 76,
            // top row
            KeyQ: 72,
            Digit2: 73,
            KeyW: 74,
            Digit3: 75,
            KeyE: 76,
            KeyR: 77,
            Digit5: 78,
            KeyT: 79,
            Digit6: 80,
            KeyY: 81,
            Digit7: 82,
            KeyU: 83,
            KeyI: 84,
            Digit9: 85,
            KeyO: 86,
            Digit0: 87,
            KeyP: 88,
            BracketLeft: 89,
            Equal: 90,
            BracketRight: 91,
          }
        }
      } else {
        return {
          1: {
            root: 60,
            // starting with the 'a' key
            65: 60,
            87: 61,
            83: 62,
            69: 63,
            68: 64,
            70: 65,
            84: 66,
            71: 67,
            89: 68,
            72: 69,
            85: 70,
            74: 71,
            75: 72,
            79: 73,
            76: 74,
            80: 75,
            186: 76,
            222: 77,
          },
          2: {
            root: 60,
            // bottom row
            90: 60,
            83: 61,
            88: 62,
            68: 63,
            67: 64,
            86: 65,
            71: 66,
            66: 67,
            72: 68,
            78: 69,
            74: 70,
            77: 71,
            188: 72,
            76: 73,
            190: 74,
            186: 75,
            191: 76,
            // top row
            81: 72,
            50: 73,
            87: 74,
            51: 75,
            69: 76,
            82: 77,
            53: 78,
            84: 79,
            54: 80,
            89: 81,
            55: 82,
            85: 83,
            73: 84,
            57: 85,
            79: 86,
            48: 87,
            80: 88,
            219: 89,
            187: 90,
            221: 91,
          },
        }
      }
    }
};
