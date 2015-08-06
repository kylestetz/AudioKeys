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

AudioKeys.prototype.trigger = function(action /* args */) {
  var self = this;

  //
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGlvS2V5cy5qcyIsIkF1ZGlvS2V5cy5ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXVkaW9rZXlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gQXVkaW9LZXlzKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgLy8gdGhlIHN0YXRlIGlzIGtlcHQgaW4gdGhpcyBvYmplY3RcbiAgc2VsZi5fc3RhdGUgICAgICAgICAgID0ge307XG4gIHNlbGYuX3N0YXRlLnBvbHlwaG9ueSA9IG9wdGlvbnMucG9seXBob255IHx8IDQ7XG4gIHNlbGYuX3N0YXRlLnJvd3MgICAgICA9IG9wdGlvbnMucm93cyAgICAgIHx8IDE7XG4gIHNlbGYuX3N0YXRlLm9jdGF2ZXMgICA9IG9wdGlvbnMub2N0YXZlcyAgIHx8IHRydWU7XG4gIHNlbGYuX3N0YXRlLmJlaGF2aW9yICA9IG9wdGlvbnMuYmVoYXZpb3IgIHx8ICdsYXN0JztcblxuICAvLyBhbGwgbGlzdGVuZXJzIGFyZSBzdG9yZWQgaW4gYXJyYXlzIGluIHRoZWlyIHJlc3BlY3RpdmUgcHJvcGVydGllcy5cbiAgLy8gZS5nLiBzZWxmLl9saXN0ZW5lcnMuZG93biA9IFtmbjEsIGZuMiwgLi4uIF1cbiAgc2VsZi5fbGlzdGVuZXJzID0ge307XG5cbiAgLy8gYmluZCBldmVudHNcbiAgLy8gc2VsZi5iaW5kKCk7XG59XG5cbi8vIFBsYXkgd2VsbCB3aXRoIHJlcXVpcmUgc28gdGhhdCB3ZSBjYW4gcnVuIGEgdGVzdCBzdWl0ZSBhbmQgdXNlIGJyb3dzZXJpZnkuXG5pZihtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBBdWRpb0tleXM7XG59XG4iLCJBdWRpb0tleXMucHJvdG90eXBlLmRvd24gPSBmdW5jdGlvbihmbikge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gYWRkIHRoZSBmdW5jdGlvbiB0byBvdXIgbGlzdCBvZiBsaXN0ZW5lcnNcbiAgc2VsZi5fbGlzdGVuZXJzLmRvd24gPSAoc2VsZi5fbGlzdGVuZXJzLmRvd24gfHwgW10pLmNvbmNhdChmbik7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnVwID0gZnVuY3Rpb24oZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIGFkZCB0aGUgZnVuY3Rpb24gdG8gb3VyIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIHNlbGYuX2xpc3RlbmVycy51cCA9IChzZWxmLl9saXN0ZW5lcnMudXAgfHwgW10pLmNvbmNhdChmbik7XG59O1xuXG5BdWRpb0tleXMucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihhY3Rpb24gLyogYXJncyAqLykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy9cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=