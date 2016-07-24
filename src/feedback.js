

/**
 * feedback.js - HumanInput Feedback Plugin: Provides visual, audio, and vibration feedback for HumanInput events.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/feedback.js
 * @license Apache-2.0
 */

import HumanInput from './humaninput';
import { getNode } from './utils';

const AudioContext = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
const AllModifiers = ['OS', 'OSLeft', 'OSRight', 'Control', 'ControlLeft', 'ControlRight', 'Alt', 'AltLeft', 'AltRight', 'Shift', 'ShiftLeft', 'ShiftRight', '⇧'];
const defaultVisualEvents = ['keydown', 'dblclick', 'wheel:down', 'wheel:up', 'wheel:left', 'wheel:right', 'pointer:left:down', 'pointer:middle:down', 'pointer:right:down', 'scroll:up', 'scroll:down', 'scroll:left', 'scroll:right'];
const defaultAudioEvents = ['keydown', 'dblclick', 'wheel:down', 'wheel:up', 'wheel:left', 'wheel:right', 'pointer:down'];
const defaultVibrationEvents = ['pointer:down'];

var topOrBottom = 'top';
var leftOrRight = 'right';

// NOTE: This is only meant to be a fallback.  Use your own element and styles!
const feedbackStyle = `
#hi_feedback {
    position: fixed;
    ${topOrBottom}: 1em;
    ${leftOrRight}: 1em;
    align-items: flex-end;
    justify-content: flex-end;
    font-size: 2em;
    display: flex;
    flex-flow: row wrap;
    width: 8em;
}

#hi_feedback .event {
    transition: all .5s ease-in-out;
    transform-origin: right bottom;
    opacity: 0;
    border: black .15rem solid;
    border-radius: .2em;
    text-align: center;
    padding: .2rem;
    min-width: 1em;
    padding: .2em;
    background-color: rgba(0,0,0,0.7);
    color: #fff;
    z-index: 9999;
}
`;
const svgcircle = '<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" />';

function beep(ms=50, freq=500, type='sine', gain=0.5) {
    // ms: Milliseconds to play the beep.
    // freq: Frequency of the beep (1-20000 or so).
    // gain: Value between 0 and 1 representing the gain or volume of the beep.
    // sine: The type of wave to generate for the beep.  One of sine, square, sawtooth, or triangle.

    var gainNode = AudioContext.createGain();
    var oscillator = AudioContext.createOscillator();

    oscillator.connect(gainNode);
    gainNode.connect(AudioContext.destination);

    oscillator.frequency.value = freq;
    gainNode.gain.value = gain;
    oscillator.type = type;

    oscillator.start();
    setTimeout(function() { oscillator.stop() }, (ms ? ms : 50));
};

export class FeedbackPlugin {

    constructor(HI) {
        this.HI = HI;
        this.l = HI.l;
        this.exports = {beep: beep};
        this.vibrationInterval = null;
        return this;
    }

