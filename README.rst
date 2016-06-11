HumanInput - Human Events for Humans
====================================

HumanInput is a tiny (~6.5kb gzipped), high-performance ECMAScript library for handling events triggered by humans:

.. code-block:: javascript

    // Tell it to listen for events on the window
    var HI = new HumanInput(window);
    HI.on('ctrl-z', (event) => {
        HI.log.info('Keyboard events!', event) });
    HI.on('dblclick', (event) => {
        HI.log.info("Mouse events!", event) });
    HI.on('swipe:up', (event) => {
        HI.log.info("Gesture events!", event) });
    HI.on('a b c', (event) => {
        HI.log.info("Sequences!", event) });
    HI.on('shift-ç', (event) => {
        HI.log.info('Internationalization!', event) });
    HI.on('paste', (event, data) => {
        HI.log.info('Clipboard and more! User pasted:', data) });
    HI.on('speech"This is a test"', (event) => {
        HI.log.info('Speech recognition!') });
    HI.on('gpad:button:4:down', (event) => {
        HI.log.info('Gamepad!') });

The above is but a tiny fraction of what's possible with HumanInput.  The library has support for:

    * Keyboard events (including key location/state/event specificity and non-US keyboard layouts!): ``HI.on('keydown:shiftleft', doLeftPaddle)``
    * Any-key-or-event-as-a-modifier: ``HI.on('a-w', doUpLeft)``
    * Mouse/Touch/Gesture events: ``HI.on('shift-click', doShiftClick)``
    * Clipboard and selection events: ``HI.on('select:"select this text"', userFollowsDirections)``
    * Event sequences: ``HI.on('up up down down left right left right b a enter', doKonamiCode)``
    * On-demand, real-time event/state tracking: ``HI.isDown('shift-a') == true``
    * Document visibility events: ``HI.on('document:visible', doWelcomeBack)``
    * Device orientation events: ``HI.on('portrait', doPortrait)``
    * Bind whatever context you want to events so ``this`` is what *you* want it to be: ``HI.on('ctrl-a n', nextScreenFunc, screenObj)``
    * Specify how many times an event can be called: ``HI.once('enter', doSubmit); HI.on('faceplant', wakeUp, someContext, 5);``
    * A powerful filtering mechanism to ensure that events only get triggered when you want them to: ``HI.filter = myFilterFunc``
    * Events support 'scopes' which you define and enable/disable at-will: ``HI.on('controlpanel:ctrl-h', doControlHelp); HI.pushScope('controlpanel');``
    * Pause and resume handling of events on-the-fly: ``HI.pause(); HI.resume();``
    * Optional plugin: Gamepad events (with high performance state checking to integrate with game loops!): ``HI.on('gpad:button:4:down', doJump)``
    * Optional plugin: Speech recognition events: ``HI.on('speech:"this is a test"', doTestFunc)``
    * Up to you: It's a great general-purpose event lib: ``HI.on('custom:event', handleMyEvent); HI.trigger('custom:event', someValue);``
    * Up to you: It's also got a nice logger: ``var myLogger = new HI.logger('INFO', '[myapp]'); myLogger.warn("Tool cool!");``

HumanInput has no external dependencies and was made with only the finest vanilla JavaScript extract!

.. note::  For the sake of brevity let's just assume that we've already called ``var HI = new HumanInput(window)`` in the rest of the documentation (unless otherwise noted).

Debugging (set the logLevel)
----------------------------

Before learning anything else about HumanInput you should learn how to debug events!  The 'key' (haha) is to set the logging level to "DEBUG":

.. code-block:: javascript

    var settings = {logLevel: "DEBUG"}; // Note: The logLevel is not actually case sensitive I just like shouting DEBUG
    var HI = new HumanInput(window, settings); // Provide the settings when instantiating

