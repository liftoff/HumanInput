/**
 * logger.js - HumanInput Logger: A really nice logging class
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/logger.js
 * @license Apache-2.0
 */

import { noop, isFunction } from './utils';

const console = window.console;
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
        if (isFunction(console.error)) { this.writeErr = console.error; }
        if (isFunction(console.warn)) { this.writeWarn = console.warn; }
        if (isFunction(console.info)) { this.writeInfo = console.info; }
        if (isFunction(console.debug)) { this.writeDebug = console.debug; }
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
        if (isFunction(console.log)) {
            console.log.apply(console, args);
        }
    }

    write(level) {
        var logLevel = this.logLevel;
        var args = Array.from(arguments).slice(1);
        if (this.prefix.length) { args.unshift(this.prefix); }
        if (level === 40 && logLevel <= 40) {
            this.writeErr.apply(console, args);
        } else if (level === 30 && logLevel <= 30) {
            this.writeWarn.apply(console, args);
        } else if (level === 20 && logLevel <= 20) {
            this.writeInfo.apply(console, args);
        } else if (level === 10 && logLevel <= 10) {
            this.writeDebug.apply(console, args);
        }
    }

}
