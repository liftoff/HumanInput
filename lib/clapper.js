(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './humaninput'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./humaninput'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.humaninput);
        global.clapper = mod.exports;
    }
})(this, function (exports, _humaninput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ClapperPlugin = undefined;

    var _humaninput2 = _interopRequireDefault(_humaninput);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    // Add ourselves to the default listen events since we won't start listening for claps unless explicitly told to do so (won't be used otherwise)
    _humaninput2.default.defaultListenEvents.push('clapper');
    // Setup getUserMedia
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var throttleMS = 60; // Only process audio once every throttleMS milliseconds
    var historyLength = 50; // How many samples to keep in the history buffer (50 is about 3 seconds worth)
    var sum = function sum(arr) {
        return arr.reduce(function (a, b) {
            return a + b;
        });
    };
    var findPeaks = function findPeaks(arr) {
        // returns the indexes of all the peaks in *arr*
        var indexes = [];
        for (var i = 1; i < arr.length - 1; ++i) {
            if (arr[i - 1] < arr[i] && arr[i] > arr[i + 1]) {
                indexes.push(i);
            }
        }
        return indexes;
    };

    var ClapperPlugin = exports.ClapperPlugin = function () {
        function ClapperPlugin(HI) {
            _classCallCheck(this, ClapperPlugin);

            // HI == current instance of HumanInput
            this.HI = HI;
            this.l = HI.l;
            this.exports = {};
            this.history = [];
            this.rollingAvg = [];
            this.calcHistoryAverage = this.calcHistoryAverage.bind(this);
            this.startClapper = this.startClapper.bind(this);
            this.stopClapper = this.stopClapper.bind(this);
        }

        ClapperPlugin.prototype.init = function init(HI) {
            var _this = this;

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
                        HI.on('document:hidden', function () {
                            if (_this._started) {
                                _this.stopClapper();
                            }
                        });
                        HI.on('document:visible', function () {
                            if (!_this._started && HI.settings.autostartClapper) {
                                _this.startClapper();
                            }
                        });
                    }
                } else {
                    // Disable the clapper functions to ensure no weirdness with document:hidden
                    this.startClapper = HI.noop;
                    this.stopClapper = HI.noop;
                }
            }
            // Exports (these will be applied to the current instance of HumanInput)
            this.exports.startClapper = this.startClapper;
            this.exports.stopClapper = this.stopClapper;
            return this;
        };

        ClapperPlugin.prototype.calcHistoryAverage = function calcHistoryAverage() {
            // Updates this.rollingAvg with the latest data from this.history so that each item in the array reflects the average amplitude for that chunk of the frequency spectrum
            var i,
                j,
                temp = 0;
            for (i = 0; i < this.analyser.frequencyBinCount; i++) {
                if (this.history[i]) {
                    for (j = 0; j < this.history.length; j++) {
                        temp += this.history[j][i];
                    }
                    this.rollingAvg[i] = temp / this.history.length;
                    temp = 0;
                }
            }
        };

        ClapperPlugin.prototype.startClapper = function startClapper() {
            var _this2 = this;

            var handleStream = function handleStream(stream) {
                var previous, detectedClap, detectedDoubleClap;
                _this2.stream = stream;
                _this2.scriptProcessor.connect(_this2.context.destination);
                _this2.analyser.smoothingTimeConstant = 0.4;
                _this2.analyser.fftSize = 128;
                _this2.streamSource = _this2.context.createMediaStreamSource(stream);
                _this2.streamSource.connect(_this2.analyser);
                _this2.analyser.connect(_this2.scriptProcessor);
                _this2.scriptProcessor.onaudioprocess = function () {
                    var elapsed,
                        elapsedSinceClap,
                        elapsedSinceDoubleClap,
                        event,
                        peaks,
                        highestPeak,
                        highestPeakIndex,
                        amplitudeIncrease,
                        magicRatio1,
                        magicRatio2,
                        now = Date.now();
                    if (!previous) {
                        previous = now;
                        detectedClap = now;
                    }
                    elapsed = now - previous;
                    elapsedSinceClap = now - detectedClap;
                    elapsedSinceDoubleClap = now - detectedDoubleClap;
                    if (elapsed > throttleMS) {
                        _this2.freqData = new Uint8Array(_this2.analyser.frequencyBinCount);
                        _this2.analyser.getByteFrequencyData(_this2.freqData);
                        peaks = findPeaks(_this2.freqData);
                        highestPeakIndex = _this2.freqData.indexOf(Math.max.apply(null, _this2.freqData));
                        highestPeak = _this2.freqData[highestPeakIndex];
                        // Measure the amplitude increase against the rolling average not the previous data set (which can include ramping-up data which messes up our calculations)
                        amplitudeIncrease = _this2.freqData[highestPeakIndex] - _this2.rollingAvg[highestPeakIndex];
                        if (elapsedSinceClap >= throttleMS * 4) {
                            // Highest peak is right near the beginning of the spectrum for (most) claps:
                            if (highestPeakIndex < 8 && amplitudeIncrease > HI.settings.clapThreshold) {
                                // Sudden large volume change.  Could be a clap...
                                magicRatio1 = sum(_this2.freqData.slice(0, 10)) / sum(_this2.freqData.slice(10, 20)); // Check the magic ratio
                                magicRatio2 = sum(_this2.freqData.slice(0, 3)) / sum(_this2.freqData.slice(3, 6)); // Check the 2nd magic ratio
                                // The peak check below is to prevent accidentally capturing computer-generated sounds which usually have a nice solid curve (few peaks if any)
                                if (magicRatio1 < 1.8 && magicRatio2 < 1.4 && peaks.length > 2) {
                                    // Now we're clapping!
                                    event = 'clap';
                                    if (elapsedSinceClap < throttleMS * 8) {
                                        event = 'doubleclap';
                                        detectedDoubleClap = now;
                                        if (elapsedSinceDoubleClap < throttleMS * 12) {
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
                            _this2.history.push(_this2.freqData);
                            if (_this2.history.length > historyLength) {
                                _this2.history.shift();
                            }
                            _this2.calcHistoryAverage();
                        }
                    }
                };
            };
            this.context = new AudioContext();
            this.scriptProcessor = this.context.createScriptProcessor(1024, 1, 1);
            this.analyser = this.context.createAnalyser();
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            this.log.debug(this.l('Starting clap detection'));
            this._started = true;
            navigator.getUserMedia({ audio: true }, handleStream, function (e) {
                _this2.log.error(_this2.l('Could not get audio stream'), e);
            });
        };

        ClapperPlugin.prototype.stopClapper = function stopClapper() {
            this.log.debug(this.l('Stopping clap detection'));
            this.stream.getAudioTracks().forEach(function (track) {
                track.stop();
            });
            this.stream.getVideoTracks().forEach(function (track) {
                track.stop();
            });
            this.streamSource.disconnect(this.analyser);
            this.analyser.disconnect(this.scriptProcessor);
            this.scriptProcessor.disconnect(this.context.destination);
            this._started = false;
        };

        return ClapperPlugin;
    }();

    _humaninput2.default.plugins.push(ClapperPlugin);
});