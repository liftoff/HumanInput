// The bare minimum of HumanInput:
//  keyboard, contextmenu, window, and other basic events that don't need special handling
import HumanInput from './humaninput';

// Clipboard, selection, and input event support
import ClipboardPlugin from './clipboard';

// Scroll event support
import ScrollPlugin from './scroll';

// Pointer, mouse, touch, and multitouch event support
import PointerPlugin from './pointer';

// Speech recognition
import SpeechRecPlugin from './speechrec';

// Gamepad support
import GamepadPlugin from './gamepad';

// Clap detection support
import ClapperPlugin from './clapper';

// Idle timeout detection support
import IdlePlugin from './idle';

// Feedback plugin support
import FeedbackPlugin from './feedback';

export default HumanInput;
