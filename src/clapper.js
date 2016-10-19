/**
 * clapper.js - HumanInput Clapper Plugin: Adds support detecting clap events like "the clapper" (classic)
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/clapper.js
 * @license Apache-2.0
 */

import HumanInput from './humaninput';

// Add ourselves to the default listen events since we won't start listening for claps unless explicitly told to do so (won't be used otherwise)
HumanInput.defaultListenEvents.push('clapper');
// Setup getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const throttleMS = 60; // Only process audio once every throttleMS milliseconds
const historyLength = 50; // How many samples to keep in the history buffer (50 is about 3 seconds worth)
const sum = (arr) => {
    return arr.reduce((a, b) => { return a + b; });
};
const findPeaks = (arr) => {
    // returns the indexes of all the peaks in *arr*
    var indexes = [];
    for (let i = 1; i < arr.length - 1; ++i) {
        if (arr[i-1] < arr[i] && arr[i] > arr[i+1]) {
            indexes.push(i);
        }
    }
    return indexes;
};

export class ClapperPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        this.HI = HI;
        this.l = HI.l;
        this.exports = {};
        this.history = [];
        this.rollingAvg = [];
        this.calcHistoryAverage = this.calcHistoryAverage.bind(this);
        this.startClapper = this.startClapper.bind(this);
        this.stopClapper = this.stopClapper.bind(this);
    }

    init(HI) {
        var state = HI.state;
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Clapper]');
        HI.settings.autostartClapper = HI.settings.autostartClapper || false; // Don't autostart by default
        HI.settings.clapThreshold = HI.settings.clapThreshold || 130;
        HI.settings.autotoggleClapper = HI.settings.autotoggleClapper || true; // Should we stop automatically on page:hidden?
        if (HI.settings.listenEvents.indexOf('clapper') != -1) {
            if (AudioContext) {
                if (HI.settings.autostartClapper) {
                    this.startClapper();
                }
                if (HI.settings.autotoggleClapper) {
                    HI.on('document:hidden', () => {
                        if (this._started) {
                            this.stopClapper();
                        }
                    });
                    HI.on('document:visible', () => {
                        if (!this._started && HI.settings.autostartClapper) {
                            this.startClapper();
                        }
                    });
                }
            } else { // Disable the clapper functions to ensure no weirdness with document:hidden
                this.startClapper = HI.noop;
                this.stopClapper = HI.noop;
            }
        }
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports.startClapper = this.startClapper;
        this.exports.stopClapper = this.stopClapper;
        return this;
    }

    calcHistoryAverage() {
        // Updates this.rollingAvg with the latest data from this.history so that each item in the array reflects the average amplitude for that chunk of the frequency spectrum
        var i, j, temp = 0;
        for (i=0; i < this.analyser.frequencyBinCount; i++) {
            if (this.history[i]) {
                for (j=0; j < this.history.length; j++) {
                    temp += this.history[j][i];
                }
                this.rollingAvg[i] = temp/this.history.length;
                temp = 0;
            }
        }
    }

    startClapper() {
        var handleStream = (stream) => {
            var previous, detectedClap, detectedDoubleClap;
            this.stream = stream;
            this.scriptProcessor.connect(this.context.destination);
            this.analyser.smoothingTimeConstant = 0.4;
            this.analyser.fftSize = 128;
            this.streamSource = this.context.createMediaStreamSource(stream);
            this.streamSource.connect(this.analyser);
            this.analyser.connect(this.scriptProcessor);
            this.scriptProcessor.onaudioprocess = () => {
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
                    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
                    this.analyser.getByteFrequencyData(this.freqData);
                    peaks = findPeaks(this.freqData);
                    highestPeakIndex = this.freqData.indexOf(Math.max.apply(null, this.freqData));
                    highestPeak = this.freqData[highestPeakIndex];
                    // Measure the amplitude increase against the rolling average not the previous data set (which can include ramping-up data which messes up our calculations)
                    amplitudeIncrease = this.freqData[highestPeakIndex] - this.rollingAvg[highestPeakIndex];
                    if (elapsedSinceClap >= (throttleMS * 4)) {
                        // Highest peak is right near the beginning of the spectrum for (most) claps:
                        if (highestPeakIndex < 8 && amplitudeIncrease > this.HI.settings.clapThreshold) {
                            // Sudden large volume change.  Could be a clap...
                            magicRatio1 = sum(this.freqData.slice(0, 10))/sum(this.freqData.slice(10, 20)); // Check the magic ratio
                            magicRatio2 = sum(this.freqData.slice(0, 3))/sum(this.freqData.slice(3, 6)); // Check the 2nd magic ratio
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
                                this.HI._addDown(event);
                                this.HI._handleDownEvents();
                                this.HI._handleSeqEvents();
                                this.HI._removeDown(event);
                                detectedClap = now;
                            }
                        }
                    }
                    previous = now;
                    // Only add this data set to this history if it wasn't a clap (so it doesn't poison our averages)
                    if (detectedClap != now) {
                        this.history.push(this.freqData);
                        if (this.history.length > historyLength) {
                            this.history.shift();
                        }
                        this.calcHistoryAverage();
                    }
                }
            }
        };
        this.context = new AudioContext();
        this.scriptProcessor = this.context.createScriptProcessor(1024, 1, 1);
        this.analyser = this.context.createAnalyser();
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.log.debug(this.l('Starting clap detection'));
        this._started = true;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(handleStream, (e) => {
            this.log.error(this.l('Could not get audio stream'), e);
        });
    }

    stopClapper() {
        this.log.debug(this.l('Stopping clap detection'));
        this.stream.getAudioTracks().forEach((track) => {
            track.stop();
        });
        this.stream.getVideoTracks().forEach((track) => {
            track.stop();
        });
        this.streamSource.disconnect(this.analyser);
        this.analyser.disconnect(this.scriptProcessor);
        this.scriptProcessor.disconnect(this.context.destination);
        this._started = false;
    }

}

HumanInput.plugins.push(ClapperPlugin);
