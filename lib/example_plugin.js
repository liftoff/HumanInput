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
        global.example_plugin = mod.exports;
    }
})(this, function (exports, _humaninput) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ExamplePlugin = undefined;

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

    // NOTE: To create a humininput.js bundle that includes your plugin add it to the humaninput-full.js file like so:

    //      import ExamplePlugin from './example_plugin';

    // ...or just add your plugin as a <script> to your page

    var window = undefined; // In case you need to reference the window object (should be obvious but someone will appreciate it)

    // Add ourselves to the default listen events (if you want an easy means to control enabling/disabling your plugin)
    _humaninput2.default.defaultListenEvents.push('example');

    // This is the bare minimum shell required for any plugin:
    var ExamplePlugin = exports.ExamplePlugin = function () {
        // 'HI' here is the current instance of HumanInput

        function ExamplePlugin(HI) {
            _classCallCheck(this, ExamplePlugin);

            this.HI = HI; // Make a reference to the current instance of HumanInput (usually important)
            // Exports (these will be applied to the current instance of HumanInput)
            this.exports = {
                foo: this.foo.bind(this), // Use bind(this) if your plugin function needs 'this' to always refer to itthis
                bar: this.foo.bind(HI) // Use bind(HI) if your plugin function needs 'this' to always refer to the current instance of HumanInput
            };
            // The above exports ensures HI.foo() and HI.bar() will work without having to find your plugin's instance in HI.plugins
        }

        // The init() function in your plugin will be called at the end of HumanInput.init() when it gets instantiated


        ExamplePlugin.prototype.init = function init() {
            var HI = this.HI;
            // 'this.log' here optional: Use your own plugin-specific logger (makes it easy to differentiate messages in the console)
            this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Example]');
            HI.settings.exampleSetting = HI.settings.exampleSetting || true; // This is how you add a new setting
            // This is how we control whether our plugin is enabled in this instance of HumanInput:
            if (HI.settings.listenEvents.includes('example')) {} // Was our event included in listenEvents?
            // Do your plugin initialization stuff here (e.g. start er up!)

            // This ensures HumanInput can keep track of your plugin and also logs that it was initialized (if logLevel == 'debug')
            return this;
        };

        ExamplePlugin.prototype.foo = function foo() {
            // Just a generic function to use as an example of how to export functions
            this.log.info('this:', this);
            return true;
        };

        return ExamplePlugin;
    }();

    _humaninput2.default.plugins.push(ExamplePlugin); // Add our plugin to the list of plugins
});