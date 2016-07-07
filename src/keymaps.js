// Key mappings for browsers that don't support KeyboardEvent.key (i.e. Safari!)

// NOTE: We *may* have to deal with control codes at some point in the future so I'm leaving this here for the time being:
//     self.controlCodes = {0: "NUL", 1: "DC1", 2: "DC2", 3: "DC3", 4: "DC4", 5: "ENQ", 6: "ACK", 7: "BEL", 8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI", 16: "DLE", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US"};
//     for (var key in self.controlCodes) { self.controlCodes[self.controlCodes[key]] = key; } // Also add the reverse mapping

// BEGIN CODE THAT IS ONLY NECESSARY FOR SAFARI

// NOTE: These location-based keyMaps will only be necessary as long as Safari lacks support for KeyboardEvent.key.
//       Some day we'll be able to get rid of these (hurry up Apple!).
const MACOS = (window.navigator.userAgent.indexOf('Mac OS X') !== -1);
export var keyMaps = { // NOTE: 0 will be used if not found in a specific location
    // These are keys that we can only pick up on keydown/keyup and have no
    // straightforward mapping from their keyCode/which values:
    0: { // KeyboardEvent.DOM_KEY_LOCATION_STANDARD
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,
        'Shift': 16,
        'Control': 17,
        'Alt': 18,
        'Pause': 19,
        'CapsLock': 20,
        'Escape': 27,
        'Space': 32,
        'PageUp': 33,
        'PageDown': 34,
        'End': 35,
        'Home': 36,
        'ArrowLeft': 37,
        'Left': 37,
        'ArrowUp': 38,
        'Up': 38,
        'ArrowRight': 39,
        'Right': 39,
        'ArrowDown': 40,
        'Down' : 40,
        'PrintScreen': 42,
        'Insert': 45,
        'Delete': 46,
        'Semicolon': 59,
        '=': 61,
        'OS': 92,
        'Select': 93,
        'NumLock': 144,
        'ScrollLock': 145,
        'VolumeDown': 174,
        'VolumeUp': 175,
        'MediaTrackPrevious': 177,
        'MediaPlayPause': 179,
        ',': 188,
        '-': 189,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222,
        'AltGraph': 225,
        'Compose': 229
    },
    1: { // KeyboardEvent.DOM_LOCATION_LEFT
        'ShiftLeft': 16,
        'ControlLeft': 17,
        'AltLeft': 18,
        'OSLeft': 91
    },
    2: { // KeyboardEvent.DOM_LOCATION_RIGHT
        'ShiftRight': 16,
        'ControlRight': 17,
        'AltRight': 18,
        'OSRight': 92
    },
    3: { // KeyboardEvent.DOM_LOCATION_NUMPAD
        '*': 106,
        '+': 107,
        '-': 109,
        '.': 46,
        '/': 111
    }
};
// The rest of the keyMaps are straightforward:
// 1 - 0
for (let i = 48; i <= 57; i++) {
    keyMaps[0][i] = '' + (i - 48);
}
// A - Z
for (let i = 65; i <= 90; i++) {
    keyMaps[0][i] = String.fromCharCode(i);
}
// NUM_PAD_0 - NUM_PAD_9
for (let i = 96; i <= 105; i++) {
    keyMaps[3][i] = 'Numpad' + (i - 96);
}
// F1 - F12
for (let i = 112; i <= 123; i++) {
    keyMaps[0][i] = 'F' + (i - 112 + 1);
}
// Extra Mac keys:
if (MACOS) {
    var macSpecials = {
        3: 'Enter',
        63289: 'NumpadClear',
        63276: 'PageUp',
        63277: 'PageDown',
        63275: 'End',
        63273: 'Home',
        63234: 'ArrowLeft',
        63232: 'ArrowUp',
        63235: 'ArrowRight',
        63233: 'ArrowDown',
        63302: 'Insert',
        63272: 'Delete'
    };
    for (let attr in macSpecials) { keyMaps[0][attr] = macSpecials[attr]; }
    for (let i = 63236; i <= 63242; i++) {
        keyMaps[0][i] = 'F' + (i - 63236 + 1);
    }
}
// Make keyMaps work both forward and in reverse:
for (let i=0; i<=3; i++) {
    Object.keys(keyMaps[i]).forEach(function(key) {
        if (key.length > 1 && (!(isNaN(key)))) {
            key = parseInt(key);
        }
        keyMaps[i][keyMaps[i][key]] = key;
    });
}

keyMaps;
// END CODE THAT IS ONLY NECESSARY FOR SAFARI
