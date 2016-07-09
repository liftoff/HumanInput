/**
 * example.js - HumanInput Example Plugin: The simplest plugin possible to demonstrate how to write a plugin
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/example.js
 * @license plublic domain
 */

import HumanInput from './humaninput';

// NOTE: To create a humininput.js bundle that includes your plugin add it to the humaninput-full.js file like so:

//      import ExamplePlugin from './example_plugin';

// ...or just add your plugin as a <script> to your page

var window = this; // In case you need to reference the window object (should be obvious but someone will appreciate it)

// Add ourselves to the default listen events (if you want an easy means to control enabling/disabling your plugin)
HumanInput.defaultListenEvents.push('example');

// This is the bare minimum shell required for any plugin:
export class ExamplePlugin { // 'HI' here is the current instance of HumanInput
    constructor(HI) {
        this.HI = HI; // Make a reference to the current instance of HumanInput (usually important)
        // Exports (these will be applied to the current instance of HumanInput)
        this.exports = {
            foo: this.foo.bind(this), // Use bind(this) if your plugin function needs 'this' to always refer to itthis
            bar: this.foo.bind(HI) // Use bind(HI) if your plugin function needs 'this' to always refer to the current instance of HumanInput
        };
        // The above exports ensures HI.foo() and HI.bar() will work without having to find your plugin's instance in HI.plugins
    }

// The init() function in your plugin will be called at the end of HumanInput.init() when it gets instantiated
    init() {
        var HI = this.HI;
        // 'this.log' here optional: Use your own plugin-specific logger (makes it easy to differentiate messages in the console)
        this.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Example]');
        HI.settings.exampleSetting = HI.settings.exampleSetting || true; // This is how you add a new setting
        // This is how we control whether our plugin is enabled in this instance of HumanInput:
        if (HI.settings.listenEvents.includes('example')) { // Was our event included in listenEvents?
            // Do your plugin initialization stuff here (e.g. start er up!)
        }
        // This ensures HumanInput can keep track of your plugin and also logs that it was initialized (if logLevel == 'debug')
        return this;
    }

    foo() {
        // Just a generic function to use as an example of how to export functions
        this.log.info('this:', this);
        return true;
    }
}

HumanInput.plugins.push(ExamplePlugin); // Add our plugin to the list of plugins
