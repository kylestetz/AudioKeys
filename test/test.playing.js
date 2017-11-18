var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Performing', function() {

  it('should sucessfully play and release three overlapping notes', function(callback) {

    var keyboard = new AudioKeys({
      polyphony: 1,
      priority: 'last'
    });

    function timeout(callback) {
      setTimeout(callback, 1);
    }

    // KEY PRESSES

    keyboard._addKey({ keyCode: 68 });
    assert.equal(keyboard._state.keys.length, 1);
    assert.equal(keyboard._state.buffer.length, 1);

    timeout( function() {
      keyboard._addKey({ keyCode: 83 });
      assert.equal(keyboard._state.keys.length, 2);
      assert.equal(keyboard._state.buffer.length, 1);

      timeout( function() {
        keyboard._addKey({ keyCode: 65 });
        assert.equal(keyboard._state.keys.length, 3);
        assert.equal(keyboard._state.buffer.length, 1);

        timeout( function() {

          // KEY RELEASES

          keyboard._removeKey({ keyCode: 65 });
          assert.equal(keyboard._state.keys.length, 2);
          assert.equal(keyboard._state.buffer.length, 1);

          timeout( function() {
            keyboard._removeKey({ keyCode: 68 });
            assert.equal(keyboard._state.keys.length, 1);
            assert.equal(keyboard._state.buffer.length, 1);

            timeout( function() {
              keyboard._removeKey({ keyCode: 83 });
              assert.strictEqual(keyboard._state.keys.length, 0);
              assert.equal(keyboard._state.buffer.length, 0);

              callback();
            });
          });
        });
      });
    });

  });

});