Then whenever HumanInput triggers an event you'll see all the details about it in your browser's JavaScript console like: ``[HI] triggering: click [MouseEvent]``.  Warning: It can be wicked verbose (but it's worth it).

Alternatively, you can modify the logLevel on-the-fly with: ``HI.log.setLevel("DEBUG")``

Events
------

HumanInput is an event library at its core and it classifies events into these categories:

    * Single: ``HI.on('a', doSomething)``
    * Combo: ``HI.on('meta-a', doSomething)``
    * Ordered Combo: ``HI.on('a->s->d', doASD)``
    * Sequence: ``HI.on('up up down down left right left right b a enter', konamiCode)``

Just about any kind of event can be mixed and matched with any other kind of event.  For example, you could use ``shift-click`` which combines keyboard and mouse events.  You can take it a step further and mix such things into sequences like ``a-click dblclick f``.  Here's a ridiculous example to demonstrate **THE POWER** of HumanInput:

.. code-block:: javascript

    HI.on('gpad:button:2->shiftleft speech:"testing"', doTestSpeechIfGpadButton2withLeftShiftwasPressedBeforehand)``

Yeah, that actually works (if you have the gamepad and speech plugins and enabled).

.. note:: Except for ordered combos and sequences the order in which you define your combo event doesn't matter!  ``ctrl-shift-a`` works just the same as ``shift-ctrl-a`` or even ``a-shift-ctrl`` (all events get sorted into a specific order before registration; expect the debug output to represent that ordering as such).

There's three event methods:

    * ``on(event, someFunction, context, times)``: When *event* is triggered call *someFunction* with *context* bound to ``this`` n *times*.
    * ``off(event, someFunction, context)``: Remove the matching *event/someFunction/context* combination. If only the event is given all matching functions/contexts will be removed.  If no context is given all matching event/function combinations will be removed.  Calling ``off()`` with no arguments will remove all events.
    * ``trigger(event, [arguments]``: Trigger the *event* passing it *arguments* (as many as you want).

You can also use the convenient ``once()`` shortcut for events you only want to fire one time.  Equivalent to: ``on(event, someFunc, context, 1)``.

Binding Multiple Events at Once
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can bind multiple events to a single function by passing them as an array: ``HI.on(['a', 'b'], doAorBStuff)``

Event Aliases
^^^^^^^^^^^^^

HumanInput includes a number of convenient event aliases which you can use to save some typing:

.. code-block:: javascript

    // Copied right out of humaninput.js
    self.aliases = {
        tap: 'click',
        middleclick: 'pointer:middle:click',
        rightclick: 'pointer:right:click',
        doubleclick: 'dblclick', // For consistency with naming
        tripleclick: Array(4).join('pointer:left ').trim(),
        quadrupleclick: Array(5).join('pointer:left ').trim(),
        konami: 'up up down down left right left right b a enter',
        portrait: 'window:orientation:portrait',
        landscape: 'window:orientation:landscape',
        hulksmash: 'faceplant'
    };

You can add your own aliases as well:

.. code-block:: javascript

    HI.aliases.invoke = 'ctrl-a';
    HI.aliases['★'] = 'ctrl-b';
    HI.on('invoke n', newWindow);
    HI.on('★', newBookmark);

.. note:: You can use ``emit()`` instead of ``trigger()`` if you're triggering events yourself (one is an alias to the other).

listenEvents
^^^^^^^^^^^^

HumanInput will add event listeners to the given element (first argument to ``HumanInput()``) for all the events given via the ``listenEvents`` setting.  So if you wanted HumanInput to only listen for mouse events you could do something like this:

.. code-block:: javascript

    var settings = {listenEvents: ['mousedown', 'mouseup'};
    var HI = new HumanInput(window, settings); // Provide the settings when instantiating

.. note:: You can reference the active listenEvents at any time via: ``HI.settings.listenEvents``

The default listenEvents (which can vary depending on plugins) can be found via the ``HumanInput.defaultListenEvents`` property:

.. code-block:: javascript

    > console.log(HumanInput.defaultListenEvents);
    ["keydown", "keypress", "keyup", "click", "dblclick", "wheel", "contextmenu", "compositionstart", "compositionupdate", "compositionend", "cut", "copy", "paste", "select", "mousedown", "mouseup", "touchstart", "touchend"]

.. note:: Only events that have a matching ``HI._<eventname>`` (note the underscore) function get added via ``addEventListener()``.  Some listenEvents may be 'simulated events' that are emitted by different mechanisms.  For example, there's no way to listen for gamepad events via ``addEventListener()`` so the gamepad plugin uses its own event loop to detect and emit 'gamepad' events (which are aliased to 'gpad' to save some typing).

Filtering
---------

Before triggering an event HumanInput will execute ``HumanInput.filter()``.  If the filter function returns ``true`` the event will be triggered as normal.  If it returns ``false`` the event will not be triggered.  The default ``HumanInput.filter()`` only applies to keyboard events and will return ``false`` if a ``textarea``, ``input``, or ``select`` element has focus.

To disable filtering just set ``HumanInput.filter()`` to a function that returns ``true``:

.. code-block:: javascript

    // Disable the filter function
    HI.filter = function(e) { return true };

State Tracking
--------------

You can check the state of most events (keys, mouse, buttons) in real-time using the ``HumanInput.isDown()`` function:

.. code-block:: javascript

    HI.isDown('a') == true;
    HI.isDown('shift-a') == true; // Works with combos too
    HI.isDown('pointer:left') == true; // ...and pointer/mouse/touch events!

.. note:: For reasons that should be obvious you can't use ``isDown()`` with key sequences (just events and event combos).

.. topic:: High-performance state tracking

    The ``HI.isDown()`` function is very fast but it *does* have some overhead.  If you want to maximize performince (say, inside a game loop) you can check the 'down' state of any key by examining the ``HI.down`` array:

    .. code-block:: javascript

        // Hardcore state tracking; without a (non-native) function call
        HI.down.indexOf('a') == true; // The 'a' key is down

    Just note that ``HI.down`` tracks the state of keys via ``KeyboardEvent.key`` and maintains the case it was given.  This means that if the user presses the 'a' key it will be tracked as a lowercase 'a'.  However, if the user is also holding down the 'ShiftLeft' key ``HI.down`` will hold an uppercase 'A' since that's what ``KeyboardEvent.key`` will give us.  Also keep in mind that modifiers that have left and right equivalents will be stored in ``HI.down`` as such (e.g. 'ShiftLeft', 'ControlRight', etc).

Keyboard Support
----------------

It's probably easiest if we just provide examples of all the ways you can use keyboard events in HumanInput...

.. code-block:: javascript

    // Basic: Call a function when a specific key is pressed
    HI.on('a', aKeyPressed); // Implied keyup:a
    // Be more specific about the same thing
    HI.on('keyup:a', aKeyReleased); // keydown works too (only losers use keypress)
    // Call your function whenever *any* key is pressed
    HI.on('keydown', theAnyKeyHasBeenFound);
    // Uppercase letters (any char that works with String.toUpperCase()) that require shift to type are handled automatically
    HI.on('A', capitalAPressed); // Gets converted to 'shift-a' when the event is registered
    // You can also specify a key's location if the browser knows the difference
    HI.on('shiftleft', leftPaddle);
    // Combos!  NOTE: Technically, *event* combos (not limited to keys!)
    HI.on('ctrl-g', function(event) { HI.log.info('You pressed Control-g!'); });
    // Bind a couple of key combos to the same function
    HI.on(['ctrl-a', 'ctrl-shift-a'], someFunction); // ctrl-a *or* ctrl-shift-a will call someFunction()
    // Call a function when a certain sequence of keys is pressed (NOTE: Also, technically a sequence of events!)
    HI.on('ctrl-a n', nextVirtualWindow); // User types "ctrl-a" then types "n" within a moment or two
    // Now let's get *really* precise; call a function when the user holds down f, d, and s (in that specific order)
    HI.on('f->d->s', doFDSCombo); // It's a key combo but with a specific order->of->events
    // Same thing but the opposite order
    HI.on('s->d->f', doSDFCombo); // Note that this also demonstrates how any key (or event!) can be a modifier

.. topic:: Why aren't shifted keys like '?' or '!' handled automatically?

    Because the shift key produces different characters depending on the keyboard layout and there's no way (from JavaScript) to detect keyboard layouts.

Keyboard events are triggered with ``KeyboardEvent``, ``KeyboardEvent.key`` (normalized by HumanInput if warranted) and ``KeyboardEvent.code`` as arguments.  So if you listen to just 'keydown' or 'keyup' you can examine the key that was pressed like so:

.. code-block:: javascript

    var whatKey = function(event, key, code) {
        HI.log.info(key, ' was pressed.  Here is the code:', code);
    };
    HI.on('keyup', whatKey);

Textual Input Elements
^^^^^^^^^^^^^^^^^^^^^^

By default HumanInput will not trigger keyboard events when the user has focused on a ``textarea``, ``input``, or ``select`` element.  This is controlled via :js:func:`HumanInput.filter()`.  To change this behavior just override that function or set it to an empty function that always returns ``true``: ``HI.filter = (e) => { return true }``

Event.preventDefault()
^^^^^^^^^^^^^^^^^^^^^^

If the event type supports it you can make sure that ``Event.preventDefault()`` gets called by simply having your event function ``return false``:

.. code-block:: javascript

    var preventBookmarking = function(event, key, code) {
        HI.log.info("No bookmarking!");
        return false; // Will ensure event.preventDefault() gets called
    };
    HI.on('ctrl-b', preventBookmarking);

Or you could just, "call it your damned self" since the browser-generated event is passed to the triggered function as the first argument :)

Intelligent Key Repeat
^^^^^^^^^^^^^^^^^^^^^^

By default HumanInput won't repeatedly trigger keyboard events for keys which are held down (aka "key repeat").  You can override this functionality by passing ``noKeyRepeat = false`` when instantiating HumanInput:

.. code-block:: javascript

    var settings = {noKeyRepeat: false}; // Trigger events constantly while keys are held
    var HI = new HumanInput(window, settings);
    HI.on('space', fireLasers);

Internationalization
^^^^^^^^^^^^^^^^^^^^

HumanInput tries to be smart about international (non-US) keyboard layouts.  If you type 'ç' using a Brazilian layout you should be able to attach an event to that key like so: ``HI.on('ç', doStuff)``.  Note that this capability is largely dependent on browser support and it doesn't *usually* work with the Control key (ctrl) for legacy reasons.  As of writing this documentation the only major browser lacking support for international keyboard layouts (in this way) is Safari (Apple needs to get with the ``KeyboardEvent.key`` program!).  It should work great with Chrome/Chromium, Firefox, Opera, and even IE.

Key Aliases
^^^^^^^^^^^

If you want to be freaky deaky (or extreme in your minification) you can use unicode symbols for their respective keys:

.. code-block:: javascript

    HI.on('⇧-b', shiftBPressed); // Same as: 'shift'
    HI.on('⌥-c', optionCPressed); // Same as: 'alt', 'option'
    HI.on('⌘-c', commandCPressed); // Same as: 'os', 'meta', 'win' 'command', 'cmd'

.. note:: You can also use 'control' instead of 'ctrl' but who wants to type all those extra characters? :)

Unique Numpad
^^^^^^^^^^^^^

Say you want to differentiate between '/' and the same key on the numpad.  You can do that but you must set ``uniqueNumpad = true`` when instantiating HumanInput like so:

.. code-block:: javascript

    var settings = {uniqueNumpad: true};
    var HI = new HumanInput(window, settings);

Then when you want to attach an event to a numpad key just prefix it with ``numpad`` like so:

.. code-block:: javascript

    HI.on('numpad*', numpadStarFunc);
    HI.on('numpad/', numpadSlashFunc);
    HI.on('numpad5', numpadFiveFunc);

Composition (IME) Support
-------------------------

Composition and Input Method Entry (IME) support is fairly straightforward:

.. code-block:: javascript

    HI.on('composing:"Tes"', examineInput); // User just added 's' after 'Te'
    HI.on('composed:"Test"', compositionUpdated); // User completed their composition
    // You can do this too if you want to handle things yourself:
    HI.on('compositionend', compositionEndedFunc); // Handle the event however you like

Faceplant Support
-----------------

A very important feature in any JS lib that handles keyboard events: Detecting when a face slams into the keyboard...

.. code-block:: javascript

    HI.on('faceplant', wakeUpFool); // How could any keyboard lib not have this? :D

Try it!

.. note:: 'hulksmash' also works ᕙ(⇀‸↼‶)ᕗ

Mouse, Touch, and Pointer Event Support
---------------------------------------

HumanInput supports mouse, touch, and pointer events and includes a bunch of handy dandy shortcuts to deal with it all...

.. note:: Use 'pointer' when you want to cover mouse and touch events at the same time.

.. code-block:: javascript

    // Basics:
    HI.on('click', doClick);
    HI.on('tap', doClickStuff); // Same exact thing as above ('tap' is an alias for 'click')
    HI.on('pointer:down', doMouseDownStuff); // Same as 'mousedown' or 'touchstart'
    // Be more specific
    HI.on('pointer:right:down', doRightByMe);
    HI.on('middleclick', doPaste); // Alias to 'pointer:middle:click'
    // Be *very* specific
    HI.on('mouse:7:up', handleMouseSeven); // Only fire for mouse clicks using button 7; no touches!
    // Combine with keys (or other events) as modifiers!
    HI.on('ctrl-click', doCtrlClick);
    // Mouse sequence support
    HI.on('dblclick click', handleTripleClick); // Triple-click
    HI.on('quadrupleclick', handleQuadrupleClick); // Quadruple-click works!
    HI.on('dblclick a-s-d-f', homeRowMasher); // Use your imagination!
    // Basic gesture support
    HI.on('swipe:up', swipeUp);
    HI.on('swipe:right', swipeRight);

If anyone wants to assist, the following touch event types are in the TODO list (not yet implemented):

.. code-block:: javascript

    HI.on('multitouch:2:tap', doClickStuff); // Two-finger tap
    HI.on('multitouch:4:tap', doClickStuff); // Four-finger tap
    HI.on('multitouch:2:swipe:right', swipeRight); // Two-finger swipes
    HI.on('multitouch:2:pan:down', doTwoFingerPanDown); // Touch-specific two-finger panning support
    HI.on('multitouch:4:pan:right', doFourFingerPanRight); // As many fingers as the device supports!
    HI.on('pinch', zoom); // Pinch-to-zoom; patently obvious!
    HI.on('spread', zoomOut); // Opposite of pinch
    HI.on('multitouch:rotate:cw', rotateLeft); // Clockwise (two finger) rotation
    HI.on('multitouch:rotate:ccw', rotateRight); // Counter-clockwise
    HI.on('multitouch:rotate:aw', rotateRight); // Anticlockwise alias to CCW for British folks :)
    HI.on('multitouch:rotate:left', rotateLeft); // Another obvious alias
    HI.on('multitouch:rotate:right', rotateRight); // Alias again!
    HI.on('press', pressAndHold); // When the user presses and holds mouse/finger in one spot

Multitouch code is complicated enough that it probably warrants its own plugin (to keep the size down when you don't need it).

Clipboard and Selection Support
-------------------------------

HumanInput includes extensive support for clipboard and text selection events:

.. code-block:: javascript

    HI.on('paste', doStuffWithPaste);
    HI.on('copy', seeWhatWasCopied);
    HI.on('cut', seeWhatWasCut);
    // ...and you can match what was pasted/copied/cut in the event itself!
    HI.on('paste:"127.0.0.1"', remindUserAboutLocalhostBeingEasyToType);

Clipboard events are triggered with the ``ClipboardEvent.clipboardData`` as the second argument.  So you can see what the user cut/copied/pasted like so:

.. code-block:: javascript

    var clipboardHandler = function(event, data) {
        console.log('event:', event, 'clipboard data:', data);
    };
    HI.on(['cut', 'copy', 'paste'], clipboardHandler);

Text selection events work in a similar fashion and fire when the user releases their mouse (or with each selected letter if the user is highlighting text with the keyboard):

.. code-block:: javascript

    HI.on('select', somethingWasJustSelected);

You can also craft events that trigger when matching text is selected like so:

.. code-block:: javascript

    HI.on('select:"select this text"', userFollowsDirections);

Context Menu Support
--------------------

Real simple:

.. code-block:: javascript

    HI.on('contextmenu', contextMenuFunc);

.. note:: This can be wicked useful when combined with scopes!

Window and Document Events
--------------------------

HumanInput supports tracking the state of the document and window via the following events:

.. code-block:: javascript

    HI.on('window:resized', windowWasResized);
    HI.on('document:hidden', enableNinjaMode);
    HI.on('document:visible', disableNinjaMode);
    HI.on('window:orientation:landscape', doLandscapeView); // Alias: 'landscape'
    HI.on('window:orientation:portrait', doPortraitView); // Alias: 'portrait'

.. note:: These events are registered regardless of the element passed to HumanInput when it is instantiated (they are triggered infrequently enough that it shouldn't hurt anything).

Advanced Stuff
--------------

HumanInput Settings
^^^^^^^^^^^^^^^^^^^

Besides 'logLevel', 'listenEvents', 'uniqueNumpad', and 'noKeyRepeat' HumanInput takes the following settings:

    * sequenceTimeout (milliseconds) [3000]:  How long to wait before we clear out the sequence buffer and start anew.
    * maxSequenceBuf (number) [12]:  The maximum length of event sequences.
    * swipeThreshold (pixels) [100]:  How many pixels a finger has to transverse in order for it to be considered a swipe.

Extra Events
^^^^^^^^^^^^

* After initialization HumanInput triggers the 'hi:initialized' event.
* After pausing HumanInput triggers the 'hi:paused' event.
* After resuming from a pause the 'hi:resume' event will be triggered.

Gamepad Plugin
--------------

The HumanInput Gamepad plugin (which is automatically included in the '-full' version of humaninput.js) adds support for gamepads and joysticks allowing the use of the following event types:

    .. list-table:: Event Details
        :header-rows: 1
        * - Event
        - Details
        * - ``gpad:button:1:down``
        - Gamepad button 1 pressed
        * - ``gpad:button:1:up``
        - Gamepad button 1 released
        * - ``gpad:button:6``
        - Gamepad button 6 state changed (useful for pressure-sensitive buttons)
        * - ``gpad:axis:2``
        - Gamepad axis 2 changed state

Detection Events
^^^^^^^^^^^^^^^^

Whenever a new gamepad is detected the 'gpad:connected' event will fire with the Gamepad object as the only argument.

Button Events
^^^^^^^^^^^^^

When triggered, gpad:button events are called like so:

.. code-block:: javascript

    HI.trigger(event, buttonValue, gamepadObj);

You can listen for button events using ``HumanInput.on()`` like so:

.. code-block:: javascript

    // Ensure 'gamepad' is included in listenEvents if not calling gamepadUpdate() in your own loop:
    var settings = {listenEvents: HumanInput.defaultListenEvents.concat(['gamepad'])};
    var HI = new HumanInput(window, settings);
    var shoot = function(buttonValue, gamepadObj) {
        HI.log.info('Fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
    };
    HI.on('gpad:button:1:down', shoot); // Call shoot(buttonValue, gamepadObj) when gamepad button 1 is down
    var stopShooting = function(buttonValue, gamepadObj) {
        HI.log.info('Cease fire! Button value:', buttonValue, 'Gamepad object:', gamepadObj);
    };
    HI.on('gpad:button:1:up', stopShooting); // Call stopShooting(buttonValue, gamepadObj) when gamepad button 1 is released (up)

For more detail with button events (e.g. you want fine-grained control with pressure-sensitive buttons) just neglect to add ':down' or ':up' to the event:

.. code-block:: javascript

    HI.on('gpad:button:6', shoot);

.. note:: The resulting buttonValue can be any value between 0 (up) and 1 (down).  Pressure sensitive buttons (like L2 and R2 on a DualShock controller) will often have floating point values representing how far down the button is pressed such as ``0.8762931823730469``.

Button Combo Events
^^^^^^^^^^^^^^^^^^^

When multiple gamepad buttons are held down a button combo event will be fired like so:

.. code-block:: javascript

    HI.trigger("gpad:button:0-gpad:button:1", gamepadObj);

In the above example gamepad button 0 and button 1 were both held down simultaneously.  This works with as many buttons as the gamepad supports and can be extremely useful for capturing diagonal movement on a dpad.  For example, if you know that button 14 is left and button 13 is right you can use them to define diagonal movement like so:

.. code-block:: javascript

    HI.on("gpad:button:13-gpad:button:14", downLeft);

Events triggered in this way will be passed the Gamepad object as the only argument.

.. note:: Button combo events will always trigger *before* other button events.

Axis Events
^^^^^^^^^^^

When triggered, gpad:axis events are called like so:

.. code-block:: javascript

    HI.trigger(event, axisValue, GamepadObj);

You can listen for axis events using :js:func:`HumanInput.on` like so:

.. code-block:: javascript

    var moveBackAndForth = function(axisValue, gamepadObj) {
        if (axisValue < 0) {
            console.log('Moving forward at speed: ' + axisValue);
        } else if (axisValue > 0) {
            console.log('Moving backward at speed: ' + axisValue);
        }
    };
    HI.on('gpad:axis:1', moveBackAndForth);

.. topic:: Game and Application Loops

    If your game or application has its own event loop that runs at least once every ~100ms or so then it may be beneficial to call ``HumanInput.gamepadUpdate`` inside your own loop *instead* of passing 'gamepad' via the 'listenEvents' setting.  Calling ``HumanInput.gamepadUpdate()`` is very low overhead (takes less than a millisecond) but HumanInput's default gamepad update loop is only once every 100ms. If you don't want to use your own loop but want HumanInput to update the gamepad events more rapidly you can reduce the 'gpadInterval' setting.  Just note that if you set it too low it will increase CPU utilization which may have negative consequences for your application.

.. note:: The update interval timer will be disabled if the page is no longer visible (i.e. the user switched tabs).  The interval timer will be restored when the page becomes visible again.  This is handled via the Page Visibility API (visibilitychange event).

Gamepad State Tracking
^^^^^^^^^^^^^^^^^^^^^^

The state of all buttons and axes on all connected gamepads/joysticks can be read at any time via the `HumanInput.gamepads` property:

.. code-block:: javascript

    var HI = HumanInput();
    for (var i=0; i < HI.gamepads.length; i++) {
        console.log('Gamepad ' + i + ':', HI.gamepads[i]);
    });

.. note:: The index position of a gamepad in the `HumanInput.gamepads` array will always match the Gamepad object's 'index' property.

Speech Recognition Plugin
-------------------------

The HumanInput Gamepad plugin (which is automatically included in the '-full' version of humaninput.js) adds support for triggering events based on speech recognition.  It only works in Chrome at the moment but some day other browsers will support speech recognition too.  Here's how to use it:

.. code-block:: javascript

    // Call a function when "This is a test" is recognized
    HI.on('speech:"This is a test"', function(e) {
        HI.log.info("Recognized 'This is a test'");
    });
    // Call a function when "this is" is recognized as fast as possible
    HI.on('speech:rt"This is a"', function(e) {
        HI.log.info("Recognized 'This is a test'");
    });

.. note:: There's a demo for speech recognition in the demo directory named, 'dictate'.

What's the difference between 'speech' and 'speech:rt'?  The 'speech:rt' form is fired more often and isn't as accurate.  It's basically, "our best immediate guess as to what you said" whereas 'speech' is for the final, "after careful analysis this is what the computer thinks you said."

Language Selection
^^^^^^^^^^^^^^^^^^

The speech recognition plugin attempts to detect your speaking language using the locale set in your browser.  If it cannot be detected it will fall back to using "en_US".  Alternatively, you can specify 'speechLang' as a setting when instantiating HumanInput like so:

.. code-block:: javascript

    var settings = {speechLang: "en_US"};
    var HI = new HumanInput(window, settings);

Starting Speech Recognition (and autostartSpeech)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

By default the speech recognition plugin does not start listening for speech until you invoke ``HI.startSpeechRec()``.  You can later stop listening for speech by calling ``HI.stopSpeechRec()``.  If you want speech recognition to start immediately after HumanInput is instantiated supply the ``autostartSpeech = true`` setting:

.. code-block:: javascript

    var settings = {autostartSpeech: true};
    var HI = new HumanInput(window, settings);

.. note:: Speech recognition will automatically be paused when the document becomes hidden and resumed when it becomes visible (active) again.
