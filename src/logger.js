
import { isFunction } from 'lodash-es';
import { noop } from './utils';

const levels = {
    40: 'ERROR', 30: 'WARNING', 20: 'INFO', 10: 'DEBUG', // Forward
    'ERROR': 40, 'WARNING': 30, 'INFO': 20, 'DEBUG': 10 // Reverse
};

export class Logger {

    constructor(lvl, prefix) {
        this.prefix = prefix;
        this.setLevel(lvl);
        this.writeErr = this.fallback;
        this.writeWarn = this.fallback;
        this.writeInfo = this.fallback;
        this.writeDebug = this.fallback;
        if (isFunction(window.console.error)) { this.writeErr = window.console.error; }
        if (isFunction(window.console.warn)) { this.writeWarn = window.console.warn; }
        if (isFunction(window.console.info)) { this.writeInfo = window.console.info; }
        if (isFunction(window.console.debug)) { this.writeDebug = window.console.debug; }
    }

    setLevel(level) {
        level = level.toUpperCase();
        this.error = this.write.bind(this, 40);
        this.warn = this.write.bind(this, 30);
        this.info = this.write.bind(this, 20);
        this.debug = this.write.bind(this, 10);
        this.logLevel = level;
        if (isNaN(level)) { this.logLevel = level = levels[level]; }
        // These conditionals are just a small performance optimization:
        if (level > 40) { this.error = noop; }
        if (level > 30) { this.warn = noop; }
        if (level > 20) { this.info = noop; }
        if (level > 10) { this.debug = noop; }
    }

    fallback(level) {
        var args = Array.from(arguments);
        args[0] = this.prefix + levels[level] + ' ' + args[0];
        if (isFunction(window.console.log)) {
            window.console.log.apply(window.console, args);
        }
    }

    write(level) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (this.prefix.length) { args.unshift(this.prefix); }
        if (level === 40 && this.logLevel <= 40) {
            this.writeErr.apply(window.console, args);
        } else if (level === 30 && this.logLevel <= 30) {
            this.writeWarn.apply(window.console, args);
        } else if (level === 20 && this.logLevel <= 20) {
            this.writeInfo.apply(window.console, args);
        } else if (level === 10 && this.logLevel <= 10) {
            this.writeDebug.apply(window.console, args);
        }
    }

};
