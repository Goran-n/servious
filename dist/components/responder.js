"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _responder = _interopRequireDefault(require("../sockets/responder"));

var portfinder = require('portfinder');

var Configurable = require('./configurable');

var Component = require('./component');

var Responder =
/*#__PURE__*/
function (_Configurable) {
  (0, _inherits2["default"])(Responder, _Configurable);

  function Responder(advertisement, explorerOptions) {
    var _this;

    (0, _classCallCheck2["default"])(this, Responder);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Responder).call(this, advertisement, explorerOptions));
    _this.sock = new _responder["default"]();

    _this.sock.on('bind', function () {
      return _this.startExplorer();
    });

    _this.sock.on('message', function (req, cb) {
      if (!req.type) {
        return;
      }

      if (_this.listeners(req.type).length === 0 && _this.explorerOptions.logUnknownEvents) {
        _this.log([_this.advertisement.name, '>', "No listeners found for event: ".concat(req.type).yellow]);
      }

      _this.emit(req.type, req, cb);
    });

    var onPort = function onPort(err, port) {
      _this.advertisement.port = +port;

      _this.sock.bind(port);

      _this.sock.server.on('error', function (err) {
        if (err.code !== 'EADDRINUSE') {
          throw err;
        }

        portfinder.getPort({
          host: _this.explorerOptions.address,
          port: _this.advertisement.port
        }, onPort);
      });
    };

    portfinder.getPort({
      host: _this.explorerOptions.address,
      port: advertisement.port
    }, onPort);
    return _this;
  }

  (0, _createClass2["default"])(Responder, [{
    key: "on",
    value: function on(type, listener) {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(Responder.prototype), "on", this).call(this, type, function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var rv = listener.apply(void 0, args);

        if (rv && typeof rv.then == 'function') {
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
      return 'rep';
    }
  }, {
    key: "oppo",
    get: function get() {
      return 'req';
    }
  }]);
  return Responder;
}(Configurable(Component));

exports["default"] = Responder;