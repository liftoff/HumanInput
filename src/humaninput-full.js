// The bare minimum of HumanInput:
//  keyboard, contextmenu, window, and other basic events that don't need special handling:
import HumanInput from './humaninput';

// Add Pointer, Mouse, Touch, and Multitouch support:
import PointerPlugin from './pointer';

module.exports = HumanInput;
