import { handlePreventDefault, debounce } from './utils';
import HumanInput from './humaninput';

HumanInput.defaultListenEvents.push('scroll');

export class ScrollPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        var self = this;
        self.HI = HI;
        HI._scroll = debounce(self._scroll.bind(HI), 50);
        HI.on('hi:resetstates', self._resetStates, HI);
        self.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Scroll]');
    }

    init(HI) {
        var self = this;
        var state = HI.state;
        self.log.debug(HI.l("Initializing Scroll Plugin"), self);
        state.scrollX = 0;       // Tracks the distance scrolled in 'scroll' events
        state.scrollY = 0;       // Ditto
        return self;
    }

    _resetStates() {
        this.state.scrollX = 0;
        this.state.scrollY = 0;
    }

    _scroll(e) {
    // NOTE:  Intentionally not adding scroll events to the sequence buffer since a whole lot of them can be generated in a single scroll
        var results, scrollXDiff, scrollYDiff,
            self = this,
            state = self.state,
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
        results = self._triggerWithSelectors(e.type, [e, {x: scrollXDiff, y: scrollYDiff}]);
        // NOTE:  self.state.scrollX and self.state.scrollY just track the previous position; not the diff
        if (scrollX !== undefined && scrollX !== state.scrollX) {
            scrollXDiff = Math.abs(scrollXDiff);
            if (scrollX > state.scrollX) {
                results = results.concat(self._triggerWithSelectors(e.type + ':right', [e, scrollXDiff]));
            } else {
                results = results.concat(self._triggerWithSelectors(e.type + ':left', [e, scrollXDiff]));
            }
            state.scrollX = scrollX;
        }
        if (scrollY !== undefined && scrollY !== state.scrollY) {
            scrollYDiff = Math.abs(scrollYDiff);
            if (scrollY > state.scrollY) {
                results = results.concat(self._triggerWithSelectors(e.type + ':down', [e, scrollYDiff]));
            } else {
                results = results.concat(self._triggerWithSelectors(e.type + ':up', [e, scrollYDiff]));
            }
            state.scrollY = scrollY;
        }
        handlePreventDefault(e, results);
    }

}

HumanInput.plugins.push(ScrollPlugin);
