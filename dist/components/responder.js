"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var axon = require("@dashersw/axon");

var portfinder = require("portfinder");

var Configurable = require("./configurable");

var Component = require("./component");

var Responder =
/*#__PURE__*/
function (_Configurable) {
  _inherits(Responder, _Configurable);

  function Responder(advertisement, explorerOptions) {
    var _this;

    _classCallCheck(this, Responder);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Responder).call(this, advertisement, explorerOptions));
    _this.sock = new axon.types[_this.type]();

    _this.sock.on("bind", function () {
      return _this.startExplorer();
    });

    _this.sock.on("message", function (req, cb) {
      if (!req.type) {
        return;
      }

      if (_this.listeners(req.type).length === 0 && _this.explorerOptions.logUnknownEvents) {
        _this.explorer.log([_this.advertisement.name, ">", "No listeners found for event: ".concat(req.type).yellow]);
      }

      _this.emit(req.type, req, cb);
    });

    var onPort = function onPort(err, port) {
      _this.advertisement.port = +port;

      _this.sock.bind(port);

      _this.sock.server.on("error", function (err) {
        if (err.code != "EADDRINUSE") {
          throw err;
        }

        portfinder.getPort({
          "host": _this.explorerOptions.address,
          "port": _this.advertisement.port
        }, onPort);
      });
    };

    portfinder.getPort({
      "host": _this.explorerOptions.address,
      "port": advertisement.port
    }, onPort);
    return _this;
  }

  _createClass(Responder, [{
    key: "on",
    value: function on(type, listener) {
      _get(_getPrototypeOf(Responder.prototype), "on", this).call(this, type, function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var rv = listener.apply(void 0, args);

        if (rv && typeof rv.then == "function") {
          var cb = args.pop();
          rv.then(function (val) {
            return cb(null, val);
          })["catch"](cb);
        }
      });
    }
  }, {
    key: "type",
    get: function get() {
      return "rep";
    }
  }, {
    key: "oppo",
    get: function get() {
      return "req";
    }
  }]);

  return Responder;
}(Configurable(Component));

exports["default"] = Responder;