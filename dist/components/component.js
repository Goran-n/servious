"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _explorer = _interopRequireDefault(require("./explorer"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var EventEmitter = require("eventemitter2").EventEmitter2;

module.exports =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2["default"])(Component, _EventEmitter);

  function Component(advertisement) {
    var _this;

    var explorerOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Component);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Component).call(this, {
      "wildcard": true,
      // should the event emitter use wildcards.
      "delimiter": "::",
      // the delimiter used to segment namespaces, defaults to `.`.
      "newListener": false,
      // if you want to emit the newListener event set to true.
      "maxListeners": 2000 // the max number of listeners that can be assigned to an event, defaults to 10.

    }));
    advertisement.key = "".concat(_this.constructor.environment, "$$").concat(advertisement.key || "");
    _this.timeout = 30;
    _this.advertisement = advertisement;
    _this.advertisement.node_type = _this.type;
    _this.explorerOptions = _objectSpread({}, _explorer["default"].defaults, {}, explorerOptions);
    _this.explorerOptions.address = _this.explorerOptions.address || "0.0.0.0";
    return _this;
  }

  (0, _createClass2["default"])(Component, [{
    key: "startExplorer",
    value: function startExplorer() {
      var _this2 = this;

      this.explorer = new _explorer["default"](this.advertisement, this.explorerOptions);
      this.explorer.on("added", function (item) {
        if (item.advertisement.node_type !== _this2.oppo || item.advertisement.key !== _this2.advertisement.key || _this2.advertisement.namespace !== item.advertisement.namespace) {
          return;
        }

        if (_this2.onAdded) {
          _this2.onAdded(item);
        }

        _this2.emit("servious:added", item);
      });
      this.explorer.on("removed", function (item) {
        if (item.advertisement.node_type !== _this2.oppo || item.advertisement.key !== _this2.advertisement.key || _this2.advertisement.namespace !== item.advertisement.namespace) return;

        _this2.onRemoved(item);

        _this2.emit("servious:removed", item);
      });
    }
  }, {
    key: "close",
    value: function close() {
      this.sock && this.sock.close();
      this.explorer && this.explorer.stop();
    }
  }]);
  return Component;
}(EventEmitter);