// The bare minimum of HumanInput:
//  keyboard, contextmenu, window, and other basic events that don't need special handling:
import HumanInput from './humaninput';

// Clipboard support
import ClipboardPlugin from './scroll';

// Scrolling support
import ScrollPlugin from './scroll';

// Add Pointer, Mouse, Touch, and Multitouch support:
import PointerPlugin from './pointer';

// Speech Recognition
import SpeechRecPlugin from './speechrec';

export default HumanInput;
