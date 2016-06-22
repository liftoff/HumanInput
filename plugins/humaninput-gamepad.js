/**
 * humaninput-gamepad.js - HumanInput Gamepad Plugin: Adds support for gamepads and joysticks to HumanInput.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput
 * @license Apache-2.0
 */



(function() {
"use strict";

var gpadPresent = function(index) {
        // Returns true if the gamepad with *index* is detected
        var gamepads = navigator.getGamepads(), i;
        for (i = 0; i < gamepads.length; i++) {
            if (gamepads[i] && gamepads[i].index == index) {
                return true;
            }
        }
    },
    GamepadPlugin = function(HI) {
    /**:GamePadPlugin

    The HumanInput Gamepad plugin adds support for gamepads and joysticks allowing the use of the following event types:

    ========================= =============================     =======================================
    Event                     Description                       Arguments
    ========================= =============================     =======================================
    ``gpad:connected``        A gamepad was connected           (<Gamepad object>)
    ``gpad:disconnected``     A gamepad was connected           (<Gamepad object>)
    ``gpad:button:<n>``       State of button *n* changed       (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:down``  Button *n* was pressed (down)     (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:up``    Button *n* was released (up)      (<Button Value>, <Gamepad object>)
    ``gpad:button:<n>:value`` Button *n* value has changed      (<Button Value>, <Gamepad object>)
    ``gpad:axis:<n>``         Gamepad axis *n* changed          (<Button axis value>, <Gamepad object>)
    ========================= =============================     =======================================

    Detection Events
    ----------------
    Whenever a new gamepad is detected the 'gpad:connected' event will fire with the Gamepad object as the only argument.

    Button Events
    -------------
    When triggered, gpad:button events are called like so::

        trigger(event, buttonValue, gamepadObj);

    You can listen for button events using :js:func:`HumanInput.on` like so::

        // Ensure 'gamepad' is included in listenEvents if not calling gamepadUpdate() in your own loop:
        var settings = {listenEvents: ['keydown', 'keypress', 'keyup', 'gamepad']};
        var HI = new HumanInput(window, settings);
        var shoot = function(buttonValue, gamepadObj) {
            console.log('Fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
        };
        HI.on('gpad:button:1:down', shoot); // Call shoot(buttonValue, gamepadObj) when gamepad button 1 is down
        var stopShooting = function(buttonValue, gamepadObj) {
            console.log('Cease fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
        };
        HI.on('gpad:button:1:up', stopShooting); // Call stopShooting(buttonValue, gamepadObj) when gamepad button 1 is released (up)

    For more detail with button events (e.g. you want fine-grained control with pressure-sensitive buttons) just neglect to add ':down' or ':up' to the event::

        HI.on('gpad:button:6', shoot);

    .. note:: The given buttonValue can be any value between 0 (up) and 1 (down).  Pressure sensitive buttons (like L2 and R2 on a DualShock controller) will often have floating point values representing how far down the button is pressed such as ``0.8762931823730469``.

    Button Combo Events
    -------------------
    When multiple gamepad buttons are held down a button combo event will be fired like so::

        trigger("gpad:button:0-gpad:button:1", gamepadObj);

    In the above example gamepad button 0 and button 1 were both held down simultaneously.  This works with as many buttons as the gamepad supports and can be extremely useful for capturing diagonal movement on a dpad.  For example, if you know that button 14 is left and button 13 is right you can use them to define diagonal movement like so::

        on("gpad:button:13-gpad:button:14", downLeft);

    Events triggered in this way will be passed the Gamepad object as the only argument.

    .. note:: Button combo events will always trigger *before* other button events.

    Axis Events
    -----------

    When triggered, gpad:axis events are called like so::

        trigger(event, axisValue, GamepadObj);

    You can listen for axis events using :js:func:`HumanInput.on` like so::

        var moveBackAndForth = function(axisValue, gamepadObj) {
            if (axisValue < 0) {
                console.log('Moving forward at speed: ' + axisValue);
            } else if (axisValue > 0) {
                console.log('Moving backward at speed: ' + axisValue);
            }
        };
        HI.on('gpad:axis:1', moveBackAndForth);

    .. topic:: Game and Application Loops

        If your game or application has its own event loop that runs at least once every ~100ms or so then it may be beneficial to call :js:func:`HumanInput.gamepadUpdate` inside your own loop *instead* of passing 'gamepad' via the 'listenEvents' setting.  Calling :js:func:`HumanInput.gamepadUpdate` is very low overhead (takes less than a millisecond) but HumanInput's default gamepad update loop is only once every 100ms. If you don't want to use your own loop but want HumanInput to update the gamepad events more rapidly you can reduce the 'gpadInterval' setting.  Just note that if you set it too low it will increase CPU utilization which may have negative consequences for your application.

    .. note:: The update interval timer will be disabled if the page is no longer visible (i.e. the user switched tabs).  The interval timer will be restored when the page becomes visible again.  This is handled via the Page Visibility API (visibilitychange event).

    Gamepad State
    -------------
    The state of all buttons and axes on all connected gamepads/joysticks can be read at any time via the `HumanInput.gamepads` property::

        var HI = HumanInput();
        for (var i=0; i < HI.gamepads.length; i++) {
            console.log('Gamepad ' + i + ':', HI.gamepads[i]);
        });

    .. note:: The index position of a gamepad in the `HumanInput.gamepads` array will always match the Gamepad object's 'index' property.
    */
    var self = this;
    self.__name__ = 'GamepadPlugin';
    self.exports = {};
    self.gamepads = [];
    self._gamepadTimer = null;
    self.gamepadUpdate = function() {
        /**:GamepadPlugin.gamepadUpdate()

        .. note:: This method needs to be called in a loop.  See the 'Game and Application Loops' topic for how you can optimize gamepad performance in your own game or application.

        Updates the state of `HumanInput.gamepads` and triggers 'gpad:button' or 'gamepad:axes' events if the state of any buttons or axes has changed, respectively.

        This method will also trigger a 'gpad:connected' event when a new Gamepad is detected (i.e. the user plugged it in or the first time the page is loaded).
        */
        var i, j, index, prevState, gp, buttonState, event, bChanged,
            pseudoEvent = {'type': 'gamepad', 'target': HI.elem},
            noFilter = HI.filter(pseudoEvent),
            gamepads = navigator.getGamepads();
        // Check for disconnected gamepads
        for (i = 0; i < self.gamepads.length; i++) {
            if (self.gamepads[i] && !gpadPresent(i)) {
                HI.trigger('gpad:disconnected', self.gamepads[i]);
                self.gamepads[i] = null;
            }
        }
        for (i = 0; i < gamepads.length; ++i) {
            if (gamepads[i]) {
                index = gamepads[i].index,
                gp = self.gamepads[index];
                if (!gp) {
                    // TODO: Add controller layout detection here
                    self.log.debug('Gamepad ' + index + ' detected:', gamepads[i]);
                    HI.trigger('gpad:connected', gamepads[i]);
                    self.gamepads[index] = {
                        axes: [],
                        buttons: [],
                        timestamp: gamepads[i].timestamp,
                        id: gamepads[i].id
                    };
                    gp = self.gamepads[index];
                    // Prepopulate the axes and buttons arrays so the comparisons below will work:
                    for (j=0; j < gamepads[i].buttons.length; j++) {
                        gp.buttons[j] = {value: 0, pressed: false};
                    }
                    for (j=0; j < gamepads[i].axes.length; j++) {
                        gp.axes[j] = 0;
                    }
                    continue;
                } else {
                    if (gp.timestamp == gamepads[i].timestamp) {
                        continue; // Nothing changed
                    }
// NOTE: We we have to make value-by-value copy of the previous gamepad state because Gamepad objects retain references to their internal state (i.e. button and axes values) when copied using traditional methods.  Benchmarking has shown the JSON.parse/JSON.stringify method to be the fastest so far (0.3-0.5ms per call to gamepadUpdate() VS 0.7-1.2ms per call when creating a new object literal, looping over the axes and buttons to copy their values).
                    prevState = JSON.parse(JSON.stringify(gp)); // This should be slower but I think the JS engine has an optimization for this specific parse(stringify()) situation resulting in it being the fastest method
                    gp.timestamp = gamepads[i].timestamp;
                    gp.axes = gamepads[i].axes.slice(0);
                    for (j=0; j < prevState.buttons.length; j++) {
                        gp.buttons[j].pressed = gamepads[i].buttons[j].pressed;
                        gp.buttons[j].value = gamepads[i].buttons[j].value;
                    }
                }
                if (noFilter) {
                    // Update the state of all down buttons (axes stand alone)
                    for (j=0; j < gp.buttons.length; j++) {
                        buttonState = 'up';
                        if (gp.buttons[j].pressed) {
                            buttonState = 'down';
                        }
                        event = 'gpad:button:' + j;
                        if (buttonState == 'down') {
                            if (!HI.isDown(event)) {
                                HI._addDown(event);
                            }
                        } else {
                            if (HI.isDown(event)) {
                                HI._handleSeqEvents();
                                HI._removeDown(event);
                            }
                        }
                        if (gp.buttons[j].pressed != prevState.buttons[j].pressed) {
                            HI.trigger(HI.scope + event, gp.buttons[j].value, gamepads[i]);
                            HI.trigger(HI.scope + 'gpad:button:' + buttonState, gp.buttons[j].value, gamepads[i]);
                            HI.trigger(HI.scope + event + ':' + buttonState, gp.buttons[j].value, gamepads[i]);
                            bChanged = true;
                        } else if (gp.buttons[j].value != prevState.buttons[j].value) {
                            HI.trigger(HI.scope + event, gp.buttons[j].value, gamepads[i]);
                        }
                    }
                    for (j=0; j < prevState.axes.length; j++) {
                        if (gp.axes[j] != prevState.axes[j]) {
                            event = 'gpad:axis:' + j;
                            HI.trigger(HI.scope + event, gp.axes[j], gamepads[i]);
                        }
                    }
                    if (bChanged) {
                        HI._handleDownEvents(gamepads[i]);
                    }
                }
            }
        }
    };
    self.loadController = function(controller) {
        // Loads the given controller (object)
        for (var alias in controller) {
            HI.aliases[alias] = controller[alias];
        }
    }
    return self;
};

GamepadPlugin.prototype.init = function(HI) {
    /**:GamepadPlugin.init(HI)

    Initializes the Gamepad Plugin by performing the following:

        * Checks for the presence of the 'gpadInterval' and 'gpadCheckInterval' settings and applies defaults if not found.
        * Sets up an interval timer using 'gpadInterval' or 'gpadCheckInterval' that runs :js:func:`GamepadPlugin.gamepadUpdate` if a gamepad is found or not found, respectively *if* 'gamepad' is set in `HI.settings.listenEvents`.
        * Exports `GamepadPlugin.gamepads`, `GamepadPlugin._gamepadTimer`, and :js:func:`GamepadPlugin.gamepadUpdate` to the current instance of HumanInput.
        * Attaches to the 'visibilitychange' event so that we can disable/enable the interval timer that calls :js:func:`GamepadPlugin.gamepadUpdate` (`GamepadPlugin._gamepadTimer`).
    */
    var self = this;
    self.stopGamepadUpdates = function() {
        clearInterval(self._gamepadTimer);
    };
    self.startGamepadUpdates = function() {
        clearInterval(self._gamepadTimer);
        if (self.gamepads.length) { // At least one gamepad is connected
            self._gamepadTimer = setInterval(self.gamepadUpdate, HI.settings.gpadInterval);
        } else {
            // Check for a new gamepad every few seconds in case the user plugs one in later
            self._gamepadTimer = setInterval(self.gamepadUpdate, HI.settings.gpadCheckInterval);
        }
    };
    self.log = new HI.logger(HI.settings.logLevel || 'INFO', '[HI Gamepad]');
    self.log.debug(HI.l("Initializing Gamepad Plugin"), self);
    // Hopefully this timing is fast enough to remain responsive without wasting too much CPU:
    HI.settings.gpadInterval = HI.settings.gpadInterval || 100; // .1s
    HI.settings.gpadCheckInterval = HI.settings.gpadCheckInterval || 3000; // 3s
    clearInterval(self._gamepadTimer); // In case it's already set
    if (HI.settings.listenEvents.indexOf('gamepad') != -1) {
        self.gamepadUpdate();
        self.startGamepadUpdates();
        // Make sure we play nice and disable our interval timer when the user changes tabs
        HI.on('document:hidden', self.stopGamepadUpdates);
        HI.on('document:visibile', self.startGamepadUpdates);
        // This ensures the gpadCheckInterval is replaced with the gpadInterval
        HI.on('gpad:connected', self.startGamepadUpdates);
    }
    // Exports (these will be applied to the current instance of HumanInput)
    self.exports.gamepads = self.gamepads;
    self.exports._gamepadTimer = self._gamepadTimer;
    self.exports.gamepadUpdate = self.gamepadUpdate;
    self.exports.loadController = self.loadController;
    self.exports.stopGamepadUpdates = self.stopGamepadUpdates;
    self.exports.startGamepadUpdates = self.startGamepadUpdates;
    return self;
};

// The following is a WIP for adding aliases automatically depending on the detected gamepad type:

// The default controller layout.  The keys of this object represent alias names
// that will be assigned to HumanInput.aliases:
// GamepadPlugin.prototype.standardLayout = {
//     // NOTE: This layout should cover DualShock, Xbox controllers, and similar
//     'gpad:up': 'gpad:button:12',
//     'gpad:down': 'gpad:button:13',
//     'gpad:left': 'gpad:button:14',
//     'gpad:right': 'gpad:button:15',
//     'gpad:select': 'gpad:button:8',
//     'gpad:share': 'gpad:button:8',
//     'gpad:start': 'gpad:button:9',
//     'gpad:options': 'gpad:button:9',
//     'gpad:l1': 'gpad:button:4',
//     'gpad:l2': 'gpad:button:6',
//     'gpad:r1': 'gpad:button:5',
//     'gpad:r2': 'gpad:button:7'
// }

HumanInput.plugins.push(GamepadPlugin);

// Exports
// window.HumanInput = HumanInput;

}).call(this);
