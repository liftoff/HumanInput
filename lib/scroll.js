(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils', './humaninput'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils'), require('./humaninput'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utils, global.humaninput);
        global.scroll = mod.exports;
    }
})(this, function (exports, _utils, _humaninput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ScrollPlugin = undefined;

    var _humaninput2 = _interopRequireDefault(_humaninput);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    _humaninput2.default.defaultListenEvents.push('scroll');

    var ScrollPlugin = exports.ScrollPlugin = function () {
        function ScrollPlugin(HI) {
            _classCallCheck(this, ScrollPlugin);

            // HI == current instance of HumanInput
            this.HI = HI;
            HI._scroll = (0, _utils.debounce)(this._scroll.bind(HI), 50);
            HI.on('hi:resetstates', this._resetStates, HI);
        }

        ScrollPlugin.prototype.init = function init(HI) {
            var state = HI.state;
            state.scrollX = 0; // Tracks the distance scrolled in 'scroll' events
            state.scrollY = 0; // Ditto
            return this;
        };

        ScrollPlugin.prototype._resetStates = function _resetStates() {
            this.state.scrollX = 0;
            this.state.scrollY = 0;
        };

        ScrollPlugin.prototype._scroll = function _scroll(e) {
            // NOTE:  Intentionally not adding scroll events to the sequence buffer since a whole lot of them can be generated in a single scroll
            var results,
                scrollXDiff,
                scrollYDiff,
                state = this.state,
                target = e.target,
                scrollX = target.scrollLeft,
                scrollY = target.scrollTop;
            if (target.scrollingElement) {
                // If it's available use it
                scrollX = target.scrollingElement.scrollLeft;
                scrollY = target.scrollingElement.scrollTop;
            }
            scrollXDiff = scrollX - state.scrollX;
            scrollYDiff = scrollY - state.scrollY;
            if (scrollYDiff === 0 && scrollXDiff === 0) {
                // Silly browser fired a scroll event when nothing actually moved.  WHY DO THEY DO THIS?!?
                return;
            }
            results = this._triggerWithSelectors(e.type, [e, { x: scrollXDiff, y: scrollYDiff }]);
            // NOTE:  this.state.scrollX and this.state.scrollY just track the previous position; not the diff
            if (scrollX !== undefined && scrollX !== state.scrollX) {
                scrollXDiff = Math.abs(scrollXDiff);
                if (scrollX > state.scrollX) {
                    results = results.concat(this._triggerWithSelectors(e.type + ':right', [e, scrollXDiff]));
                } else {
                    results = results.concat(this._triggerWithSelectors(e.type + ':left', [e, scrollXDiff]));
                }
                state.scrollX = scrollX;
            }
            if (scrollY !== undefined && scrollY !== state.scrollY) {
                scrollYDiff = Math.abs(scrollYDiff);
                if (scrollY > state.scrollY) {
                    results = results.concat(this._triggerWithSelectors(e.type + ':down', [e, scrollYDiff]));
                } else {
                    results = results.concat(this._triggerWithSelectors(e.type + ':up', [e, scrollYDiff]));
                }
                state.scrollY = scrollY;
            }
            (0, _utils.handlePreventDefault)(e, results);
        };

        return ScrollPlugin;
    }();

    _humaninput2.default.plugins.push(ScrollPlugin);
});