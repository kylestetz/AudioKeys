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
    self._listeners.forEach( function(fn) {
      fn(args);
    });
  }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5zdGF0ZS5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhdWRpb2tleXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBBdWRpb0tleXMob3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5fc2V0U3RhdGUob3B0aW9ucyk7XG5cbiAgLy8gYWxsIGxpc3RlbmVycyBhcmUgc3RvcmVkIGluIGFycmF5cyBpbiB0aGVpciByZXNwZWN0aXZlIHByb3BlcnRpZXMuXG4gIC8vIGUuZy4gc2VsZi5fbGlzdGVuZXJzLmRvd24gPSBbZm4xLCBmbjIsIC4uLiBdXG4gIHNlbGYuX2xpc3RlbmVycyA9IHt9O1xuXG4gIC8vIGJpbmQgZXZlbnRzXG4gIC8vIHNlbGYuYmluZCgpO1xufVxuXG4vLyBQbGF5IHdlbGwgd2l0aCByZXF1aXJlIHNvIHRoYXQgd2UgY2FuIHJ1biBhIHRlc3Qgc3VpdGUgYW5kIHVzZSBicm93c2VyaWZ5LlxuaWYobW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gQXVkaW9LZXlzO1xufVxuIiwiQXVkaW9LZXlzLnByb3RvdHlwZS5fc2V0U3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZighb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIC8vIHRoZSBzdGF0ZSBpcyBrZXB0IGluIHRoaXMgb2JqZWN0XG4gIHNlbGYuX3N0YXRlID0ge307XG5cbiAgLy8gc2V0IHNvbWUgZGVmYXVsdHMgLi4uXG4gIHNlbGYuX2V4dGVuZFN0YXRlKHtcbiAgICBwb2x5cGhvbnk6IDQsXG4gICAgcm93czogMSxcbiAgICBvY3RhdmVzOiB0cnVlLFxuICAgIGJlaGF2aW9yOiAnbGFzdCcsXG4gICAgcm9vdE5vdGU6IDQ4XG4gIH0pO1xuXG4gIC8vIC4uLiBhbmQgb3ZlcnJpZGUgdGhlbSB3aXRoIG9wdGlvbnMuXG4gIHNlbGYuX2V4dGVuZFN0YXRlKG9wdGlvbnMpO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5fZXh0ZW5kU3RhdGUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBmb3IodmFyIG8gaW4gb3B0aW9ucykge1xuICAgIHNlbGYuX3N0YXRlW29dID0gb3B0aW9uc1tvXTtcbiAgfVxufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbigvKiBvcHRpb25zIHx8IHByb3BlcnR5LCB2YWx1ZSAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHNlbGYuX2V4dGVuZFN0YXRlKGFyZ3VtZW50c1swXSk7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5fc3RhdGVbYXJndW1lbnRzWzBdXSA9IGFyZ3VtZW50c1sxXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuQXVkaW9LZXlzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgcmV0dXJuIHNlbGYuX3N0YXRlW3Byb3BlcnR5XTtcbn07IiwiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRXZlbnQgSGFuZGxpbmdcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gQXVkaW9LZXlzIGhhcyBhIHZlcnkgc2ltcGxlIGV2ZW50IGhhbmRsaW5nIHN5c3RlbS4gSW50ZXJuYWxseVxuLy8gd2UnbGwgY2FsbCBzZWxmLl90cmlnZ2VyKCdkb3duJywgYXJndW1lbnQpIHdoZW4gd2Ugd2FudCB0byBmaXJlXG4vLyBhbiBldmVudCBmb3IgdGhlIHVzZXIuXG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuZG93biA9IGZ1bmN0aW9uKGZuKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBhZGQgdGhlIGZ1bmN0aW9uIHRvIG91ciBsaXN0IG9mIGxpc3RlbmVyc1xuICBzZWxmLl9saXN0ZW5lcnMuZG93biA9IChzZWxmLl9saXN0ZW5lcnMuZG93biB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUudXAgPSBmdW5jdGlvbihmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byBvdXIgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgc2VsZi5fbGlzdGVuZXJzLnVwID0gKHNlbGYuX2xpc3RlbmVycy51cCB8fCBbXSkuY29uY2F0KGZuKTtcbn07XG5cbkF1ZGlvS2V5cy5wcm90b3R5cGUuX3RyaWdnZXIgPSBmdW5jdGlvbihhY3Rpb24gLyogYXJncyAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gaWYgd2UgaGF2ZSBhbnkgbGlzdGVuZXJzIGJ5IHRoaXMgbmFtZSAuLi5cbiAgaWYoc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0gJiYgc2VsZi5fbGlzdGVuZXJzW2FjdGlvbl0ubGVuZ3RoKSB7XG4gICAgLy8gZ3JhYiB0aGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGxpc3RlbmVycyAuLi5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgYXJncy5zcGxpY2UoMCwgMSk7XG4gICAgLy8gYW5kIGNhbGwgdGhlbSFcbiAgICBzZWxmLl9saXN0ZW5lcnMuZm9yRWFjaCggZnVuY3Rpb24oZm4pIHtcbiAgICAgIGZuKGFyZ3MpO1xuICAgIH0pO1xuICB9XG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9