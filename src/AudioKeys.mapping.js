module.exports = {
    // _map returns the midi note for a given keyCode.
    _map: function(keyCode) {
      return this._keyMap[this._state.rows][keyCode] + this._offset();
    },

    _offset: function() {
      return this._state.rootNote - this._keyMap[this._state.rows].root + (this._state.octave * 12);
    },

    // _isNote determines whether a keyCode is a note or not.
    _isNote: function(keyCode) {
      return !!this._keyMap[this._state.rows][keyCode];
    },

    // convert a midi note to a frequency. we assume here that _map has
    // already been called (to account for a potential rootNote offset)
    _toFrequency: function(note) {
      return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
    },

    // the object keys correspond to `rows`, so `_keyMap[rows]` should
    // retrieve that particular mapping.
    _keyMap: {
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
        81:  72,
        50:  73,
        87:  74,
        51:  75,
        69:  76,
        82:  77,
        53:  78,
        84:  79,
        54:  80,
        89:  81,
        55:  82,
        85:  83,
        73:  84,
        57:  85,
        79:  86,
        48:  87,
        80:  88,
        219: 89,
        187: 90,
        221: 91
      }
    },

};

