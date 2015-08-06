function AudioKeys(options) {
  var self = this;

  self._setState(options);

  // all listeners are stored in arrays in their respective properties.
  // e.g. self._listeners.down = [fn1, fn2, ... ]
  self._listeners = {};

  // bind DOM events
  self._bind();
}

// Play well with require so that we can run a test suite and use browserify.
if(typeof module !== 'undefined') {
  module.exports = AudioKeys;
}

AudioKeys.prototype._setState = function(options) {
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
    octaves: true,
    priority: 'last',
    rootNote: 48
  });

  // ... and override them with options.
  self._extendState(options);
};

AudioKeys.prototype._extendState = function(options) {
  var self = this;

  for(var o in options) {
    self._state[o] = options[o];
  }
};

AudioKeys.prototype.set = function(/* options || property, value */) {
  var self = this;

  if(arguments.length === 1) {
    self._extendState(arguments[0]);
  } else {
    self._state[arguments[0]] = arguments[1];
  }

  return this;
};

AudioKeys.prototype.get = function(property) {
  var self = this;

  return self._state[property];
};

// ================================================================
// Event Listeners
// ================================================================

// AudioKeys has a very simple event handling system. Internally
// we'll call self._trigger('down', argument) when we want to fire
// an event for the user.

AudioKeys.prototype.down = function(fn) {
  var self = this;

  // add the function to our list of listeners
  self._listeners.down = (self._listeners.down || []).concat(fn);
};

AudioKeys.prototype.up = function(fn) {
  var self = this;

  // add the function to our list of listeners
  self._listeners.up = (self._listeners.up || []).concat(fn);
};

AudioKeys.prototype._trigger = function(action /* args */) {
  var self = this;

  // if we have any listeners by this name ...
  if(self._listeners[action] && self._listeners[action].length) {
    // grab the arguments to pass to the listeners ...
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 1);
    // and call them!
    self._listeners[action].forEach( function(fn) {
      fn.apply(self, args);
    });
  }
};

// ================================================================
// DOM Bindings
// ================================================================

AudioKeys.prototype._bind = function() {
  var self = this;

  if(typeof window !== 'undefined' && window.document) {
    window.document.addEventListener('keydown', self._addKey);
    window.document.addEventListener('keyup', self._removeKey);
  }
};
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


// The process is:

// key press
//   add to self._keys
//   (an accurate representation of keys currently pressed)
// resolve self.buffer
//   based on polyphony and priority, determine the notes
//   that get triggered for the user

AudioKeys.prototype._addKey = function(e) {
  var self = this;
  // if the keyCode is one that can be mapped and isn't
  // already pressed...
  // if(self._isNote(e.keyCode) && !self._isActive(e.keyCode)) {
  //   self._pushNote( self._map(e.keyCode) );
  // }
};

