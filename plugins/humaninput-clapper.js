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
    historyLength = 50, // How many samples to keep in the history buffer (50 is about 3 seconds worth)
    sum = function(arr) {
        return arr.reduce(function(a, b) { return a + b; });
    },
    findPeaks = function(arr) {
        // returns the indexes of all the peaks in *arr*
        var indexes = [];
        for (var i = 1; i < arr.length - 1; ++i) {
            if (arr[i-1] < arr[i] && arr[i] > arr[i+1]) {
                indexes.push(i);
            }
        }
        return indexes;
    },
    ClapperPlugin = function(HI) {
        var self = this;
        self.__name__ = 'ClapperPlugin';
        self.exports = {};
        self.history = [];
        self.rollingAvg = [];
        self.calcHistoryAverage = function() {
            // Updates self.rollingAvg with the latest data from self.history so that each item in the array reflects the average amplitude for that chunk of the frequency spectrum
            var i, j, temp = 0;
            for (i=0; i < self.analyser.frequencyBinCount; i++) {
                if (self.history[i]) {
                    for (j=0; j < self.history.length; j++) {
                        temp += self.history[j][i];
                    }
                    self.rollingAvg[i] = temp/self.history.length;
                    temp = 0;
                }
            }
        };
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
                    var elapsed, elapsedSinceClap, elapsedSinceDoubleClap, event, peaks, highestPeak, highestPeakIndex, amplitudeIncrease, magicRatio1, magicRatio2,
                        now = Date.now();
                    if (!previous) {
                        previous = now;
                        detectedClap = now;
                    }
                    elapsed = now - previous;
                    elapsedSinceClap = now - detectedClap;
                    elapsedSinceDoubleClap = now - detectedDoubleClap;
                    if (elapsed > throttleMS) {
                        self.freqData = new Uint8Array(self.analyser.frequencyBinCount);
                        self.analyser.getByteFrequencyData(self.freqData);
                        peaks = findPeaks(self.freqData);
                        highestPeakIndex = self.freqData.indexOf(Math.max.apply(null, self.freqData));
                        highestPeak = self.freqData[highestPeakIndex];
                        // Measure the amplitude increase against the rolling average not the previous data set (which can include ramping-up data which messes up our calculations)
                        amplitudeIncrease = self.freqData[highestPeakIndex] - self.rollingAvg[highestPeakIndex];
                        if (elapsedSinceClap >= (throttleMS * 4)) {
                            // Highest peak is right near the beginning of the spectrum for (most) claps:
                            if (highestPeakIndex < 8 && amplitudeIncrease > HI.settings.clapThreshold) {
                                // Sudden large volume change.  Could be a clap...
                                magicRatio1 = sum(self.freqData.slice(0, 10))/sum(self.freqData.slice(10, 20)); // Check the magic ratio
                                magicRatio2 = sum(self.freqData.slice(0, 3))/sum(self.freqData.slice(3, 6)); // Check the 2nd magic ratio
                                // The peak check below is to prevent accidentally capturing computer-generated sounds which usually have a nice solid curve (few peaks if any)
                                if (magicRatio1 < 1.8 && magicRatio2 < 1.4 && peaks.length > 2) {
                                    // Now we're clapping!
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
                            }
                        }
                        previous = now;
                        // Only add this data set to this history if it wasn't a clap (so it doesn't poison our averages)
                        if (detectedClap != now) {
                            self.history.push(self.freqData);
                            if (self.history.length > historyLength) {
                                self.history.shift();
                            }
                            self.calcHistoryAverage();
                        }
                    }
                }
            };
            self.context = new AudioContext();
            self.scriptProcessor = self.context.createScriptProcessor(1024, 1, 1);
            self.analyser = self.context.createAnalyser();
            self.freqData = new Uint8Array(self.analyser.frequencyBinCount);
            self.log.debug(HI.l('Starting clap detection'));
            self._started = true;
            navigator.getUserMedia({ audio: true }, handleStream, function(e) {
                self.log.error(HI.l('Could not get audio stream'), e);
            });
        };
        self.stopClapper = function() {
            self.log.debug(HI.l('Stopping clap detection'));
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
    var self = this;
    self.log = new HI.logger(HI.settings.logLevel || 'INFO', '[HI Clapper]');
    self.log.debug(HI.l("Initializing Clapper Plugin"), self);
    HI.settings.autostartClapper = HI.settings.autostartClapper || false; // Don't autostart by default
    HI.settings.clapThreshold = HI.settings.clapThreshold || 130;
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
