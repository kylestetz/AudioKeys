var assert = require('assert');
var AudioKeys = require('../dist/audiokeys.js');

describe('Mapping', function() {

  it('should have a mapping for the `1 row` keyboard', function() {
    var keyboard = new AudioKeys();

    keyboard.set('rows', 1);
    assert.notStrictEqual(keyboard._keyMap[1], undefined);
  });

  it('shoul have a mapping for the `2 row` keyboard', function() {
    var keyboard = new AudioKeys();

    keyboard.set('rows', 2);
    assert.notStrictEqual(keyboard._keyMap[2], undefined);
  });

  it('should _map the corresponding MIDI note given a keyCode', function() {
    var keyboard = new AudioKeys();

    keyboard.set('rows', 1);
    // "a" (65) maps to 60
    assert.equal(keyboard._map(65), 60);

    keyboard.set('rows', 2);
    // "z" (90) maps to 60
    assert.equal(keyboard._map(90), 60);
  });

  it('should determine if a keyCode corresponds to a note or not', function() {
    var keyboard = new AudioKeys();

    keyboard.set('rows', 1);
    // "a" (65) maps to 60
    assert.equal(keyboard._isNote(65), true);

    keyboard.set('rows', 2);
    // "a" should not be a note now
    assert.equal(keyboard._isNote(65), false);
  });

});