(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './constants'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./constants'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.constants);
        global.keymaps = mod.exports;
    }
})(this, function (exports, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.keyMaps = undefined;


    // NOTE: These location-based keyMaps will only be necessary as long as Safari lacks support for KeyboardEvent.key.
    //       Some day we'll be able to get rid of these (hurry up Apple!).
    var keyMaps = exports.keyMaps = { // NOTE: 0 will be used if not found in a specific location
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
            'Down': 40,
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
    // Key mappings for browsers that don't support KeyboardEvent.key (i.e. Safari!)

    // NOTE: We *may* have to deal with control codes at some point in the future so I'm leaving this here for the time being:
    //     self.controlCodes = {0: "NUL", 1: "DC1", 2: "DC2", 3: "DC3", 4: "DC4", 5: "ENQ", 6: "ACK", 7: "BEL", 8: "BS", 9: "HT", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI", 16: "DLE", 21: "NAK", 22: "SYN", 23: "ETB", 24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US"};
    //     for (var key in self.controlCodes) { self.controlCodes[self.controlCodes[key]] = key; } // Also add the reverse mapping

    // BEGIN CODE THAT IS ONLY NECESSARY FOR SAFARI

    for (var i = 48; i <= 57; i++) {
        keyMaps[0][i] = '' + (i - 48);
    }
    // A - Z
    for (var _i = 65; _i <= 90; _i++) {
        keyMaps[0][_i] = String.fromCharCode(_i);
    }
    // NUM_PAD_0 - NUM_PAD_9
    for (var _i2 = 96; _i2 <= 105; _i2++) {
        keyMaps[3][_i2] = 'Numpad' + (_i2 - 96);
    }
    // F1 - F12
    for (var _i3 = 112; _i3 <= 123; _i3++) {
        keyMaps[0][_i3] = 'F' + (_i3 - 112 + 1);
    }
    // Extra Mac keys:
    if (_constants.MACOS) {
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
        for (var attr in macSpecials) {
            keyMaps[0][attr] = macSpecials[attr];
        }
        for (var _i4 = 63236; _i4 <= 63242; _i4++) {
            keyMaps[0][_i4] = 'F' + (_i4 - 63236 + 1);
        }
    }
    // Make keyMaps work both forward and in reverse:
    var _loop = function _loop(_i5) {
        Object.keys(keyMaps[_i5]).forEach(function (key) {
            if (key.length > 1 && !isNaN(key)) {
                key = parseInt(key);
            }
            keyMaps[_i5][keyMaps[_i5][key]] = key;
        });
    };

    for (var _i5 = 0; _i5 <= 3; _i5++) {
        _loop(_i5);
    }

    // END CODE THAT IS ONLY NECESSARY FOR SAFARI
});