/**
 * speechrec.js - HumanInput Speech Recognition Plugin: Adds support for speech recognition.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/speechrec.js
 * @license Apache-2.0
 */

import { noop } from './utils';
import HumanInput from './humaninput';

// Add ourselves to the default listen events since we won't start speech unless explicitly told to do so (won't be used otherwise)
HumanInput.defaultListenEvents.push('speech');

var speechEvent = (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    window.oSpeechRecognition);

export class SpeechRecPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports = {
            startSpeechRec: this.startSpeechRec.bind(this),
            stopSpeechRec: this.stopSpeechRec.bind(this)
        };
        this.HI = HI;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI SpeechRec]');
        this._rtSpeech = []; // Tracks real-time speech so we don't repeat ourselves
        this._rtSpeechTimer = null;
        return this;
    }

    init() {
        var HI = this.HI;
        var settings = HI.settings;
        settings.autostartSpeech = settings.autostartSpeech || false; // Don't autostart by default
        if (settings.listenEvents.includes('speech')) {
            if (speechEvent) {
                if (settings.autostartSpeech) {
                    this.startSpeechRec();
                }
                HI.on('document:hidden', () => {
                    if (this._started) {
                        this.stopSpeechRec();
                    }
                });
                HI.on('document:visible', () => {
                    if (!this._started && settings.autostartSpeech) {
                        this.startSpeechRec();
                    }
                });
            } else { // Disable the speech functions
                this.startSpeechRec = noop;
                this.stopSpeechRec = noop;
            }
        }
        return this;
    }

    startSpeechRec() {
        var HI = this.HI;
        this._recognition = new speechEvent();
        this.log.debug(HI.l('Starting speech recognition'), this._recognition);
        this._recognition.lang = HI.settings.speechLang || navigator.language || "en-US";
        this._recognition.continuous = true;
        this._recognition.interimResults = true;
        this._recognition.onresult = (e) => {
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                let event = "speech";
                let transcript = e.results[i][0].transcript.trim();
                if (e.results[i].isFinal) {
                    // Make sure we trigger() just the 'speech' event first so folks can use with nonspecific on() events (e.g. to do transcription)
                    HI._addDown(event);
                    HI._handleDownEvents(e, transcript);
                    HI._removeDown(event);
                    // Now we craft the event with the transcript...
// NOTE: We have to replace - with – (en dash aka \u2013) because strings like 'real-time' would mess up event combos
                    event += ':"' +  transcript.replace(/-/g, '–') + '"';
                    HI._addDown(event);
                    HI._handleDownEvents(e, transcript);
                    HI._handleSeqEvents();
                    HI._removeDown(event);
                } else {
                    // Speech recognition that comes in real-time gets the :rt: designation:
                    event += ':rt';
                    // Fire basic 'speech:rt' events so the status of detection can be tracked (somewhat)
                    HI._addDown(event);
                    HI._handleDownEvents(e, transcript);
                    HI._removeDown(event);
                    event += ':"' +  transcript.replace(/-/g, '–') + '"';
                    if (this._rtSpeech.indexOf(event) == -1) {
                        this._rtSpeech.push(event);
                        HI._addDown(event);
                        HI._handleDownEvents(e, transcript);
// NOTE: Real-time speech events don't go into the sequence buffer because it would
//       fill up with garbage too quickly and mess up the ordering of other sequences.
                        HI._removeDown(event);
                    }
                }
            }
        };
        this._started = true;
        this._recognition.start();
    }

    stopSpeechRec() {
        var HI = this.HI;
        this.log.debug(HI.l('Stopping speech recognition'));
        this._recognition.stop();
        this._started = false;
    }

}

HumanInput.plugins.push(SpeechRecPlugin);

