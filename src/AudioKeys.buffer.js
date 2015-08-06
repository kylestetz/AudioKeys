
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