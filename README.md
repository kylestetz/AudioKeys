# AudioKeys

Use AudioKeys to power the QWERTY keyboard in your next Web Audio project. AudioKeys provides intelligent handling of key events, giving you key up and key down events that you can use to trigger your sounds.

AudioKeys provides configurable polyphony— if you're making a monophonic synth, choose from common re-trigger behaviors "last note", "first note", "highest note", "lowest note", or "single note".

Choose from two common key layouts, one of which can support optional octave shifting and velocity selecting.

```
var keyboard = new AudioKeys({
  polyphony: 1,
  behavior: 'last',
  rows: 1,
  octaves: true
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