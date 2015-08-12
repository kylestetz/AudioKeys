<img src="https://raw.github.com/kylestetz/audiokeys/master/audiokeys.jpg" />

# AudioKeys

[![Build Status](https://travis-ci.org/kylestetz/AudioKeys.svg)](https://travis-ci.org/kylestetz/AudioKeys)

#### Bring your own sound.

Use AudioKeys to power the QWERTY keyboard in your next Web Audio project. AudioKeys provides **intelligent handling of key events**, giving you key up and key down events that you can use to trigger your sounds.

AudioKeys provides **configurable polyphony**— if you're making a monophonic synth, choose from the common note priorities "last note", "first note", "highest note", or "lowest note". It also handles odd situations like switching tabs— AudioKeys fires a note off event when your browser window goes out of focus.

Choose from two common key layouts, one of which supports optional octave shifting and velocity selecting.

<img src="https://raw.github.com/kylestetz/audiokeys/master/images/audiokeys-mapping-rows1.jpg" />

<img src="https://raw.github.com/kylestetz/audiokeys/master/images/audiokeys-mapping-rows2.jpg" />

# Installation

Download `dist/audiokeys.js` (or the minified version) and include it in the `<head>` of your markup:
```html
<script src="/js/audiokeys.js"></script>
```

Now you will have the `AudioKeys(options)` function available to use.

### Basic Usage

```javascript
// create a keyboard
var keyboard = new AudioKeys();

keyboard.down( function(note) {
  // do things with the note object
});

keyboard.up( function(note) {
  // do things with the note object
});
```

##### The note object has cool stuff in it.

The object you get back in a `down` or `up` callback includes:

```javascript
{
  // the midi number of the note
  note: 60,
  // the keyCode of the key being pressed down
  keyCode: 65,
  // the frequency of the note
  frequency: 261.6255653005986,
  // the current velocity (this can only be set when rows = 1)
  velocity: 127
}
```

These properties will be useful in setting up oscillators. See the [`test/index.html`](https://github.com/kylestetz/AudioKeys/blob/master/test/index.html) file for a simple example.

### API

##### `keyboard.set(property, value)`
##### `keyboard.get(property, value)`

The state of the keyboard can be read and changed using the `set` and `get` methods. Here are the properties:

- `polyphony` (int) - The number of keys that can be active simultaneously
- `rows` (int) - Either `1` or `2`, see the diagrams above
- `octaveControls` (boolean) - Determines whether or not the `z` and `x` keys shift octaves when `rows` is set to `1`
- `priority` (string) - Determines the priority of the note triggers. Set this to `"last"`, `"first"`, `"highest"`, or `"lowest"`
- `rootNote` (midi note) - Determines what note the lowest key on the keyboard will represent. The default is `60` (C4)

These options can also be passed in when you create a new keyboard instance:

```javascript
var keyboard = new AudioKeys({
  polyphony: 1,
  rows: 2,
  priority: 'lowest'
});
```

------------------------------------

##### TODO
- [x] Get it working!
- [x] Implement octave shifting (for `rows=1`)
- [x] Implement velocity selection (for `rows=1`)
- [ ] Demo site
- [ ] Add MIDI support