/**
 * idle.js - HumanInput Idle Plugin: Adds support for gracefully (low-overhead) detecting if the user is idle.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/idle.js
 * @license Apache-2.0
 */

import HumanInput from './humaninput';

// Add ourselves to the default listen events
HumanInput.defaultListenEvents.push('idle');

function convertTime(timeStr) {
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

export class IdlePlugin {

    constructor(HI) {
        this.HI = HI; // Since we're using the "total prototype" method below
        this.l = HI.l;
        // Exports (these will be applied to the current instance of HumanInput)
        this.startIdleChecker = this.startIdleChecker.bind(this);
        this.stopIdleChecker = this.stopIdleChecker.bind(this);
        this.mouseMoveCheck = this.mouseMoveCheck.bind(this);
        this.resetTimeout = this.resetTimeout.bind(this)
        this.idleCheck = this.idleCheck.bind(this);
        this.exports = {
            startIdleChecker: this.startIdleChecker,
            stopIdleChecker: this.stopIdleChecker
        };
        return this;
    }

    init(HI) {
        var timeout, checkInterval;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Idle]');
        this.lastActivity = new Date();
        this.timeout = null;
        // Handle settings
        HI.settings.autostartIdle = HI.settings.autostartIdle || true; // Autostart by default
        timeout = HI.settings.idleTimeout || '5m'; // 5 minutes
        this.idleTimeout = convertTime(timeout);
        checkInterval = HI.settings.idleCheckInterval || '5s'; // Check every 5s by default
        this.idleCheckInterval = convertTime(checkInterval);
        // Now start yer engines!
        if (HI.settings.listenEvents.includes('idle')) {
            if (HI.settings.autostartIdle) {
                // Setup our event listeners
                this.startIdleChecker();
            }
        }
        return this;
    }

    mouseMoveCheck() {
        // This function gets attached to the 'mousemove' event on the window.  It will remove itthis immediately if run and re-add itthis after idleCheckInterval.  In this way it is able to keep a reasonable amount of idle-checking without adding much CPU overhead (especially for gaming mice).
        clearTimeout(this.mouseMoveTimeout);
        this.lastActivity = new Date();
        // HumanInput doesn't listen for mousemove events by default so we'll manage our own
        window.removeEventListener('mousemove', this.mouseMoveCheck, true);
        // Also remove this in case we are resuming from a previous idle state:
        window.removeEventListener('mousemove', this.resetTimeout, true);
        this.mouseMoveTimeout = setTimeout(() => {
            window.addEventListener('mousemove', this.mouseMoveCheck, true);
        }, this.idleCheckInterval);
    }

    resetTimeout() {
        // Reset the timeout and start it back up again
        this.log.debug(this.l("Activity detected; resetting idle timeout"));
        this.mouseMoveCheck(); // Start it up (if not already); also resets our lastActivity
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.idleCheck, this.idleCheckInterval);
    }

    startIdleChecker() {
        // Attaches resetTimeout() to the 'click', 'keydown', and 'scroll' HumanInput events and also a function once('idle') that stops checking for idle timeouts (to save resources).
        this.HI.on(['click', 'keydown', 'scroll'], this.resetTimeout);
        this.resetTimeout();
        // Stop checking for idleness if we trigger the 'idle' event:
        this.HI.on('idle', () => {
            this.stopIdleChecker();
            // Make sure we resume checking when the user returns
            this.HI.once(['click', 'keydown', 'scroll'], this.resetTimeout);
            window.addEventListener('mousemove', this.resetTimeout, true);
        });
        this.HI.once('hi:reset', this.stopIdleChecker);
    }

    stopIdleChecker() {
        // Stops checking for idle timeouts; removes event listeners and whatnot
        window.removeEventListener('mousemove', this.mouseMoveCheck, true);
        this.HI.off(['click', 'keydown', 'scroll'], this.resetTimeout);
        clearTimeout(this.timeout);
        clearTimeout(this.mouseMoveTimeout);
    }

    idleCheck() {
        // Checks this.lastActivity to see if we've got past this.idleTimeout and triggers the 'idle' event if so.
        clearTimeout(this.timeout);
        if (Date.now() - this.lastActivity.getTime() > this.idleTimeout) {
            this.HI.trigger('idle', this.lastActivity);
        } else {
            // Keep re-checking
            this.timeout = setTimeout(this.idleCheck, this.idleCheckInterval);
        }
    }
}

HumanInput.plugins.push(IdlePlugin);
