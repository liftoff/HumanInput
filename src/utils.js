
import { OSKeyEvent, AltKeyEvent, ControlKeyEvent, AltOSNames, AltAltNames, MODPRIORITY } from './constants';

// Utility functions
export function noop(a) { return a; };

export function getLoggingName(obj) {
    // Try to get a usable name/prefix for the default logger
    var name = '';
    if (obj.name) { name += " " + obj.name; }
    else if (obj.id) { name += " " + obj.id; }
    else if (obj.nodeName) { name += " " + obj.nodeName; }
    return '[HI' + name + ']';
};

export function getNode(nodeOrSelector) {
    if (typeof nodeOrSelector == 'string') {
        var result = document.querySelector(nodeOrSelector);
        return result;
    }
    return nodeOrSelector;
};

export function normEvents(events) { // Converts events to an array if it's a single event (a string)
    if (isString(events)) { return [events]; }
    return events;
};

export function handlePreventDefault(e, results) { // Just a DRY method
    // If any of the 'results' are false call preventDefault()
    if (results.includes(false)) {
        e.preventDefault();
        return true; // Reverse the logic meaning, "default was prevented"
    }
};

export function seqSlicer(seq) {
    /**:utils.seqSlicer(seq)

    Returns all possible combinations of sequence events given a string of keys.  For example::

        'a b c d'

    Would return:

        ['a b c d', 'b c d', 'c d']

    .. note:: There's no need to emit 'a b c' since it would have been emitted before the 'd' was added to the sequence.
    */
    var events = [], i, s, joined;
    // Split by spaces but ignore spaces inside quotes:
    seq = seq.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
    for (i=0; i < seq.length-1; i++) {
        s = seq.slice(i);
        joined = s.join(' ');
        if (!events.includes(joined)) {
            events.push(joined);
        }
    }
    return events;
};

export function cloneArray(arr) {
    // Performs a deep copy of the given *arr*
    if (isArray(arr)) {
        let copy = arr.slice(0);
        for(let i = 0; i < copy.length; i++) {
            copy[i] = cloneArray(copy[i]);
        }
        return copy;
    } else {
        return arr;
    }
};

export function arrayCombinations(arr, separator) {
    var result = [];
    if (arr.length === 1) {
        return arr[0];
    } else {
        var remaining = arrayCombinations(arr.slice(1), separator);
        for (let i = 0; i < remaining.length; i++) {
            for (let n = 0; n < arr[0].length; n++) {
                result.push(arr[0][n] + separator + remaining[i]);
            }
        }
        return result;
    }
};
export var toString = Object.prototype.toString;
export function isFunction(obj) { return toString.call(obj) == '[object Function]'; };
export function isString(obj) { return toString.call(obj) == '[object String]'; };
export var isArray = Array.isArray;

export function partial(func) {
    var args = Array.from(arguments).slice(1);
    return function() {
        return func.apply(this, args.concat(Array.from(arguments)));
    };
};

export function debounce(func, wait, immediate) {
    var timeout, result;
    return function() {
        var context = this;
        var args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
        }
        return result;
    };
};

export function isEqual(x, y) {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
        (Object.keys(x).length === Object.keys(y).length) && Object.keys(x).reduce(function(isEqual, key) {
            return isEqual && isEqual(x[key], y[key]);
        }, true) : (x === y);
};

export function isUpper(str) {
    if (str == str.toUpperCase() && str != str.toLowerCase()) {
        return true;
    }
};

export function sortEvents(events) {
    /**:utils.sortEvents(events)

    Sorts and returns the given *events* array (which is normally just a copy of ``this.state.down``) according to HumanInput's event sorting rules.
    */
    var priorities = MODPRIORITY;
    // Basic (case-insensitive) lexicographic sorting first
    events.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    // Now sort by length
    events.sort(function (a, b) { return b.length - a.length; });
    // Now apply our special sorting rules
    events.sort(function(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a in priorities) {
            if (b in priorities) {
                if (priorities[a] > priorities[b]) { return -1; }
                else if (priorities[a] < priorities[b]) { return 1; }
                else { return 0; }
            }
            return -1;
        } else if (b in priorities) {
            return 1;
        } else {
            return 0;
        }
    });
    return events;
}

export function normCombo(event) {
    /**:normCombo(event)

    Returns normalized (sorted) event combos (i.e. events with '-').  When given things like, '⌘-Control-A' it would return 'ctrl-os-a'.

    It replaces alternate key names such as '⌘' with their internally-consistent versions ('os') and ensures consistent (internal) ordering using the following priorities:

    1. ctrl
    2. shift
    3. alt
    4. os
    5. length of event name
    6. Lexicographically

    Events will always be sorted in that order.
    */
    var events = event.split('-'); // Separate into parts
    var ctrlCheck = function(key) {
        if (key == 'control') { // This one is simpler than the others
            return ControlKeyEvent;
        }
        return key;
    };
    var altCheck = function(key) {
        for (let j=0; j < AltAltNames.length; j++) {
            if (key == AltAltNames[j]) {
                return AltKeyEvent;
            }
        }
        return key;
    };
    var osCheck = function(key) {
        for (let j=0; j < AltOSNames.length; j++) {
            if (key == AltOSNames[j]) {
                return OSKeyEvent;
            }
        }
        return key;
    };
    // First ensure all the key names are consistent
    for (let i=0; i < events.length; i++) {
        events[i] = events[i].toLowerCase();
        events[i] = ctrlCheck(events[i]);
        events[i] = altCheck(events[i]);
        events[i] = osCheck(events[i]);
    }
    // Now sort them
    sortEvents(events);
    return events.join('-');
};

export function addListeners(elem, events, func, useCapture) {
    /**:HumanInput.addListeners()

    Calls ``addEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``addEventListener()``.
    */
    events.forEach(function(event) {
        elem.addEventListener(event, func, useCapture);
    });
}

export function removeListeners(elem, events, func, useCapture) {
    /**:HumanInput.removeListeners()

    Calls ``removeEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``removeEventListener()``.
    */
    events.forEach(function(event) {
        elem.removeEventListener(event, func, useCapture);
    });
}
