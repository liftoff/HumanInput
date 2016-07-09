/**
 * scroll.js - HumanInput Scroll Plugin: Adds support for scroll events.
 * Copyright (c) 2016, Dan McDougall
 * @link https://github.com/liftoff/HumanInput/src/scroll.js
 * @license Apache-2.0
 */

import { handlePreventDefault, debounce } from './utils';
import HumanInput from './humaninput';

HumanInput.defaultListenEvents.push('scroll');

export class ScrollPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        this.HI = HI;
        HI._scroll = debounce(this._scroll.bind(HI), 50);
        HI.on('hi:resetstates', this._resetStates, HI);
    }

    init(HI) {
        var state = HI.state;
        state.scrollX = 0;       // Tracks the distance scrolled in 'scroll' events
        state.scrollY = 0;       // Ditto
        return this;
    }

    _resetStates() {
        this.state.scrollX = 0;
        this.state.scrollY = 0;
    }

    _scroll(e) {
    // NOTE:  Intentionally not adding scroll events to the sequence buffer since a whole lot of them can be generated in a single scroll
        var results, scrollXDiff, scrollYDiff,
            state = this.state,
            target = e.target,
            scrollX = target.scrollLeft,
            scrollY = target.scrollTop;
        if (target.scrollingElement) { // If it's available use it
            scrollX = target.scrollingElement.scrollLeft;
            scrollY = target.scrollingElement.scrollTop;
        }
        scrollXDiff = scrollX - state.scrollX;
        scrollYDiff = scrollY - state.scrollY;
        if (scrollYDiff === 0 && scrollXDiff === 0) {
            // Silly browser fired a scroll event when nothing actually moved.  WHY DO THEY DO THIS?!?
            return;
        }
        results = this._triggerWithSelectors(e.type, [e, {x: scrollXDiff, y: scrollYDiff}]);
        // NOTE:  this.state.scrollX and this.state.scrollY just track the previous position; not the diff
        if (scrollX !== undefined && scrollX !== state.scrollX) {
            scrollXDiff = Math.abs(scrollXDiff);
            if (scrollX > state.scrollX) {
                results = results.concat(this._triggerWithSelectors(e.type + ':right', [e, scrollXDiff]));
            } else {
                results = results.concat(this._triggerWithSelectors(e.type + ':left', [e, scrollXDiff]));
            }
            state.scrollX = scrollX;
        }
        if (scrollY !== undefined && scrollY !== state.scrollY) {
            scrollYDiff = Math.abs(scrollYDiff);
            if (scrollY > state.scrollY) {
                results = results.concat(this._triggerWithSelectors(e.type + ':down', [e, scrollYDiff]));
            } else {
                results = results.concat(this._triggerWithSelectors(e.type + ':up', [e, scrollYDiff]));
            }
            state.scrollY = scrollY;
        }
        handlePreventDefault(e, results);
    }

}

HumanInput.plugins.push(ScrollPlugin);
