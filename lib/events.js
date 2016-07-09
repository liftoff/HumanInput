(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utils);
        global.events = mod.exports;
    }
})(this, function (exports, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EventHandler = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var EventHandler = exports.EventHandler = function () {
        function EventHandler(logger) {
            _classCallCheck(this, EventHandler);

            // Built-in aliases
            this.aliases = {
                tap: 'click',
                taphold: 'hold:1500:pointer:left',
                clickhold: 'hold:1500:pointer:left',
                middleclick: 'pointer:middle',
                rightclick: 'pointer:right',
                doubleclick: 'dblclick', // For consistency with naming
                konami: 'up up down down left right left right b a enter',
                portrait: 'window:orientation:portrait',
                landscape: 'window:orientation:landscape',
                hulksmash: 'faceplant',
                twofingertap: 'multitouch:2:tap',
                threefingertap: 'multitouch:3:tap',
                fourfingertap: 'multitouch:4:tap'
            };
            this.events = {};
            this.log = logger; // NOTE: The logger must already be instantiated
            // Handy aliases
            this.one = this.once; // Handy dandy alias so jQuery folks don't get confused =)
            this.emit = this.trigger; // Some people prefer 'emit()'; we can do that!
        }

        EventHandler.prototype._handleAliases = function _handleAliases(event) {
            // DRY function to handle swapping out event aliases and making sure 'shift-' gets added where necessary
            event = this.aliases[event] || event; // Resolve any aliases
            if (event.length === 1 && (0, _utils.isUpper)(event)) {
                // Convert uppercase chars to shift-<key> equivalents
                event = 'shift-' + event;
            }
            return event;
        };

        EventHandler.prototype.on = function on(events, callback, context, times) {
            var _this = this;

            (0, _utils.normEvents)(events).forEach(function (event) {
                if (event.includes(':')) {
                    // Contains a scope (or other divider); we need to split it up to resolve aliases
                    var splitChar = ':';
                } else if (event.includes(' ')) {
                    // It's (likely) a sequence
                    var splitChar = ' ';
                }
                if (splitChar) {
                    // NOTE: This won't hurt anything if we accidentally matched on something in quotes
                    var splitRegex = new RegExp(splitChar + '(?=(?:(?:[^"]*"){2})*[^"]*$)', 'g');
                    var splitEvents = event.split(splitRegex);
                    event = '';
                    for (var i = 0; i < splitEvents.length; i++) {
                        event += _this._handleAliases(splitEvents[i]) + splitChar;
                    }
                    event = event.replace(new RegExp(splitChar + '+$'), ""); // Remove trailing colons
                } else {
                    event = _this._handleAliases(event);
                }
                event = event.toLowerCase(); // All events are normalized to lowercase for consistency
                if (event.includes('-')) {
                    // Combo
                    if (event.includes('->')) {
                        // Pre-sort non-ordered combos
                        event = _this._normCombo(event);
                    }
                }
                // Force an empty object as the context if none given (simplifies things)
                if (!context) {
                    context = {};
                }
                var callList = _this.events[event];
                var callObj = {
                    callback: callback,
                    context: context,
                    times: times
                };
                if (!callList) {
                    callList = _this.events[event] = [];
                }
                callList.push(callObj);
            });
            return this;
        };

        EventHandler.prototype.once = function once(events, callback, context) {
            return this.on(events, callback, context, 1);
        };

        EventHandler.prototype.off = function off(events, callback, context) {
            if (!arguments.length) {
                // Called with no args?  Remove all events:
                this.events = {};
            } else {
                events = events ? (0, _utils.normEvents)(events) : Object.keys(this.events);
                for (var _iterator = events, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var i = _ref;

                    var event = events[i];
                    var callList = this.events[event];
                    if (callList) {
                        var newList = [];
                        if (!context) {
                            if (!callback) {
                                // No context or callback? Just delete the event and be done:
                                delete this.events[event];
                                break;
                            }
                        }
                        for (var n = 0; n < callList.length; n++) {
                            if (callback) {
                                if (callList[n].callback.toString() == callback.toString()) {
                                    // Functions are the same but are the contexts?  Let's check...
                                    if ((context === null || context === undefined) && callList[n].context) {
                                        newList.push(callList[n]);
                                    } else if (!(0, _utils.isEqual)(callList[n].context, context)) {
                                        newList.push(callList[n]);
                                    }
                                } else {
                                    newList.push(callList[n]);
                                }
                            } else if (context && callList[n].context !== context) {
                                newList.push(callList[n]);
                            }
                        }
                        if (!newList.length) {
                            delete this.events[event];
                        } else {
                            this.events[event] = newList;
                        }
                    }
                }
            }
            return this;
        };

        EventHandler.prototype.trigger = function trigger(events) {
            var _this2 = this;

            var results = []; // Did we successfully match and trigger an event?
            var args = Array.from(arguments).slice(1);
            (0, _utils.normEvents)(events).forEach(function (event) {
                event = _this2.aliases[event] || event; // Apply the alias, if any
                event = _this2.eventMap.forward[event] || event; // Apply any event re-mapping
                _this2.log.debug('Triggering:', event, args.length ? args : '');
                if (_this2.recording) {
                    recordedEvents.push(event);
                }
                var callList = _this2.events[event];
                if (callList) {
                    for (var i = 0; i < callList.length; i++) {
                        var callObj = callList[i];
                        if (callObj.context !== window) {
                            // Only update the context with HIEvent if it's not the window (no messing with global namespace!)
                            callObj.context.HIEvent = event;
                        }
                        if (callObj.times) {
                            callObj.times -= 1;
                            if (callObj.times === 0) {
                                _this2.off(event, callObj.callback, callObj.context);
                            }
                        }
                        results.push(callObj.callback.apply(callObj.context || _this2, args));
                    }
                }
            });
            return results;
        };

        _createClass(EventHandler, [{
            key: 'eventCount',
            get: function get() {
                var i = 0;
                for (var item in this.events) {
                    i++;
                }
                return i;
            }
        }]);

        return EventHandler;
    }();
});