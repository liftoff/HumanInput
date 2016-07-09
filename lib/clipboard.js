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
        global.clipboard = mod.exports;
    }
})(this, function (exports, _utils, _humaninput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ClipboardPlugin = undefined;

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

    _humaninput2.default.defaultListenEvents = _humaninput2.default.defaultListenEvents.concat(['cut', 'copy', 'paste', 'select']);

    var ClipboardPlugin = exports.ClipboardPlugin = function () {
        function ClipboardPlugin(HI) {
            _classCallCheck(this, ClipboardPlugin);

            // HI == current instance of HumanInput
            this.HI = HI;
            HI._clipboard = this._clipboard.bind(HI);
            this._paste = this._clipboard;
            this._copy = this._clipboard;
            this._cut = this._clipboard;
            HI._select = this._select.bind(HI);
            this._input = this._select;
        }

        ClipboardPlugin.prototype.init = function init(HI) {
            return this; // So it gets logged as being initialized
        };

        ClipboardPlugin.prototype._clipboard = function _clipboard(e) {
            var data;
            var event = e.type + ':"';
            if (this.filter(e)) {
                if (window.clipboardData) {
                    // IE
                    data = window.clipboardData.getData('Text');
                } else if (e.clipboardData) {
                    // Standards-based browsers
                    data = e.clipboardData.getData('text/plain');
                }
                if (!data && (e.type == 'copy' || e.type == 'cut')) {
                    data = this.getSelText();
                }
                if (data) {
                    // First trigger a generic event so folks can just grab the copied/cut/pasted data
                    var results = this._triggerWithSelectors(e.type, [e, data]);
                    // Now trigger a more specific event that folks can match against
                    results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                    (0, _utils.handlePreventDefault)(e, results);
                }
            }
        };

        ClipboardPlugin.prototype._select = function _select(e) {
            // Handles triggering 'select' *and* 'input' events (since they're so similar)
            var event = e.type + ':"';
            if (e.type == 'select') {
                var data = this.getSelText();
            } else if (e.type == 'input') {
                var data = e.data || e.target.value;
            }
            if (this.filter(e)) {
                var results = this._triggerWithSelectors(e.type, [e, data]);
                if (data) {
                    results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                    (0, _utils.handlePreventDefault)(e, results);
                }
            }
        };

        return ClipboardPlugin;
    }();

    _humaninput2.default.plugins.push(ClipboardPlugin);
});