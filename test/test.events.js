var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Events', function() {

  describe('listeners and related methods', function(){
    it('should have `up` and `down` and `_trigger` methods', function() {
      var keyboard = new AudioKeys();

      assert(keyboard.up);
      assert(keyboard.down);
      assert(keyboard._trigger);
    });

    it('should accept listeners via `up` and `down`', function() {
      var keyboard = new AudioKeys();

      var handler = function() {
        return;
      };

      keyboard.down(handler);
      assert.strictEqual(keyboard._listeners.down[0], handler);

      keyboard.up(handler);
      assert.strictEqual(keyboard._listeners.up[0], handler);
    });

    it('should fire down listeners on `_trigger("down")`', function() {
      var keyboard = new AudioKeys();

      var flag = false;
      function switchFlag() { flag = true; }

      keyboard.down(switchFlag);
      keyboard._trigger('down');

      assert.equal(flag, true);
    });

    it('should fire up listeners on `_trigger("up")`', function() {
      var keyboard = new AudioKeys();

      var flag = false;
      function switchFlag() { flag = true; }

      keyboard.up(switchFlag);
      keyboard._trigger('up');

      assert.equal(flag, true);
    });

    it('should pass arguments through _trigger()', function() {
      var keyboard = new AudioKeys();

      function verify() {
        assert.equal(arguments.length, 2);
      }

      keyboard.down(verify);
      keyboard._trigger('down', true, true);
    });

    it('should pass a note object through `up` and `down`', function() {
      var keyboard = new AudioKeys({
        rows: 1
      });

      function verify(note) {
        assert.equal(note.note, 60);
        assert.equal(note.keyCode, 65);
        assert.equal(note.frequency, keyboard._toFrequency(60));
      }

      keyboard.down(verify);
      keyboard.up(verify);

      keyboard._addKey({ keyCode: 65 });
      keyboard._removeKey({ keyCode: 65 });
    });

    it('passes a velocity of 127 on note down', function() {
      var keyboard = new AudioKeys({
        rows: 1
      });

      function verify(note) {
        assert.equal(note.velocity, 127);
      }

      keyboard.down(verify);

      keyboard._addKey({ keyCode: 65 });
      keyboard._removeKey({ keyCode: 65 });
    });

    it('passes a velocity of 0 on note up', function() {
      var keyboard = new AudioKeys({
        rows: 1
      });

      function verify(note) {
        assert.equal(note.velocity, 0);
      }

      keyboard.up(verify);

      keyboard._addKey({ keyCode: 65 });
      keyboard._removeKey({ keyCode: 65 });
    });
  });

});