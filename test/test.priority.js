var assert = require('assert');
var AudioKeys = require('../dist/audiokeys.js');

describe('Priority', function() {

  describe('`last`', function() {
    it('should prioritize the last notes in the _keys array', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 2);

      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });
      keyboard._addKey({ keyCode: 83 });

      assert.equal(keyboard._state.buffer.length, 2);
      assert.equal(keyboard._state.buffer[0].keyCode, 87);
      assert.equal(keyboard._state.buffer[1].keyCode, 83);
    });
  });

});