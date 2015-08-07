// _map returns the midi note for a given keyCode.
AudioKeys.prototype._map = function(keyCode) {
  var self = this;
  return self._keyMap[self._state.rows][keyCode];
};

// _isNote determines whether a keyCode is a note or not.
AudioKeys.prototype._isNote = function(keyCode) {
  var self = this;
  return !!self._keyMap[self._state.rows][keyCode];
};

AudioKeys.prototype._toFrequency = function(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
};

// the keys correspond to `rows`, so `_keyMap[rows]` should retrieve
// that particular mapping.
AudioKeys.prototype._keyMap = {
  1: {
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
    81:  77,
    50:  78,
    87:  79,
    51:  80,
    69:  81,
    82:  82,
    53:  83,
    84:  84,
    54:  85,
    89:  86,
    55:  87,
    85:  88,
    73:  89,
    57:  90,
    79:  91,
    48:  92,
    80:  93,
    219: 94,
    187: 95,
    221: 96
  }
};
