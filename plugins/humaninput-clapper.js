/**
 * humaninput-speechrec.js - HumanInput Clapper Plugin: Adds support detecting clap events like "the clapper" (classic)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */


(function() {
"use strict";

// Setup getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// Add ourselves to the default listen events since we won't start listening for claps unless explicitly told to do so (won't be used otherwise)
HumanInput.defaultListenEvents.push('clapper');

var AudioContext = window.AudioContext || window.webkitAudioContext,
    throttleMS = 60, // Only process audio once every throttleMS milliseconds
    ClapperPlugin = function(HI) {
        var self = this;
        self.__name__ = 'ClapperPlugin';
        self.exports = {};
        self.startClapper = function() {
            var handleStream = function(stream) {
                var previous, detectedClap, detectedDoubleClap;
                self.stream = stream;
                self.scriptProcessor.connect(self.context.destination);
                self.analyser.smoothingTimeConstant = 0.4;
                self.analyser.fftSize = 128;
                self.streamSource = self.context.createMediaStreamSource(stream);
                self.streamSource.connect(self.analyser);
                self.analyser.connect(self.scriptProcessor);
                self.scriptProcessor.onaudioprocess = function() {
                    var elapsed, elapsedSinceClap, elapsedSinceDoubleClap, event,
                        now = Date.now();
                    if (!previous) {
                        previous = now;
                        detectedClap = now;
                    }
                    elapsed = now - previous;
                    elapsedSinceClap = now - detectedClap;
                    elapsedSinceDoubleClap = now - detectedDoubleClap;
                    if (elapsed > throttleMS) {
                        self.analyser.getByteFrequencyData(self.freqData);
                        if (elapsedSinceClap >= (throttleMS * 4) && self.freqData.filter(function(amplitude) { return amplitude >= HI.settings.clapThreshold }).length >= 15) {
                            event = 'clap';
                            if (elapsedSinceClap < (throttleMS * 8)) {
                                event = 'doubleclap';
                                detectedDoubleClap = now;
                                if (elapsedSinceDoubleClap < (throttleMS * 12)) {
                                    event = 'applause';
                                }
                            }
                            HI._addDown(event);
                            HI._handleDownEvents();
                            HI._handleSeqEvents();
                            HI._removeDown(event);
                            detectedClap = now;
                        }
                        previous = now;
                    }
                    self.freqData = new Uint8Array(self.analyser.frequencyBinCount);
                }
            };
            self.context = new AudioContext();
            self.scriptProcessor = self.context.createScriptProcessor(1024, 1, 1);
            self.analyser = self.context.createAnalyser();
            self.freqData = new Uint8Array(self.analyser.frequencyBinCount);
            self.log.debug('Starting clap detection');
            self._started = true;
            navigator.getUserMedia({ audio: true }, handleStream, function(e) {
                self.log.error('Could not get audio stream', e);
            });
        };
        self.stopClapper = function() {
            self.log.debug('Stopping clap detection');
            self.stream.getAudioTracks().forEach(function(track) {
                track.stop();
            });
            self.stream.getVideoTracks().forEach(function(track) {
                track.stop();
            });
            self.streamSource.disconnect(self.analyser);
            self.analyser.disconnect(self.scriptProcessor);
            self.scriptProcessor.disconnect(self.context.destination);
            self._started = false;
        };
        return self;
    };

ClapperPlugin.prototype.init = function(HI) {
    var self = this, l = HI.l;
    self.log = new HI.logger(HI.settings.logLevel || 'INFO', '[HI Clapper]');
    self.log.debug(l("Initializing Clapper Plugin"), self);
    HI.settings.autostartClapper = HI.settings.autostartClapper || false; // Don't autostart by default
    HI.settings.clapThreshold = HI.settings.clapThreshold || 120;
    HI.settings.autotoggleClapper = HI.settings.autotoggleClapper || true; // Should we stop automatically on page:hidden?
    if (HI.settings.listenEvents.indexOf('clapper') != -1) {
        if (AudioContext) {
            if (HI.settings.autostartClapper) {
                self.startClapper();
            }
            if (HI.settings.autotoggleClapper) {
                HI.on('document:hidden', function() {
                    if (self._started) {
                        self.stopClapper();
                    }
                });
                HI.on('document:visible', function() {
                    if (!self._started && HI.settings.autostartClapper) {
                        self.startClapper();
                    }
                });
            }
        } else { // Disable the clapper functions to ensure no weirdness with document:hidden
            self.startClapper = HI.noop;
            self.stopClapper = HI.noop;
        }
    }
    // Exports (these will be applied to the current instance of HumanInput)
    self.exports.startClapper = self.startClapper;
    self.exports.stopClapper = self.stopClapper;
    return self;
};

HumanInput.plugins.push(ClapperPlugin);

}).call(this);