AudioKeys.prototype._removeKey = function(e) {
  var self = this;

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiLCJBdWRpb0tleXMubWFwcGluZy5qcyIsIkF1ZGlvS2V5cy5idWZmZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImF1ZGlva2V5cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEF1ZGlvS2V5cyhvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLl9zZXRTdGF0ZShvcHRpb25zKTtcblxuICAvLyBhbGwgbGlzdGVuZXJzIGFyZSBzdG9yZWQgaW4gYXJyYXlzIGluIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydGllcy5cbiAgLy8gZS5nLiBzZWxmLl9saXN0ZW5lcnMuZG93biA9IFtmbjEsIGZuMiwgLi4uIF1cbiAgc2VsZi5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gYmluZCBET00gZXZlbnRzXG4gIHNlbGYuX2JpbmQoKTtcbn1cblxuLy8gUGxheSB3ZWxsIHdpdGggcmVxdWlyZSBzbyB0aGF0IHdlIGNhbiBydW4gYSB0ZXN0IHN1aXRlIGFuZCB1c2UgYnJvd3NlcmlmeS5cbmlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gQXVkaW9LZXlzO1xufVxuIiwiQXVkaW9LZXlzLnByb3RvdHlwZS5fc2V0U3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIC8vIHRoZSBzdGF0ZSBpcyBrZXB0IGluIHRoaXMgb2JqZWN0XG4gIHNlbGYuX3N0YXRlID0ge307XG5cbiAgLy8gc2V0IHNvbWUgZGVmYXVsdHMgLi4uXG4gIHNlbGYuX2V4dGVuZFN0YXRlKHtcbiAgICBwb2x5cGhvbnk6IDQsXG4gICAgcm93czogMSxcbiAgICBvY3RhdmVzOiB0cnVlLFxuICAgIHByaW9yaXR5OiAnbGFzdCcsXG4gICAgcm9vdE5vdGU6IDQ4XG4gIH0pO1xuXG4gIC8vIC4uLiBhbmQgb3ZlcnJpZGUgdGhlbSB3aXRoIG9wdGlvbnMuXG4gIHNlbGYuX2V4dGVuZFN0YXRlKG9wdGlvbnMpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZXh0ZW5kU3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBmb3IodmFyIG8gaW4gb3B0aW9ucykge1xuICAgIHNlbGYuX3N0YXRlW29dID0gb3B0aW9uc1tvXTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbigvKiBvcHRpb25zIHx8IHByb3BlcnR5LCB2YWx1ZSAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHNlbGYuX2V4dGVuZFN0YXRlKGFyZ3VtZW50c1swXSk7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc3RhdGVbYXJndW1lbnRzWzBdXSA9IGFyZ3VtZW50c1sxXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgcmV0dXJuIHNlbGYuX3N0YXRlW3Byb3BlcnR5XTtcbn07XG4iLCIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBFdmVudCBMaXN0ZW5lcnNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gQXVkaW9LZXlzIGhhcyBhIHZlcnkgc2ltcGxlIGV2ZW50IGhhbmRsaW5nIHN5c3RlbS4gSW50ZXJuYWxseVxuLy8gd2UnbGwgY2FsbCBzZWxmLl90cmlnZ2VyKCdkb3duJywgYXJndW1lbnQpIHdoZW4gd2Ugd2FudCB0byBmaXJlXG4vLyBhbiBldmVudCBmb3IgdGhlIHVzZXIuXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMuZG93biA9IChzZWxmLl9saXN0ZW5lcnMuZG93biB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUudXAgPSBmdW5jdGlvbihmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byBvdXIgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgc2VsZi5fbGlzdGVuZXJzLnVwID0gKHNlbGYuX2xpc3RlbmVycy51cCB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RyaWdnZXIgPSBmdW5jdGlvbihhY3Rpb24gLyogYXJncyAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgd2UgaGF2ZSBhbnkgbGlzdGVuZXJzIGJ5IHRoaXMgbmFtZSAuLi5cbiAgaWYoc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0gJiYgc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0ubGVuZ3RoKSB7XG4gICAgLy8gZ3JhYiB0aGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGxpc3RlbmVycyAuLi5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgYXJncy5zcGxpY2UoMCwgMSk7XG4gICAgLy8gYW5kIGNhbGwgdGhlbSFcbiAgICBzZWxmLl9saXN0ZW5lcnNbYWN0aW9uXS5mb3JFYWNoKCBmdW5jdGlvbihmbikge1xuICAgICAgZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIERPTSBCaW5kaW5nc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5BdWRpb0tleXMucHJvdG90eXBlLl9iaW5kID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQpIHtcbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHNlbGYuX2FkZEtleSk7XG4gICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc2VsZi5fcmVtb3ZlS2V5KTtcbiAgfVxufTsiLCIvLyBfbWFwIHJldHVybnMgdGhlIG1pZGkgbm90ZSBmb3IgYSBnaXZlbiBrZXlDb2RlLlxuQXVkaW9LZXlzLnByb3RvdHlwZS5fbWFwID0gZnVuY3Rpb24oa2V5Q29kZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiBzZWxmLl9rZXlNYXBbc2VsZi5fc3RhdGUucm93c11ba2V5Q29kZV07XG59O1xuXG4vLyBfaXNOb3RlIGRldGVybWluZXMgd2hldGhlciBhIGtleUNvZGUgaXMgYSBub3RlIG9yIG5vdC5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX2lzTm90ZSA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICByZXR1cm4gISFzZWxmLl9rZXlNYXBbc2VsZi5fc3RhdGUucm93c11ba2V5Q29kZV07XG59O1xuXG4vLyB0aGUga2V5cyBjb3JyZXNwb25kIHRvIGByb3dzYCwgc28gYF9rZXlNYXBbcm93c11gIHNob3VsZCByZXRyaWV2ZVxuLy8gdGhhdCBwYXJ0aWN1bGFyIG1hcHBpbmcuXG5BdWRpb0tleXMucHJvdG90eXBlLl9rZXlNYXAgPSB7XG4gIDE6IHtcbiAgICA2NTogIDYwLFxuICAgIDg3OiAgNjEsXG4gICAgODM6ICA2MixcbiAgICA2OTogIDYzLFxuICAgIDY4OiAgNjQsXG4gICAgNzA6ICA2NSxcbiAgICA4NDogIDY2LFxuICAgIDcxOiAgNjcsXG4gICAgODk6ICA2OCxcbiAgICA3MjogIDY5LFxuICAgIDg1OiAgNzAsXG4gICAgNzQ6ICA3MSxcbiAgICA3NTogIDcyLFxuICAgIDc5OiAgNzMsXG4gICAgNzY6ICA3NCxcbiAgICA4MDogIDc1LFxuICAgIDE4NjogNzYsXG4gICAgMjIyOiA3N1xuICB9LFxuICAyOiB7XG4gICAgLy8gYm90dG9tIHJvd1xuICAgIDkwOiAgNjAsXG4gICAgODM6ICA2MSxcbiAgICA4ODogIDYyLFxuICAgIDY4OiAgNjMsXG4gICAgNjc6ICA2NCxcbiAgICA4NjogIDY1LFxuICAgIDcxOiAgNjYsXG4gICAgNjY6ICA2NyxcbiAgICA3MjogIDY4LFxuICAgIDc4OiAgNjksXG4gICAgNzQ6ICA3MCxcbiAgICA3NzogIDcxLFxuICAgIDE4ODogNzIsXG4gICAgNzY6ICA3MyxcbiAgICAxOTA6IDc0LFxuICAgIDE4NjogNzUsXG4gICAgMTkxOiA3NixcbiAgICAvLyB0b3Agcm93XG4gICAgODE6ICA3NyxcbiAgICA1MDogIDc4LFxuICAgIDg3OiAgNzksXG4gICAgNTE6ICA4MCxcbiAgICA2OTogIDgxLFxuICAgIDgyOiAgODIsXG4gICAgNTM6ICA4MyxcbiAgICA4NDogIDg0LFxuICAgIDU0OiAgODUsXG4gICAgODk6ICA4NixcbiAgICA1NTogIDg3LFxuICAgIDg1OiAgODgsXG4gICAgNzM6ICA4OSxcbiAgICA1NzogIDkwLFxuICAgIDc5OiAgOTEsXG4gICAgNDg6ICA5MixcbiAgICA4MDogIDkzLFxuICAgIDIxOTogOTQsXG4gICAgMTg3OiA5NSxcbiAgICAyMjE6IDk2XG4gIH1cbn07XG4iLCJcbi8vIFRoZSBwcm9jZXNzIGlzOlxuXG4vLyBrZXkgcHJlc3Ncbi8vICAgYWRkIHRvIHNlbGYuX2tleXNcbi8vICAgKGFuIGFjY3VyYXRlIHJlcHJlc2VudGF0aW9uIG9mIGtleXMgY3VycmVudGx5IHByZXNzZWQpXG4vLyByZXNvbHZlIHNlbGYuYnVmZmVyXG4vLyAgIGJhc2VkIG9uIHBvbHlwaG9ueSBhbmQgcHJpb3JpdHksIGRldGVybWluZSB0aGUgbm90ZXNcbi8vICAgdGhhdCBnZXQgdHJpZ2dlcmVkIGZvciB0aGUgdXNlclxuXG5BdWRpb0tleXMucHJvdG90eXBlLl9hZGRLZXkgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgLy8gaWYgdGhlIGtleUNvZGUgaXMgb25lIHRoYXQgY2FuIGJlIG1hcHBlZCBhbmQgaXNuJ3RcbiAgLy8gYWxyZWFkeSBwcmVzc2VkLi4uXG4gIC8vIGlmKHNlbGYuX2lzTm90ZShlLmtleUNvZGUpICYmICFzZWxmLl9pc0FjdGl2ZShlLmtleUNvZGUpKSB7XG4gIC8vICAgc2VsZi5fcHVzaE5vdGUoIHNlbGYuX21hcChlLmtleUNvZGUpICk7XG4gIC8vIH1cbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3JlbW92ZUtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==