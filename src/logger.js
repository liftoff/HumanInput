
import { noop, isFunction } from './utils';

const levels = {
    40: 'ERROR', 30: 'WARNING', 20: 'INFO', 10: 'DEBUG', // Forward
    'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10 // Reverse
};

export class Logger {

    constructor(lvl, prefix) {
        var self = this;
        self.prefix = prefix;
        self.setLevel(lvl);
        self.writeErr = self.fallback;
        self.writeWarn = self.fallback;
        self.writeInfo = self.fallback;
        self.writeDebug = self.fallback;
        if (isFunction(window.console.error)) { self.writeErr = window.console.error; }
        if (isFunction(window.console.warn)) { self.writeWarn = window.console.warn; }
        if (isFunction(window.console.info)) { self.writeInfo = window.console.info; }
        if (isFunction(window.console.debug)) { self.writeDebug = window.console.debug; }
    }

    setLevel(level) {
        var self = this;
        level = level.toUpperCase();
        self.error = self.write.bind(self, 40);
        self.warn = self.write.bind(self, 30);
        self.info = self.write.bind(self, 20);
        self.debug = self.write.bind(self, 10);
        self.logLevel = level;
        if (isNaN(level)) { self.logLevel = level = levels[level]; }
        // These conditionals are just a small performance optimization:
        if (level > 40) { self.error = noop; }
        if (level > 30) { self.warn = noop; }
        if (level > 20) { self.info = noop; }
        if (level > 10) { self.debug = noop; }
    }

    fallback(level) {
        var args = Array.from(arguments);
        args[0] = this.prefix + levels[level] + ' ' + args[0];
        if (isFunction(window.console.log)) {
            window.console.log.apply(window.console, args);
        }
    }

    write(level) {
        var self = this;
        var args = Array.prototype.slice.call(arguments, 1);
        if (self.prefix.length) { args.unshift(self.prefix); }
        if (level === 40 && self.logLevel <= 40) {
            self.writeErr.apply(window.console, args);
        } else if (level === 30 && self.logLevel <= 30) {
            self.writeWarn.apply(window.console, args);
        } else if (level === 20 && self.logLevel <= 20) {
            self.writeInfo.apply(window.console, args);
        } else if (level === 10 && self.logLevel <= 10) {
            self.writeDebug.apply(window.console, args);
        }
    }

};
