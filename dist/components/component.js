"use strict";

var _explorer = _interopRequireDefault(require("./explorer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var EventEmitter = require("eventemitter2").EventEmitter2;

module.exports =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Component, _EventEmitter);

  function Component(advertisement) {
    var _this;

    var explorerOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Component);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Component).call(this, {
      "wildcard": true,
      // should the event emitter use wildcards.
      "delimiter": "::",
      // the delimiter used to segment namespaces, defaults to `.`.
      "newListener": false,
      // if you want to emit the newListener event set to true.
      "maxListeners": 2000 // the max number of listeners that can be assigned to an event, defaults to 10.

    }));
    advertisement.key = "".concat(_this.constructor.environment, "$$").concat(advertisement.key || "");
    _this.advertisement = advertisement;
    _this.advertisement.axon_type = _this.type;
    _this.explorerOptions = _objectSpread({}, _explorer["default"].defaults, {}, explorerOptions);
    _this.explorerOptions.address = _this.explorerOptions.address || "0.0.0.0";
    return _this;
  }

  _createClass(Component, [{
    key: "startExplorer",
    value: function startExplorer() {
      var _this2 = this;

      this.explorer = new _explorer["default"](this.advertisement, this.explorerOptions);
      this.explorer.on("added", function (item) {
        if (item.advertisement.axon_type != _this2.oppo || item.advertisement.key != _this2.advertisement.key || _this2.advertisement.namespace != item.advertisement.namespace) {
          return;
        }

        _this2.onAdded(item);

        _this2.emit("servious:added", item);
      });
      this.explorer.on("removed", function (item) {
        if (item.advertisement.axon_type != _this2.oppo || item.advertisement.key != _this2.advertisement.key || _this2.advertisement.namespace != item.advertisement.namespace) {
          return;
        }

        _this2.onRemoved(item);

        _this2.emit("servious:removed", item);
      });
    }
  }, {
    key: "onAdded",
    value: function onAdded() {}
  }, {
    key: "onRemoved",
    value: function onRemoved() {}
  }, {
    key: "close",
    value: function close() {
      this.sock && this.sock.close();
      this.explorer && this.explorer.stop();
    }
  }]);

  return Component;
}(EventEmitter);