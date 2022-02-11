var assert = require('assert');
var AudioKeys = require('../src/AudioKeys.js');

describe('Special Keys', function() {

  describe('octaves', function() {
    it('should shift the octave down when `z` is pressed', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true
      });

      keyboard._addKey({ keyCode: 90 });
      assert.equal(keyboard._state.octave, -1);
      // 'a' (rootNote)
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote - 12);

      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true,
        layoutIndependentMapping: true
      });

      keyboard._addKey({ code: 'KeyZ' });
      assert.equal(keyboard._state.octave, -1);
      // 'a' (rootNote)
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote - 12);
    });

    it('should shift the octave up when `x` is pressed', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true
      });

      keyboard._addKey({ keyCode: 88 });
      assert.equal(keyboard._state.octave, 1);
      // 'a' (rootNote)
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote + 12);

      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true,
        layoutIndependentMapping: true
      });

      keyboard._addKey({ code: 'KeyX' });
      assert.equal(keyboard._state.octave, 1);
      // 'a' (rootNote)
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote + 12);
    });

    it('should not modify an existing note when the octave is shifted', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true
      });

      keyboard.up( function(note) {
        assert.equal(note.note, keyboard._state.rootNote);
      });

      // 'a' (rootNote)
      keyboard._addKey({ keyCode: 65 });
      // shift octave up
      keyboard._addKey({ keyCode: 88 });
      keyboard._removeKey({ keyCode: 65 });

      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: true,
        layoutIndependentMapping: true
      });

      keyboard.up( function(note) {
        assert.equal(note.note, keyboard._state.rootNote);
      });

      // 'a' (rootNote)
      keyboard._addKey({ code: 'KeyA' });
      // shift octave up
      keyboard._addKey({ code: 'KeyX' });
      keyboard._removeKey({ code: 'KeyA' });
    });

    it('should not allow octave control when `octaveControls` is false', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: false
      });

      // 'x', which would shift octave up
      keyboard._addKey({ keyCode: 88 });
      // 'a' (rootNote)
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote);

      var keyboard = new AudioKeys({
        rows: 1,
        octaveControls: false,
        layoutIndependentMapping: true
      });

      // 'x', which would shift octave up
      keyboard._addKey({ code: 'KeyX' });
      // 'a' (rootNote)
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._state.buffer[0].note, keyboard._state.rootNote);
    });
  });

  describe('velocity', function() {
    it('should change the velocity when number keys are pressed', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        velocityControls: true,
        polyphony: 100
      });

      var velocities = [1, 14, 28, 42, 56, 70, 84, 98, 112, 127];
      var notes      = [65, 87, 83, 69, 68, 70, 84, 71, 89, 72];

      [49, 50, 51, 52, 53, 54, 55, 56, 57, 48].forEach( function(key, i) {
        keyboard._addKey({ keyCode: key });
        keyboard._addKey({ keyCode: notes[i] });
        assert.equal(keyboard._state.buffer[i].velocity, velocities[i]);
      });

      var keyboard = new AudioKeys({
        rows: 1,
        velocityControls: true,
        polyphony: 100,
        layoutIndependentMapping: true
      });

      var velocities = [1, 14, 28, 42, 56, 70, 84, 98, 112, 127];
      var notes      = [ "KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF", "KeyT", "KeyG", "KeyY", "KeyH" ];

      [ "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0" ].forEach( function(code, i) {
        keyboard._addKey({ code: code });
        keyboard._addKey({ code: notes[i] });
        assert.equal(keyboard._state.buffer[i].velocity, velocities[i]);
      });
    });

    it('should not allow velocity control when `velocityControls` is false', function() {
      var keyboard = new AudioKeys({
        rows: 1,
        velocityControls: false
      });

      // '5', which should set the velocity to 56
      keyboard._addKey({ keyCode: 53 });
      keyboard._addKey({ keyCode: 65 });
      assert.equal(keyboard._state.buffer[0].velocity, 127);

      var keyboard = new AudioKeys({
        rows: 1,
        velocityControls: false,
        layoutIndependentMapping: true
      });

      // '5', which should set the velocity to 56
      keyboard._addKey({ code: 'Digit5' });
      keyboard._addKey({ code: 'KeyA' });
      assert.equal(keyboard._state.buffer[0].velocity, 127);
    });
  });
});
