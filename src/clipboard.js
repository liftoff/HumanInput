import { handlePreventDefault } from './utils';
import HumanInput from './humaninput';

HumanInput.defaultListenEvents = HumanInput.defaultListenEvents.concat(['cut', 'copy', 'paste', 'select']);

export class ClipboardPlugin {

    constructor(HI) { // HI == current instance of HumanInput
        var self = this;
        self.HI = HI;
        HI._clipboard = self._clipboard.bind(HI);
        self._paste = self._clipboard;
        self._copy = self._clipboard;
        self._cut = self._clipboard;
        HI._select = self._select.bind(HI);
        self._input = self._select;
        self.log = new HI.Logger(HI.settings.logLevel || 'INFO', '[HI Clipboard]');
    }

    init(HI) {
        this.log.debug(HI.l("Initializing Clipboard Plugin"), this);
    }

    _clipboard(e) {
        var self = this;
        var data;
        var event = e.type + ':"';
        if (self.filter(e)) {
            if (window.clipboardData) { // IE
                data = window.clipboardData.getData('Text');
            } else if (e.clipboardData) { // Standards-based browsers
                data = e.clipboardData.getData('text/plain');
            }
            if (!data && (e.type == 'copy' || e.type == 'cut')) {
                data = self.getSelText();
            }
            if (data) {
                // First trigger a generic event so folks can just grab the copied/cut/pasted data
                let results = self._triggerWithSelectors(e.type, [e, data]);
                // Now trigger a more specific event that folks can match against
                results = results.concat(self._triggerWithSelectors(event + data + '"', [e]));
                handlePreventDefault(e, results);
            }
        }
    }

    _select(e) {
        // Handles triggering 'select' *and* 'input' events (since they're so similar)
        var self = this;
        var event = e.type + ':"';
        if (e.type == 'select') { var data = self.getSelText(); }
        else if (e.type == 'input') { var data = e.data || e.target.value; }
        if (self.filter(e)) {
            let results = self._triggerWithSelectors(e.type, [e, data]);
            if (data) {
                results = results.concat(self._triggerWithSelectors(event + data + '"', [e]));
                handlePreventDefault(e, results);
            }
        }
    }

}

HumanInput.plugins.push(ClipboardPlugin);
