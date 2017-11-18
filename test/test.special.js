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
    });
  });
});
