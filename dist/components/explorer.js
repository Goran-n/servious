"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
  (0, _inherits2["default"])(Explorer, _Explore);

  function Explorer(advertisement, options) {
    var _this;

    (0, _classCallCheck2["default"])(this, Explorer);
    options = _objectSpread({}, defaultOptions, {}, Explorer.defaults, {}, options);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Explorer).call(this, options));
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

  (0, _createClass2["default"])(Explorer, [{
    key: "log",
    value: function log(logs) {
      console.log.apply(console.log, logs);
    }
  }, {
    key: "helloLogger",
    value: function helloLogger() {
      return ["\nHello! I'm".white].concat((0, _toConsumableArray2["default"])(this.statusLogger(this.me)), ["\n========================\n".white]);
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