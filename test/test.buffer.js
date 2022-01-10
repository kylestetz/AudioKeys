var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Buffers', function() {

  describe('methods', function() {

    it('should add a note to _keys using _addKey', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.deepEqual(keyboard._state.keys[0], {
        note: 60,
        keyCode: 65,
        frequency: keyboard._toFrequency(60),
        isActive: true,
        velocity: 127,
      });

      var keyboard = new AudioKeys({ layoutIndependentMapping: true });

      // simulated key event
      keyboard._addKey({ code: 'KeyA' });
      assert.deepEqual(keyboard._state.keys[0], {
        note: 60,
        code: 'KeyA',
        frequency: keyboard._toFrequency(60),
        isActive: true,
        velocity: 127,
      });
    });

    it('should remove a note from _keys using _removeKey', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._state.keys.length, 1);
      keyboard._removeKey({ keyCode: 65 });
      assert.strictEqual(keyboard._state.keys.length, 0);

      var keyboard = new AudioKeys({ layoutIndependentMapping: true });
      // simulated key event
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._state.keys.length, 1);
      keyboard._removeKey({ code: 'KeyA' });
      assert.strictEqual(keyboard._state.keys.length, 0);
    });

    it('should verify whether or not a key is active', function() {
      var keyboard = new AudioKeys();

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._isPressed(65), true);

      var keyboard = new AudioKeys({ layoutIndependentMapping: true });

      // simulated key event
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._isPressed('KeyA'), true);
    });

    it('should `clear` any active keys', function() {
      var keyboard = new AudioKeys({
        polyphony: 1
      });

      // simulated key event
      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });
      keyboard.clear();
      assert.strictEqual(keyboard._state.keys.length, 0);
      assert.strictEqual(keyboard._state.buffer.length, 0);

      var keyboard = new AudioKeys({ polyphony: 1, layoutIndependentMapping: true });

      // simulated key event
      keyboard._addKey({ code: 'KeyA' });
      keyboard._addKey({ keyCode: 'KeyW' });
      keyboard.clear();
      assert.strictEqual(keyboard._state.keys.length, 0);
      assert.strictEqual(keyboard._state.buffer.length, 0);
    });

  });

});