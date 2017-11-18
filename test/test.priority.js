var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Priority', function() {

  describe('`last`', function() {
    it('should prioritize the last notes in the _keys array', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 2);
      keyboard.set('priority', 'last');

      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });
      keyboard._addKey({ keyCode: 83 });

      assert.equal(keyboard._state.buffer.length, 2);
      assert.equal(keyboard._state.buffer[0].keyCode, 87);
      assert.equal(keyboard._state.buffer[1].keyCode, 83);
    });

    it('should retrigger an inactive note when it becomes active again', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 1);
      keyboard.set('priority', 'last');
      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });

      var flag = false;
      keyboard.up( function() {
        flag = true;
      });

      keyboard._removeKey({ keyCode: 87 });
      assert.equal(flag, true);
    });
  });

  describe('`first`', function() {
    it('should prioritize the first notes in the _keys array', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 2);
      keyboard.set('priority', 'first');

      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });
      keyboard._addKey({ keyCode: 83 });

      assert.equal(keyboard._state.buffer.length, 2);
      assert.equal(keyboard._state.buffer[0].keyCode, 65);
      assert.equal(keyboard._state.buffer[1].keyCode, 87);
    });

    it('should retrigger an inactive note when it becomes active again', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 1);
      keyboard.set('priority', 'first');
      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });

      var flag = false;
      keyboard.up( function() {
        flag = true;
      });

      keyboard._removeKey({ keyCode: 65 });
      assert.equal(flag, true);
    });
  });

  describe('`highest`', function() {
    it('should prioritize the highest notes in the _keys array', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 2);
      keyboard.set('priority', 'highest');

      keyboard._addKey({ keyCode: 79 }); // note = 73
      keyboard._addKey({ keyCode: 84 }); // note = 66
      keyboard._addKey({ keyCode: 89 }); // note = 68


      assert.equal(keyboard._state.buffer.length, 2);
      assert.equal(keyboard._state.buffer[0].keyCode, 79);
      assert.equal(keyboard._state.buffer[1].keyCode, 89);
    });

    it('should retrigger an inactive note when it becomes active again', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 1);
      keyboard.set('priority', 'highest');
      keyboard._addKey({ keyCode: 65 });
      keyboard._addKey({ keyCode: 87 });

      var flag = false;
      keyboard.up( function() {
        flag = true;
      });

      keyboard._removeKey({ keyCode: 87 });
      assert.equal(flag, true);
    });
  });

  describe('`lowest`', function() {
    it('should prioritize the lowest notes in the _keys array', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 2);
      keyboard.set('priority', 'lowest');

      keyboard._addKey({ keyCode: 84 });
      keyboard._addKey({ keyCode: 79 });
      keyboard._addKey({ keyCode: 89 });


      assert.equal(keyboard._state.buffer.length, 2);
      assert.equal(keyboard._state.buffer[0].keyCode, 84);
      assert.equal(keyboard._state.buffer[1].keyCode, 89);
    });

    it('should retrigger an inactive note when it becomes active again', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 1);
      keyboard.set('priority', 'lowest');
      keyboard._addKey({ keyCode: 87 });
      keyboard._addKey({ keyCode: 65 });

      var flag = false;
      keyboard.up( function() {
        flag = true;
      });

      keyboard._removeKey({ keyCode: 65 });
      assert.equal(flag, true);
    });
  });

});