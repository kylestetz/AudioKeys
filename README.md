<img src="https://raw.github.com/kylestetz/audiokeys/master/audiokeys.jpg" />

# AudioKeys

[![Build Status](https://travis-ci.org/kylestetz/AudioKeys.svg)](https://travis-ci.org/kylestetz/AudioKeys)

Use AudioKeys to power the QWERTY keyboard in your next Web Audio project. AudioKeys provides intelligent handling of key events, giving you key up and key down events that you can use to trigger your sounds.

AudioKeys provides configurable polyphony— if you're making a monophonic synth, choose from the common note priorities "last note", "first note", "highest note", or "lowest note".

Choose from two common key layouts, one of which supports optional octave shifting and velocity selecting.

```javascript
var keyboard = new AudioKeys({
  polyphony: 1,
  priority: 'last',
  rows: 1,
  octaveControls: true,
  velocityControls: true,
  rootNote: 48
});

// a key was pressed
keyboard.down( function(note) {
  console.log(note);
});

// a key was released
keyboard.up( function(note) {
  console.log(note);
});
```

------------------------------------

##### TODO
- [x] Get it working!
- [x] Implement octave shifting (for `rows=1`)
- [x] Implement velocity selection (for `rows=1`)
- [ ] Demo site
- [ ] Add MIDI support