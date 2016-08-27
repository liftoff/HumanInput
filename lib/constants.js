(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.constants = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var OSKEYS = exports.OSKEYS = ['OS', 'OSLeft', 'OSRight'];
    var CONTROLKEYS = exports.CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'];
    var ALTKEYS = exports.ALTKEYS = ['Alt', 'AltLeft', 'AltRight'];
    var SHIFTKEYS = exports.SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
    var ControlKeyEvent = exports.ControlKeyEvent = 'ctrl';
    var ShiftKeyEvent = exports.ShiftKeyEvent = 'shift';
    var AltKeyEvent = exports.AltKeyEvent = 'alt';
    var OSKeyEvent = exports.OSKeyEvent = 'os';
    var AltAltNames = exports.AltAltNames = ['option', '⌥'];
    var AltOSNames = exports.AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];
    var AllModifiers = exports.AllModifiers = [].concat.apply([], [OSKEYS, CONTROLKEYS, ALTKEYS, SHIFTKEYS]);
    var MODPRIORITY = exports.MODPRIORITY = {};
    var MACOS = exports.MACOS = window.navigator.userAgent.includes('Mac OS X');

    // Setup the modifier priorities so we can maintain a consistent ordering of combo events
    var ctrlKeys = CONTROLKEYS.concat(['ctrl']);
    var altKeys = ALTKEYS.concat(AltAltNames);
    var osKeys = OSKEYS.concat(AltOSNames);
    for (var i = 0; i < ctrlKeys.length; i++) {
        MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
    }
    for (var _i = 0; _i < SHIFTKEYS.length; _i++) {
        MODPRIORITY[SHIFTKEYS[_i].toLowerCase()] = 4;
    }
    for (var _i2 = 0; _i2 < altKeys.length; _i2++) {
        MODPRIORITY[altKeys[_i2].toLowerCase()] = 3;
    }
    for (var _i3 = 0; _i3 < osKeys.length; _i3++) {
        MODPRIORITY[osKeys[_i3].toLowerCase()] = 2;
    }
});