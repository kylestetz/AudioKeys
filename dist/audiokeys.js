function AudioKeys(options) {
  var self = this;

  self._setState(options);

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
    behavior: 'last',
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
// Event Handling
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
      fn(args);
    });
  }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImF1ZGlva2V5cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEF1ZGlvS2V5cyhvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLl9zZXRTdGF0ZShvcHRpb25zKTtcblxuICAvLyBhbGwgbGlzdGVuZXJzIGFyZSBzdG9yZWQgaW4gYXJyYXlzIGluIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydGllcy5cbiAgLy8gZS5nLiBzZWxmLl9saXN0ZW5lcnMuZG93biA9IFtmbjEsIGZuMiwgLi4uIF1cbiAgc2VsZi5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gYmluZCBldmVudHNcbiAgLy8gc2VsZi5iaW5kKCk7XG59XG5cbi8vIFBsYXkgd2VsbCB3aXRoIHJlcXVpcmUgc28gdGhhdCB3ZSBjYW4gcnVuIGEgdGVzdCBzdWl0ZSBhbmQgdXNlIGJyb3dzZXJpZnkuXG5pZihtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBBdWRpb0tleXM7XG59XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLl9zZXRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgLy8gdGhlIHN0YXRlIGlzIGtlcHQgaW4gdGhpcyBvYmplY3RcbiAgc2VsZi5fc3RhdGUgPSB7fTtcblxuICAvLyBzZXQgc29tZSBkZWZhdWx0cyAuLi5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUoe1xuICAgIHBvbHlwaG9ueTogNCxcbiAgICByb3dzOiAxLFxuICAgIG9jdGF2ZXM6IHRydWUsXG4gICAgYmVoYXZpb3I6ICdsYXN0JyxcbiAgICByb290Tm90ZTogNDhcbiAgfSk7XG5cbiAgLy8gLi4uIGFuZCBvdmVycmlkZSB0aGVtIHdpdGggb3B0aW9ucy5cbiAgc2VsZi5fZXh0ZW5kU3RhdGUob3B0aW9ucyk7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl9leHRlbmRTdGF0ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGZvcih2YXIgbyBpbiBvcHRpb25zKSB7XG4gICAgc2VsZi5fc3RhdGVbb10gPSBvcHRpb25zW29dO1xuICB9XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKC8qIG9wdGlvbnMgfHwgcHJvcGVydHksIHZhbHVlICovKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgc2VsZi5fZXh0ZW5kU3RhdGUoYXJndW1lbnRzWzBdKTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl9zdGF0ZVthcmd1bWVudHNbMF1dID0gYXJndW1lbnRzWzFdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICByZXR1cm4gc2VsZi5fc3RhdGVbcHJvcGVydHldO1xufTtcbiIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEV2ZW50IEhhbmRsaW5nXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIEF1ZGlvS2V5cyBoYXMgYSB2ZXJ5IHNpbXBsZSBldmVudCBoYW5kbGluZyBzeXN0ZW0uIEludGVybmFsbHlcbi8vIHdlJ2xsIGNhbGwgc2VsZi5fdHJpZ2dlcignZG93bicsIGFyZ3VtZW50KSB3aGVuIHdlIHdhbnQgdG8gZmlyZVxuLy8gYW4gZXZlbnQgZm9yIHRoZSB1c2VyLlxuXG5BdWRpb0tleXMucHJvdG90eXBlLmRvd24gPSBmdW5jdGlvbihmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byBvdXIgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgc2VsZi5fbGlzdGVuZXJzLmRvd24gPSAoc2VsZi5fbGlzdGVuZXJzLmRvd24gfHwgW10pLmNvbmNhdChmbik7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnVwID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy51cCA9IChzZWxmLl9saXN0ZW5lcnMudXAgfHwgW10pLmNvbmNhdChmbik7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLl90cmlnZ2VyID0gZnVuY3Rpb24oYWN0aW9uIC8qIGFyZ3MgKi8pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGlmIHdlIGhhdmUgYW55IGxpc3RlbmVycyBieSB0aGlzIG5hbWUgLi4uXG4gIGlmKHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dICYmIHNlbGYuX2xpc3RlbmVyc1thY3Rpb25dLmxlbmd0aCkge1xuICAgIC8vIGdyYWIgdGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBsaXN0ZW5lcnMgLi4uXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGFyZ3Muc3BsaWNlKDAsIDEpO1xuICAgIC8vIGFuZCBjYWxsIHRoZW0hXG4gICAgc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0uZm9yRWFjaCggZnVuY3Rpb24oZm4pIHtcbiAgICAgIGZuKGFyZ3MpO1xuICAgIH0pO1xuICB9XG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9