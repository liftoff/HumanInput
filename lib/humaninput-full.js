(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'exports', './humaninput', './clipboard', './scroll', './pointer', './speechrec', './gamepad', './clapper', './idle'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require('./humaninput'), require('./clipboard'), require('./scroll'), require('./pointer'), require('./speechrec'), require('./gamepad'), require('./clapper'), require('./idle'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.humaninput, global.clipboard, global.scroll, global.pointer, global.speechrec, global.gamepad, global.clapper, global.idle);
    global.humaninputFull = mod.exports;
  }
})(this, function (module, exports, _humaninput, _clipboard, _scroll, _pointer, _speechrec, _gamepad, _clapper, _idle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _humaninput2 = _interopRequireDefault(_humaninput);

  var _clipboard2 = _interopRequireDefault(_clipboard);

  var _scroll2 = _interopRequireDefault(_scroll);

  var _pointer2 = _interopRequireDefault(_pointer);

  var _speechrec2 = _interopRequireDefault(_speechrec);

  var _gamepad2 = _interopRequireDefault(_gamepad);

  var _clapper2 = _interopRequireDefault(_clapper);

  var _idle2 = _interopRequireDefault(_idle);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = _humaninput2.default;
  module.exports = exports['default'];
});