// Each file contains methods of the prototype.
// We'll compose them all together here.

var state = require('./AudioKeys.state');
var events = require('./AudioKeys.events');
var mapping = require('./AudioKeys.mapping');
var buffer = require('./AudioKeys.buffer');
var priority = require('./AudioKeys.priority');
var special = require('./AudioKeys.special');

function AudioKeys(options) {
  var self = this;

  self._setState(options);

  // all listeners are stored in arrays in their respective properties.
  // e.g. self._listeners.down = [fn1, fn2, ... ]
  self._listeners = {};

  // bind DOM events
  self._bind();
}

// state
AudioKeys.prototype._setState = state._setState;
AudioKeys.prototype._extendState = state._extendState;
AudioKeys.prototype.set = state.set;
AudioKeys.prototype.get = state.get;

// events
AudioKeys.prototype.down = events.down;
AudioKeys.prototype.up = events.up;
AudioKeys.prototype._trigger = events._trigger;
AudioKeys.prototype._bind = events._bind;

// mapping
AudioKeys.prototype._map = mapping._map;
AudioKeys.prototype._offset = mapping._offset;
AudioKeys.prototype._isNote = mapping._isNote;
AudioKeys.prototype._toFrequency = mapping._toFrequency;
AudioKeys.prototype._keyMap = mapping._keyMap;

// buffer
AudioKeys.prototype._addKey = buffer._addKey;
AudioKeys.prototype._removeKey = buffer._removeKey;
AudioKeys.prototype._isPressed = buffer._isPressed;
AudioKeys.prototype._makeNote = buffer._makeNote;
AudioKeys.prototype.clear = buffer.clear;
AudioKeys.prototype._update = buffer._update;
AudioKeys.prototype._diff = buffer._diff;

// priority
AudioKeys.prototype._prioritize = priority._prioritize;
AudioKeys.prototype._last = priority._last;
AudioKeys.prototype._first = priority._first;
AudioKeys.prototype._highest = priority._highest;
AudioKeys.prototype._lowest = priority._lowest;

// special
AudioKeys.prototype._isSpecialKey = special._isSpecialKey;
AudioKeys.prototype._specialKey = special._specialKey;
AudioKeys.prototype._specialKeyMap = special._specialKeyMap;

// Browserify will take care of making this a global
// in a browser environment without a build system.
module.exports = AudioKeys;