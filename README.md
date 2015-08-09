# AudioKeys

### In Development

This doesn't work yet, but it will soon! Here's what it will do:

---------------------

Use AudioKeys to power the QWERTY keyboard in your next Web Audio project. AudioKeys provides intelligent handling of key events, giving you key up and key down events that you can use to trigger your sounds.

AudioKeys provides configurable polyphony— if you're making a monophonic synth, choose from the common note priorities "last note", "first note", "highest note", or "lowest note".

Choose from two common key layouts, one of which will be able to support optional octave shifting and velocity selecting.

```javascript
var keyboard = new AudioKeys({
  polyphony: 1,
  priority: 'last',
  rows: 1,
  // octaves: true, // not implemented yet
  rootNote: 48
});

// a key was pressed
keyboard.down( function(note, e) {
  console.log(note);
});

// a key was released
keyboard.up( function(note, e) {
  console.log(note);
});
```