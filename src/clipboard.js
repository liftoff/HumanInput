/**
 * clipboard.js - HumanInput Clipboard Plugin: Adds support for cut, copy, paste, select, and input events to HumanInput
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/clipboard.js
 * @license plublic domain
 */

import { handlePreventDefault } from './utils';
import HumanInput from './humaninput';

HumanInput.defaultListenEvents = HumanInput.defaultListenEvents.concat(['cut', 'copy', 'paste', 'select']);

export class ClipboardPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        this.HI = HI;
        HI._clipboard = this._clipboard.bind(HI);
        this._paste = this._clipboard;
        this._copy = this._clipboard;
        this._cut = this._clipboard;
        HI._select = this._select.bind(HI);
        this._input = this._select;
    }

    init(HI) {
        return this; // So it gets logged as being initialized
    }

    _clipboard(e) {
        var data;
        var event = e.type + ':"';
        if (this.filter(e)) {
            if (window.clipboardData) { // IE
                data = window.clipboardData.getData('Text');
            } else if (e.clipboardData) { // Standards-based browsers
                data = e.clipboardData.getData('text/plain');
            }
            if (!data && (e.type == 'copy' || e.type == 'cut')) {
                data = this.getSelText();
            }
            if (data) {
                // First trigger a generic event so folks can just grab the copied/cut/pasted data
                let results = this._triggerWithSelectors(e.type, [e, data]);
                // Now trigger a more specific event that folks can match against
                results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                handlePreventDefault(e, results);
            }
        }
    }

    _select(e) {
        // Handles triggering 'select' *and* 'input' events (since they're so similar)
        var event = e.type + ':"';
        if (e.type == 'select') { var data = this.getSelText(); }
        else if (e.type == 'input') { var data = e.data || e.target.value; }
        if (this.filter(e)) {
            let results = this._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                results = results.concat(this._triggerWithSelectors(event + data + '"', [e]));
                handlePreventDefault(e, results);
            }
        }
    }

}

HumanInput.plugins.push(ClipboardPlugin);
