export const OSKEYS = ['OS', 'OSLeft', 'OSRight'];
export const CONTROLKEYS = ['Control', 'ControlLeft', 'ControlRight'];
export const ALTKEYS = ['Alt', 'AltLeft', 'AltRight'];
export const SHIFTKEYS = ['Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
export const ControlKeyEvent = 'ctrl';
export const ShiftKeyEvent = 'shift';
export const AltKeyEvent = 'alt';
export const OSKeyEvent = 'os';
export const AltAltNames = ['option', '⌥'];
export const AltOSNames = ['meta', 'win', '⌘', 'cmd', 'command'];
export const MODPRIORITY = {};


// Setup the modifier priorities so we can maintain a consistent ordering of combo events
var ctrlKeys = CONTROLKEYS.concat(['ctrl']);
var altKeys = ALTKEYS.concat(AltAltNames);
var osKeys = OSKEYS.concat(AltOSNames);
for (let i=0; i < ctrlKeys.length; i++) {
    MODPRIORITY[ctrlKeys[i].toLowerCase()] = 5;
}
for (let i=0; i < SHIFTKEYS.length; i++) {
    MODPRIORITY[SHIFTKEYS[i].toLowerCase()] = 4;
}
for (let i=0; i < altKeys.length; i++) {
    MODPRIORITY[altKeys[i].toLowerCase()] = 3;
}
for (let i=0; i < osKeys.length; i++) {
    MODPRIORITY[osKeys[i].toLowerCase()] = 2;
}

