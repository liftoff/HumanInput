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
        global.logger = mod.exports;
    }
})(this, function (exports, _utils) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Logger = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var console = window.console;
    var levels = {
        40: 'ERROR', 30: 'WARNING', 20: 'INFO', 10: 'DEBUG', // Forward
        'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10 // Reverse
    };

    var Logger = exports.Logger = function () {
        function Logger(lvl, prefix) {
            _classCallCheck(this, Logger);

            this.prefix = prefix;
            this.setLevel(lvl);
            this.writeErr = this.fallback;
            this.writeWarn = this.fallback;
            this.writeInfo = this.fallback;
            this.writeDebug = this.fallback;
            if ((0, _utils.isFunction)(console.error)) {
                this.writeErr = console.error;
            }
            if ((0, _utils.isFunction)(console.warn)) {
                this.writeWarn = console.warn;
            }
            if ((0, _utils.isFunction)(console.info)) {
                this.writeInfo = console.info;
            }
            if ((0, _utils.isFunction)(console.debug)) {
                this.writeDebug = console.debug;
            }
        }

        Logger.prototype.setLevel = function setLevel(level) {
            level = level.toUpperCase();
            this.error = this.write.bind(this, 40);
            this.warn = this.write.bind(this, 30);
            this.info = this.write.bind(this, 20);
            this.debug = this.write.bind(this, 10);
            this.logLevel = level;
            if (isNaN(level)) {
                this.logLevel = level = levels[level];
            }
            // These conditionals are just a small performance optimization:
            if (level > 40) {
                this.error = _utils.noop;
            }
            if (level > 30) {
                this.warn = _utils.noop;
            }
            if (level > 20) {
                this.info = _utils.noop;
            }
            if (level > 10) {
                this.debug = _utils.noop;
            }
        };

        Logger.prototype.fallback = function fallback(level) {
            var args = Array.from(arguments);
            args[0] = this.prefix + levels[level] + ' ' + args[0];
            if ((0, _utils.isFunction)(console.log)) {
                console.log.apply(console, args);
            }
        };

        Logger.prototype.write = function write(level) {
            var logLevel = this.logLevel;
            var args = Array.from(arguments).slice(1);
            if (this.prefix.length) {
                args.unshift(this.prefix);
            }
            if (level === 40 && logLevel <= 40) {
                this.writeErr.apply(console, args);
            } else if (level === 30 && logLevel <= 30) {
                this.writeWarn.apply(console, args);
            } else if (level === 20 && logLevel <= 20) {
                this.writeInfo.apply(console, args);
            } else if (level === 10 && logLevel <= 10) {
                this.writeDebug.apply(console, args);
            }
        };

        return Logger;
    }();
});