"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

var Explore = require("@dashersw/node-discover"); // eslint-disable-next-line


var colors = require('colors');

var defaultOptions = {
  "helloInterval": 2000,
  "checkInterval": 4000,
  "nodeTimeout": 5000,
  "masterTimeout": 6000,
  "monitor": false,
  "log": true,
  "helloLogsEnabled": true,
  "statusLogsEnabled": true,
  "ignoreProcess": false
};

var Explorer =
/*#__PURE__*/
function (_Explore) {
  _inherits(Explorer, _Explore);

  function Explorer(advertisement, options) {
    var _this;

    _classCallCheck(this, Explorer);

    options = _objectSpread({}, defaultOptions, {}, Explorer.defaults, {}, options);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Explorer).call(this, options));
    _this.advertisement = _objectSpread({
      "type": "service"
    }, advertisement);

    _this.advertise(_this.advertisement);

    _this.me.id = _this.broadcast.instanceUuid;
    _this.me.processId = _this.broadcast.processUuid;
    _this.me.processCommand = process.argv.slice(1).map(function (n) {
      return n.split("/").slice(-2).join("/");
    }).join(" ");
    options.log && _this.log(_this.helloLogger());

    _this.on("added", function (obj) {
      if (!options.monitor && obj.advertisement.key != _this.advertisement.key) {
        return;
      }

      options.log && options.statusLogsEnabled && options.helloLogsEnabled && _this.log(_this.statusLogger(obj, "online"));
    });

    _this.on("removed", function (obj) {
      if (!options.monitor && obj.advertisement.key != _this.advertisement.key) {
        return;
      }

      options.log && options.statusLogsEnabled && _this.log(_this.statusLogger(obj, "offline"));
    });

    return _this;
  }

  _createClass(Explorer, [{
    key: "log",
    value: function log(logs) {
      console.log.apply(console.log, logs);
    }
  }, {
    key: "helloLogger",
    value: function helloLogger() {
      return ["\nHello! I'm".white].concat(_toConsumableArray(this.statusLogger(this.me)), ["\n========================\n".white]);
    }
  }, {
    key: "statusLogger",
    value: function statusLogger(obj, status) {
      var logs = [];

      if (status) {
        var statusLog = status == "online" ? ".online".green : ".offline".red;
        logs.push(this.advertisement.name, ">", obj.advertisement.type.magenta + statusLog);
      } else {
        logs.push();
      }

      logs.push("".concat(obj.advertisement.name.white).concat("#".grey).concat(obj.id.grey));

      if (obj.advertisement.port) {
        logs.push("on", obj.advertisement.port.toString().blue);
      }

      return logs;
    }
  }], [{
    key: "setDefaults",
    value: function setDefaults(options) {
      this.defaults = options;
    }
  }]);

  return Explorer;
}(Explore);

exports["default"] = Explorer;