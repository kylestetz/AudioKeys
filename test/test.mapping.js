var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Mapping', function() {

  describe('rows', function() {
    it('should have a mapping for the `1 row` keyboard', function() {
      var keyboard = new AudioKeys();

      keyboard.set('rows', 1);
      assert.notStrictEqual(keyboard._keyMap[1], undefined);
    });

    it('should have a mapping for the `2 row` keyboard', function() {
      var keyboard = new AudioKeys();

      keyboard.set('rows', 2);
      assert.notStrictEqual(keyboard._keyMap[2], undefined);
    });
  });

  describe('methods', function() {
    it('should `_map` the corresponding MIDI note given a keyCode', function() {
      var keyboard = new AudioKeys();

      keyboard.set('rows', 1);
      // "a" (65) maps to 60
      assert.equal(keyboard._map(65), 60);

      keyboard.set('rows', 2);
      // "z" (90) maps to 60
      assert.equal(keyboard._map(90), 60);
    });

    it('should determine if a keyCode corresponds to a note using `_isNote`', function() {
      var keyboard = new AudioKeys();

      keyboard.set('rows', 1);
      // "a" (65) maps to 60
      assert.equal(keyboard._isNote(65), true);

      keyboard.set('rows', 2);
      // "a" should not be a note now
      assert.equal(keyboard._isNote(65), false);
    });

    it('should return a note offset by the rootNote', function() {
      var keyboard = new AudioKeys();

      keyboard.set('rootNote', 72);
      keyboard.set('rows', 1);
      assert.equal(keyboard._map(65), 72);
    });

    it('should convert midi notes to frequency in Hz', function() {
      var keyboard = new AudioKeys();

      assert.equal(keyboard._toFrequency(69), 440);
    });
  });

});