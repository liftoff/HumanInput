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
        global.utils = mod.exports;
    }
})(this, function (exports, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.isArray = exports.toString = undefined;
    exports.noop = noop;
    exports.getLoggingName = getLoggingName;
    exports.getNode = getNode;
    exports.normEvents = normEvents;
    exports.handlePreventDefault = handlePreventDefault;
    exports.seqSlicer = seqSlicer;
    exports.cloneArray = cloneArray;
    exports.arrayCombinations = arrayCombinations;
    exports.isFunction = isFunction;
    exports.isString = isString;
    exports.partial = partial;
    exports.debounce = debounce;
    exports.isEqual = isEqual;
    exports.isUpper = isUpper;
    exports.sortEvents = sortEvents;
    exports.normCombo = normCombo;
    exports.addListeners = addListeners;
    exports.removeListeners = removeListeners;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    // Utility functions
    function noop(a) {
        return a;
    };

    function getLoggingName(obj) {
        // Try to get a usable name/prefix for the default logger
        var name = '';
        if (obj.name) {
            name += " " + obj.name;
        } else if (obj.id) {
            name += " " + obj.id;
        } else if (obj.nodeName) {
            name += " " + obj.nodeName;
        }
        return '[HI' + name + ']';
    };

    function getNode(nodeOrSelector) {
        if (typeof nodeOrSelector == 'string') {
            var result = document.querySelector(nodeOrSelector);
            return result;
        }
        return nodeOrSelector;
    };

    function normEvents(events) {
        // Converts events to an array if it's a single event (a string)
        if (isString(events)) {
            return [events];
        }
        return events;
    };

    function handlePreventDefault(e, results) {
        // Just a DRY method
        // If any of the 'results' are false call preventDefault()
        if (results.includes(false)) {
            e.preventDefault();
            return true; // Reverse the logic meaning, "default was prevented"
        }
    };

    function seqSlicer(seq) {
        /**:utils.seqSlicer(seq)
         Returns all possible combinations of sequence events given a string of keys.  For example::
             'a b c d'
         Would return:
             ['a b c d', 'b c d', 'c d']
         .. note:: There's no need to emit 'a b c' since it would have been emitted before the 'd' was added to the sequence.
        */
        var events = [],
            i,
            s,
            joined;
        // Split by spaces but ignore spaces inside quotes:
        seq = seq.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
        for (i = 0; i < seq.length - 1; i++) {
            s = seq.slice(i);
            joined = s.join(' ');
            if (!events.includes(joined)) {
                events.push(joined);
            }
        }
        return events;
    };

    function cloneArray(arr) {
        // Performs a deep copy of the given *arr*
        if (isArray(arr)) {
            var copy = arr.slice(0);
            for (var i = 0; i < copy.length; i++) {
                copy[i] = cloneArray(copy[i]);
            }
            return copy;
        } else {
            return arr;
        }
    };

    function arrayCombinations(arr, separator) {
        var result = [];
        if (arr.length === 1) {
            return arr[0];
        } else {
            var remaining = arrayCombinations(arr.slice(1), separator);
            for (var i = 0; i < remaining.length; i++) {
                for (var n = 0; n < arr[0].length; n++) {
                    result.push(arr[0][n] + separator + remaining[i]);
                }
            }
            return result;
        }
    };
    var toString = exports.toString = Object.prototype.toString;
    function isFunction(obj) {
        return toString.call(obj) == '[object Function]';
    };
    function isString(obj) {
        return toString.call(obj) == '[object String]';
    };
    var isArray = exports.isArray = Array.isArray;

    function partial(func) {
        var args = Array.from(arguments).slice(1);
        return function () {
            return func.apply(this, args.concat(Array.from(arguments)));
        };
    };

    function debounce(func, wait, immediate) {
        var timeout, result;
        return function () {
            var context = this;
            var args = arguments;
            var later = function later() {
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

    function isEqual(x, y) {
        return x && y && (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && (typeof y === 'undefined' ? 'undefined' : _typeof(y)) === 'object' ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce(function (isEqual, key) {
            return isEqual && isEqual(x[key], y[key]);
        }, true) : x === y;
    };

    function isUpper(str) {
        if (str == str.toUpperCase() && str != str.toLowerCase()) {
            return true;
        }
    };

    function sortEvents(events) {
        /**:utils.sortEvents(events)
         Sorts and returns the given *events* array (which is normally just a copy of ``this.state.down``) according to HumanInput's event sorting rules.
        */
        var priorities = _constants.MODPRIORITY;
        // Basic (case-insensitive) lexicographic sorting first
        events.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // Now sort by length
        events.sort(function (a, b) {
            return b.length - a.length;
        });
        // Now apply our special sorting rules
        events.sort(function (a, b) {
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a in priorities) {
                if (b in priorities) {
                    if (priorities[a] > priorities[b]) {
                        return -1;
                    } else if (priorities[a] < priorities[b]) {
                        return 1;
                    } else {
                        return 0;
                    }
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

    function normCombo(event) {
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
        var ctrlCheck = function ctrlCheck(key) {
            if (key == 'control') {
                // This one is simpler than the others
                return _constants.ControlKeyEvent;
            }
            return key;
        };
        var altCheck = function altCheck(key) {
            for (var j = 0; j < _constants.AltAltNames.length; j++) {
                if (key == _constants.AltAltNames[j]) {
                    return _constants.AltKeyEvent;
                }
            }
            return key;
        };
        var osCheck = function osCheck(key) {
            for (var j = 0; j < _constants.AltOSNames.length; j++) {
                if (key == _constants.AltOSNames[j]) {
                    return _constants.OSKeyEvent;
                }
            }
            return key;
        };
        // First ensure all the key names are consistent
        for (var i = 0; i < events.length; i++) {
            events[i] = events[i].toLowerCase();
            events[i] = ctrlCheck(events[i]);
            events[i] = altCheck(events[i]);
            events[i] = osCheck(events[i]);
        }
        // Now sort them
        sortEvents(events);
        return events.join('-');
    };

    function addListeners(elem, events, func, useCapture) {
        /**:HumanInput.addListeners()
         Calls ``addEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``addEventListener()``.
        */
        events.forEach(function (event) {
            elem.addEventListener(event, func, useCapture);
        });
    }

    function removeListeners(elem, events, func, useCapture) {
        /**:HumanInput.removeListeners()
         Calls ``removeEventListener()`` on the given *elem* for each event in the given *events* array passing it *func* and *useCapture* which are the same arguments that would normally be passed to ``removeEventListener()``.
        */
        events.forEach(function (event) {
            elem.removeEventListener(event, func, useCapture);
        });
    }
});