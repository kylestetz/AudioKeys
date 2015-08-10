<img src="https://raw.github.com/kylestetz/audiokeys/master/audiokeys.jpg" />

# AudioKeys

[![Build Status](https://travis-ci.org/kylestetz/AudioKeys.svg)](https://travis-ci.org/kylestetz/AudioKeys)

#### Bring your own sound.

Use AudioKeys to power the QWERTY keyboard in your next Web Audio project. AudioKeys provides **intelligent handling of key events**, giving you key up and key down events that you can use to trigger your sounds.

AudioKeys provides configurable polyphony— if you're making a monophonic synth, choose from the common note priorities "last note", "first note", "highest note", or "lowest note". It also handles odd situations like switching tabs— AudioKeys fires a note off event when your browser window goes out of focus.

```javascript
var keyboard = new AudioKeys();

// a key was pressed
keyboard.down( function(note) {
  // turn on your oscillators or samples here!
});

// a key was released
keyboard.up( function(note) {
  // turn off your oscillators or samples here!
});
```

Choose from two common key layouts, one of which supports optional octave shifting and velocity selecting.

#### `keyboard.set('rows', 1)`

<img src="https://raw.github.com/kylestetz/audiokeys/master/images/audiokeys-mapping-rows1.jpg" />

#### `keyboard.set('rows', 2)`

<img src="https://raw.github.com/kylestetz/audiokeys/master/images/audiokeys-mapping-rows2.jpg" />

------------------------------------

##### TODO
- [x] Get it working!
- [x] Implement octave shifting (for `rows=1`)
- [x] Implement velocity selection (for `rows=1`)
- [ ] Demo site
- [ ] Add MIDI support