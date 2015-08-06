var assert = require('assert');
var AudioKeys = require('../dist/audiokeys.js');

describe('State', function() {

  // ================================================================
  // DEFAULTS
  // ================================================================

  describe('defaults', function() {

    it('should have default polyphony of 4', function() {
      var keyboard = new AudioKeys();
      assert.equal(keyboard._state.polyphony, 4);
    });

    it('should have 1 default row', function() {
      var keyboard = new AudioKeys();
      assert.equal(keyboard._state.rows, 1);
    });

    it('should have octave controls by default', function() {
      var keyboard = new AudioKeys();
      assert.equal(keyboard._state.octaves, true);
    });

    it('should have a default behavior of `last`', function() {
      var keyboard = new AudioKeys();
      assert.equal(keyboard._state.behavior, 'last');
    });

    it('should have a default rootNote of 48', function() {
      var keyboard = new AudioKeys();
      assert.equal(keyboard._state.rootNote, 48);
    });

  });

  // ================================================================
  // SETTING AND GETTING
  // ================================================================

  describe('setting and getting', function() {

    it('should be able to set all properties with `set(prop, value)`', function() {
      var keyboard = new AudioKeys();

      keyboard.set('polyphony', 1);
      assert.equal(keyboard._state.polyphony, 1);

      keyboard.set('rows', 2);
      assert.equal(keyboard._state.rows, 2);

      keyboard.set('octaves', false);
      assert.equal(keyboard._state.octaves, false);

      keyboard.set('behavior', 'first');
      assert.equal(keyboard._state.behavior, 'first');

      keyboard.set('rootNote', 60);
      assert.equal(keyboard._state.rootNote, 60);
    });

    it('should be able to set all properties with `set({ props })`', function() {
      var keyboard = new AudioKeys();

      keyboard.set({
        polyphony: 1,
        rows: 2,
        octaves: false,
        behavior: 'first',
        rootNote: 60
      });

      assert.equal(keyboard._state.polyphony, 1);
      assert.equal(keyboard._state.rows, 2);
      assert.equal(keyboard._state.octaves, false);
      assert.equal(keyboard._state.behavior, 'first');
      assert.equal(keyboard._state.rootNote, 60);
    });

    it('should be able to get all properties', function() {
      var keyboard = new AudioKeys();

      assert.equal(keyboard.get('polyphony'), 4);
      assert.equal(keyboard.get('rows'), 1);
      assert.equal(keyboard.get('octaves'), true);
      assert.equal(keyboard.get('behavior'), 'last');
      assert.equal(keyboard.get('rootNote'), 48);
    });

    it('should accept an `options` object in the constructor', function() {
      var keyboard = new AudioKeys({
        polyphony: 1,
        rows: 2,
        octaves: false,
        behavior: 'first',
        rootNote: 60
      });

      assert.equal(keyboard._state.polyphony, 1);
      assert.equal(keyboard._state.rows, 2);
      assert.equal(keyboard._state.octaves, false);
      assert.equal(keyboard._state.behavior, 'first');
      assert.equal(keyboard._state.rootNote, 60);
    });
  });
});

describe('Events', function() {

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

  // it('should fire listeners on `_trigger`', function() {
  //   var keyboard = new AudioKeys();


  // });

});