    init(HI) {
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Feedback]');
        this.lastActivity = new Date();
        this.timeout = null;
        // Handle settings
        HI.settings.visualEvents = HI.settings.visualEvents || defaultVisualEvents;
        HI.settings.audioEvents = HI.settings.audioEvents || defaultAudioEvents;
        HI.settings.vibrationEvents = HI.settings.vibrationEvents || defaultVibrationEvents;
        HI.settings.visualFeedback = HI.settings.visualFeedback || false;
        HI.settings.audioFeedback = HI.settings.audioFeedback || false;
        HI.settings.vibrationFeedback = HI.settings.vibrationFeedback || false;
        HI.settings.feedbackClass = HI.settings.feedbackClass || 'event';
        this.feedbackElem = getNode(HI.settings.feedbackElem);
        // Double-check that we didn't already create one
        if (!this.feedbackElem) {
            this.feedbackElem = getNode('#hi_feedback');
        }
        // Now start yer engines!
        if (!this.feedbackElem) {
            HI.settings.feedbackElem = '#hi_feedback';
            // Create a reasonable location (and style) to display visual feedback
            this.feedbackStyle = document.createElement('style');
            this.feedbackStyle.type = 'text/css';
            this.feedbackStyle.appendChild(document.createTextNode(feedbackStyle));
            document.body.appendChild(this.feedbackStyle);
            this.feedbackElem = document.createElement('div');
            this.feedbackElem.id = 'hi_feedback';
            if (HI.elem !== window) { // Try to use the element HumanInput was instantiated on first
                HI.elem.appendChild(this.feedbackElem);
            } else { // Fall back to document.body
                document.body.appendChild(this.feedbackElem);
                // NOTE: We add this element whether visual feedback is enabled or not since it doesn't show anything if empty
            }
        }
        if (HI.settings.visualFeedback) {
            HI.on(HI.settings.visualEvents, this.visualEvent, this);
        }
        if (HI.settings.audioFeedback) {
            HI.on(HI.settings.audioEvents, this.audioEvent, this);
        }
        if (HI.settings.vibrationFeedback) {
            HI.on(HI.settings.vibrationEvents, this.vibrationEvent, this);
            HI.settings.vibrationEvents.forEach((event) => {
                if (event.endsWith('down')) {
                    // Add a corresponding :up event to stop vibration
                    HI.on(event.split('down', 1)[0] + 'up', this.stopVibration, this);
                }
            });
        }
        return this;
    }

    containsModifiers(item, index, arr) {
        return AllModifiers.includes(item);
    }

    visualEvent(e, ...args) {
    // Shows the just-triggered key/event in the feedbackElem (with lots of formatting and checks to ensure we display the most human-friendly event as possible)
        var event = this.HIEvent,
            clipboardEvents = ['cut', 'copy', 'paste', 'select'],
            downEvents = HI.getDown(),
            eventElem = document.createElement('div');
        eventElem.classList.add(this.HI.settings.feedbackClass);
        if (clipboardEvents.includes(e.type) && args.length) {
            eventElem.innerHTML = event + ':' + args[0];
        } else if (e.type == 'keydown') {
            event = args[0]; // Use the 'key' as the event name instead of 'keydown:<key>'
            eventElem.innerHTML = event;
            if (AllModifiers.includes(event) && !downEvents.includes('-')) {
                // This is just to demonstrate that HumanInput knows the difference between the left and right variants
                eventElem.innerHTML = event.toLowerCase(); // e.g. 'shiftleft'
            } else if (HI.state.down.some(this.containsModifiers)) {
                eventElem.innerHTML = downEvents; // e.g. 'ctrl-shift-i'
            }
        } else if (event.startsWith('pointer')) {
            var clickElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            clickElem.setAttribute("width", 100);
            clickElem.setAttribute("height", 100);
            clickElem.style.position = 'fixed';
            clickElem.style.top = (e.clientY - 50) + 'px';
            clickElem.style.left = (e.clientX - 50) + 'px';
            clickElem.style.transition = 'all .33s ease-out';
            clickElem.style.transform = 'scale(0.1)';
            clickElem.style.zIndex = 10000;
            clickElem.innerHTML = svgcircle;
            document.body.appendChild(clickElem);
            setTimeout(function() {
                clickElem.style.transform = 'scale(2)';
                clickElem.style.opacity = 0;
                setTimeout(function() {
                    clickElem.parentNode.removeChild(clickElem);
                }, 500);
            }, 10);
            // Remove the :down part of each event (if present)
            if (event.includes(':down')) {
                event = event.substr(0, event.length-5);
            }
            eventElem.innerHTML = event;
        } else {
            if (downEvents.length) {
                eventElem.innerHTML = downEvents;
            } else {
                eventElem.innerHTML = event;
            }
        }
        // Fade it out all nice:
        eventElem.style.opacity = 1;
        this.feedbackElem.appendChild(eventElem);
        setTimeout(function() {
            // ...then fade it out all nice:
            eventElem.style.opacity = 0;
            showEventTimeout = setTimeout(function() {
                eventElem.parentNode.removeChild(eventElem);
            }, 500);
        }, 1000);
    }

    audioEvent(e, ...args) {
        beep(33, 500, 'triangle');
    }

    startVibration() {
        navigator.vibrate(150); // Add a little bit of overlap so the vibration is smooth
    }

    stopVibration() {
        clearInterval(this.vibrationInterval);
        navigator.vibrate(0);
    }

    vibrationEvent(e, ...args) {
        navigator.vibrate(150);
        clearInterval(this.vibrationInterval);
        this.vibrationInterval = setInterval(this.startVibration, 100);
    }
}

HumanInput.plugins.push(FeedbackPlugin);
