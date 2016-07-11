(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', './utils', './humaninput'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('./utils'), require('./humaninput'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.utils, global.humaninput);
        global.speechrec = mod.exports;
    }
})(this, function (exports, _utils, _humaninput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SpeechRecPlugin = undefined;

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

    // Add ourselves to the default listen events since we won't start speech unless explicitly told to do so (won't be used otherwise)
    _humaninput2.default.defaultListenEvents.push('speech');

    var speechEvent = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;

    var SpeechRecPlugin = exports.SpeechRecPlugin = function () {
        function SpeechRecPlugin(HI) {
            _classCallCheck(this, SpeechRecPlugin);

            // HI == current instance of HumanInput
            // Exports (these will be applied to the current instance of HumanInput)
            this.exports = {
                startSpeechRec: this.startSpeechRec.bind(this),
                stopSpeechRec: this.stopSpeechRec.bind(this)
            };
            this.HI = HI; // Save reference to the current instance
            this.l = HI.l;
            this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI SpeechRec]');
            this._rtSpeech = []; // Tracks real-time speech so we don't repeat ourselves
            this._rtSpeechTimer = null;
            return this;
        }

        SpeechRecPlugin.prototype.init = function init() {
            var _this = this;

            var HI = this.HI;
            var settings = HI.settings;
            settings.autostartSpeech = settings.autostartSpeech || false; // Don't autostart by default
            if (settings.listenEvents.includes('speech')) {
                if (speechEvent) {
                    if (settings.autostartSpeech) {
                        this.startSpeechRec();
                    }
                    HI.on('document:hidden', function () {
                        if (_this._started) {
                            _this.stopSpeechRec();
                        }
                    });
                    HI.on('document:visible', function () {
                        if (!_this._started && settings.autostartSpeech) {
                            _this.startSpeechRec();
                        }
                    });
                } else {
                    // Disable the speech functions
                    this.startSpeechRec = _utils.noop;
                    this.stopSpeechRec = _utils.noop;
                }
            }
            return this;
        };

        SpeechRecPlugin.prototype.startSpeechRec = function startSpeechRec() {
            var _this2 = this;

            var HI = this.HI;
            this._recognition = new speechEvent();
            this.log.debug(this.l('Starting speech recognition'), this._recognition);
            this._recognition.lang = HI.settings.speechLang || navigator.language || "en-US";
            this._recognition.continuous = true;
            this._recognition.interimResults = true;
            this._recognition.onresult = function (e) {
                for (var i = e.resultIndex; i < e.results.length; ++i) {
                    var event = "speech";
                    var transcript = e.results[i][0].transcript.trim();
                    if (e.results[i].isFinal) {
                        // Make sure we trigger() just the 'speech' event first so folks can use with nonspecific on() events (e.g. to do transcription)
                        _this2.HI._addDown(event);
                        _this2.HI._handleDownEvents(e, transcript);
                        _this2.HI._removeDown(event);
                        // Now we craft the event with the transcript...
                        // NOTE: We have to replace - with – (en dash aka \u2013) because strings like 'real-time' would mess up event combos
                        event += ':"' + transcript.replace(/-/g, '–') + '"';
                        _this2.HI._addDown(event);
                        _this2.HI._handleDownEvents(e, transcript);
                        _this2.HI._handleSeqEvents();
                        _this2.HI._removeDown(event);
                    } else {
                        // Speech recognition that comes in real-time gets the :rt: designation:
                        event += ':rt';
                        // Fire basic 'speech:rt' events so the status of detection can be tracked (somewhat)
                        _this2.HI._addDown(event);
                        _this2.HI._handleDownEvents(e, transcript);
                        _this2.HI._removeDown(event);
                        event += ':"' + transcript.replace(/-/g, '–') + '"';
                        if (_this2._rtSpeech.indexOf(event) == -1) {
                            _this2._rtSpeech.push(event);
                            _this2.HI._addDown(event);
                            _this2.HI._handleDownEvents(e, transcript);
                            // NOTE: Real-time speech events don't go into the sequence buffer because it would
                            //       fill up with garbage too quickly and mess up the ordering of other sequences.
                            _this2.HI._removeDown(event);
                        }
                    }
                }
            };
            this._started = true;
            this._recognition.start();
        };

        SpeechRecPlugin.prototype.stopSpeechRec = function stopSpeechRec() {
            this.log.debug(this.l('Stopping speech recognition'));
            this._recognition.stop();
            this._started = false;
        };

        return SpeechRecPlugin;
    }();

    _humaninput2.default.plugins.push(SpeechRecPlugin);
});