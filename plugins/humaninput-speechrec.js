/**
 * humaninput-speechrec.js - HumanInput Speech Recognition Plugin: Adds support for speech recognition to HumanInput.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */


(function() {
"use strict";

// Add ourselves to the default listen events since we won't start speech unless explicitly told to do so (won't be used otherwise)
HumanInput.defaultListenEvents.push('speech');

var speechEvent = (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    window.oSpeechRecognition);

var SpeechRecPlugin = function(HI) {
    var self = this;
    self.__name__ = 'SpeechRecPlugin';
    self.exports = {};
    self._rtSpeech = []; // Tracks real-time speech so we don't repeat ourselves
    self._rtSpeechPop = function() {
        // Pop out the first item (oldest)
        self._rtSpeech.reverse();
        self._rtSpeech.pop();
        self._rtSpeech.reverse();
    };
    self._rtSpeechTimer = null;
    self.startSpeechRec = function() {
        self._recognition = new webkitSpeechRecognition();
        self.log.debug(HI.l('Starting speech recognition'), self._recognition);
        self._recognition.lang = HI.settings.speechLang || navigator.language || "en-US";
        self._recognition.continuous = true;
        self._recognition.interimResults = true;
        self._recognition.onresult = function(e) {
            var i, event = "speech", transcript;
            for (i = e.resultIndex; i < e.results.length; ++i) {
                transcript = e.results[i][0].transcript.trim();
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
                    if (self._rtSpeech.indexOf(event) == -1) {
                        self._rtSpeech.push(event);
                        HI._addDown(event);
                        HI._handleDownEvents(e, transcript);
// NOTE: Real-time speech events don't go into the sequence buffer because it would
//       fill up with garbage too quickly and mess up the ordering of other sequences.
                        HI._removeDown(event);
                    }
                }
            }
        };
        self._started = true;
        self._recognition.start();
    };
    self.stopSpeechRec = function() {
        self.log.debug(HI.l('Stopping speech recognition'));
        self._recognition.stop();
        self._started = false;
    };
    return self;
};

SpeechRecPlugin.prototype.init = function(HI) {
    var self = this;
    self.log = new HI.logger(HI.settings.logLevel || 'INFO', '[HI Speech]');
    self.log.debug(HI.l("Initializing Speech Recognition Plugin"), self);
    HI.settings.autostartSpeech = HI.settings.autostartSpeech || false; // Don't autostart by default
    if (HI.settings.listenEvents.indexOf('speech') != -1) {
        if (speechEvent) {
            if (HI.settings.autostartSpeech) {
                self.startSpeechRec();
            }
            HI.on('document:hidden', function() {
                if (self._started) {
                    self.stopSpeechRec();
                }
            });
            HI.on('document:visible', function() {
                if (!self._started && HI.settings.autostartSpeech) {
                    self.startSpeechRec();
                }
            });
        } else { // Disable the speech functions
            self.startSpeechRec = HI.noop;
            self.stopSpeechRec = HI.noop;
        }
    }
    // Exports (these will be applied to the current instance of HumanInput)
    self.exports.startSpeechRec = self.startSpeechRec;
    self.exports.stopSpeechRec = self.stopSpeechRec;
    return self;
};

HumanInput.plugins.push(SpeechRecPlugin);

}).call(this);
