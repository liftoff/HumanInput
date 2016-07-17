// Utility functions used by multiple tests.

function keyEvent(key, type) {
    // Returns a new object for use in creating a KeyboardEvent for the given *key* and *type*.  The 'target' (and similar) properties will always be 'window'.
    // NOTE:  Only works with basic letters like 'a', 'b', or 'c'
    var baseEvent = {
        altKey: false,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        charCode: 0,
//         code: "KeyA",
        ctrlKey: false,
        currentTarget: window,
        defaultPrevented: false,
        detail: 0,
        eventPhase: 0,
//         key: "a",
//         keyCode: 65,
        location: 0,
        metaKey: false,
        repeat: false,
        returnValue: true,
        scoped: false,
        shiftKey: false,
        srcElement: window,
        target: window
//         which: 65
    };
    baseEvent.key = key;
    baseEvent.code = 'Key' + key.toUpperCase();
    var keyCode = key.charCodeAt(0) - 32; // This only works for ASCII letters
    // Couple of specials for testing:
    if (key == ':') { baseEvent.code = "Semicolon"; baseEvent.shiftKey = true; keyCode = 186; }
    if (key == 'space') { baseEvent.code = "Space"; keyCode = 32; }
    if (key == '!') { baseEvent.code = "Digit1"; baseEvent.shiftKey = true; keyCode = 49; }
    var newEvent = new KeyboardEvent(type, baseEvent);
    // For some reason Webkit-based browsers don't let you set the keyCode/which ahead of time so we have to do this:
    delete newEvent.keyCode;
    delete newEvent.which;
    Object.defineProperty(newEvent, "keyCode", {"value" : keyCode});
    Object.defineProperty(newEvent, "which", {"value" : keyCode})
    return newEvent;
}
