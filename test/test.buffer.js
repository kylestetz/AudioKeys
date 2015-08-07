var assert = require('assert');
var AudioKeys = require('../dist/audiokeys.js');

describe('Buffers', function() {

  describe('methods', function() {

    it('should add a note to _keys using _addKey', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.deepEqual(keyboard._keys[0], { note: 60, keyCode: 65, isActive: true });
    });

    it('should remove a note from _keys using _removeKey', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._keys.length, 1);
      keyboard._removeKey({ keyCode: 65 });
      assert.strictEqual(keyboard._keys.length, 0);
    });

    it('should verify whether or not a key is active', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._isPressed(65), true);
    });

  });

});