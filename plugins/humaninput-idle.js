/**
 * humaninput-idle.js - HumanInput Idle Plugin: Adds support for gracefully (low-overhead) detecting if the user is idle.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */


(function() {
"use strict";

var window = this;

// endsWith is now part of JavaScript so here's a polyfill for legacy browsers (like IE and Safari!):
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

// Add ourselves to the default listen events
HumanInput.defaultListenEvents.push('idle');

var IdlePlugin = function(HI) {
        var self = this;
        self.HI = HI; // Since we're using the "total prototype" method below
        self.__name__ = 'IdlePlugin';
        self.exports = {};
        return self;
    },
    convertTime = function(timeStr) {
        // Returns a *timeStr* like "20m" in milliseconds (s: seconds, m: minutes, h: hours, d: days, M: months, y: years)
        if (isNaN(timeStr)) {
            var num = parseInt(timeStr.slice(0, -1));
            if (timeStr.endsWith('s')) {
                return num * 1000;
            } else if (timeStr.endsWith('m')) {
                return num * 1000 * 60;
            } else if (timeStr.endsWith('h')) {
                return num * 1000 * 60 * 60;
            } else if (timeStr.endsWith('d')) {
                return num * 1000 * 60 * 60 * 24;
            } else if (timeStr.endsWith('M')) {
                return num * 1000 * 60 * 60 * 24 * 30; // Yeah it's approximate
            } else if (timeStr.endsWith('y')) {
                return num * 1000  * 60 * 60 * 24 * 365; // Sorry, no leap year support!
            } else {
                return parseInt(timeStr); // Fall back to milliseconds
            }
        } else { return timeStr; } // It's already a number; return as-is
    };

IdlePlugin.prototype.init = function(HI) {
    var self = this, timeout, checkInterval;
    self.log = new HI.logger(HI.settings.logLevel || 'INFO', '[HI Idle]');
    self.log.debug(HI.l("Initializing Idle Plugin"), self);
    self.lastActivity = new Date();
    self.timeout = null;
    // Handle settings
    HI.settings.autostartIdle = HI.settings.autostartIdle || true; // Autostart by default
    timeout = HI.settings.idleTimeout || '5m'; // 5 minutes
    self.idleTimeout = convertTime(timeout);
    checkInterval = HI.settings.idleCheckInterval || '5s'; // Check every 5s by default
    self.idleCheckInterval = convertTime(checkInterval);
    self.mouseMoveCheck = function() {
        // This function gets attached to the 'mousemove' event on the window.  It will remove itself immediately if run and re-add itself after idleCheckInterval.  In this way it is able to keep a reasonable amount of idle-checking without adding much CPU overhead (especially for gaming mice).
        clearTimeout(self.mouseMoveTimeout);
        self.lastActivity = new Date();
        // HumanInput doesn't listen for mousemove events by default so we'll manage our own
        window.removeEventListener('mousemove', self.mouseMoveCheck, true);
        // Also remove this in case we are resuming from a previous idle state:
        window.removeEventListener('mousemove', self.resetTimeout, true);
        self.mouseMoveTimeout = setTimeout(function() {
            window.addEventListener('mousemove', self.mouseMoveCheck, true);
        }, self.idleCheckInterval);
    };
    self.resetTimeout = function() {
        // Reset the timeout and start it back up again
        self.log.debug(HI.l("Activity detected; resetting idle timeout"));
        self.mouseMoveCheck(); // Start it up (if not already); also resets our lastActivity
        clearTimeout(self.timeout);
        self.timeout = setTimeout(self.idleCheck, self.idleCheckInterval);
    };
    self.startIdleChecker = function() {
        // Attaches resetTimeout() to the 'click', 'keydown', and 'scroll' HumanInput events and also a function once('idle') that stops checking for idle timeouts (to save resources).
        HI.on(['click', 'keydown', 'scroll'], self.resetTimeout);
        self.resetTimeout();
        // Stop checking for idleness if we trigger the 'idle' event:
        HI.on('idle', function() {
            self.stopIdleChecker();
            // Make sure we resume checking when the user returns
            HI.once(['click', 'keydown', 'scroll'], self.resetTimeout);
            window.addEventListener('mousemove', self.resetTimeout, true);
        });
        HI.once('hi:reset', self.stopIdleChecker);
    };
    self.stopIdleChecker = function() {
        // Stops checking for idle timeouts; removes event listeners and whatnot
        window.removeEventListener('mousemove', self.mouseMoveCheck, true);
        HI.off(['click', 'keydown', 'scroll'], self.resetTimeout);
        clearTimeout(self.timeout);
        clearTimeout(self.mouseMoveTimeout);
    };
    self.idleCheck = function() {
        // Checks self.lastActivity to see if we've got past self.idleTimeout and triggers the 'idle' event if so.
        clearTimeout(self.timeout);
        if (Date.now() - self.lastActivity.getTime() > self.idleTimeout) {
            self.HI.trigger('idle', self.lastActivity);
        } else {
            // Keep re-checking
            self.timeout = setTimeout(self.idleCheck, self.idleCheckInterval);
        }
    };
    // Now start yer engines!
    if (HI.settings.listenEvents.indexOf('idle') != -1) {
        if (HI.settings.autostartIdle) {
            // Setup our event listeners
            self.startIdleChecker();
        }
    }
    // Exports (these will be applied to the current instance of HumanInput)
    self.exports.startIdleChecker = self.startIdleChecker;
    self.exports.stopIdleChecker = self.stopIdleChecker;
    return self;
};



HumanInput.plugins.push(IdlePlugin);

}).call(this);
