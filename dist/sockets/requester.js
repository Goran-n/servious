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

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _lodash = _interopRequireDefault(require("lodash"));

var _queue = _interopRequireDefault(require("../plugins/queue"));

var _utils = require("../utils");

var _ampMessage = _interopRequireDefault(require("amp-message"));

var _socket = _interopRequireDefault(require("./socket"));

var debug = require('debug')('servious:req');

/**
 * Initialize a new `ReqSocket`.
 *
 * @api private
 */
var ReqSocket =
/*#__PURE__*/
function (_Socket) {
  (0, _inherits2["default"])(ReqSocket, _Socket);

  function ReqSocket(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, ReqSocket);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(ReqSocket).call(this, props));
    _this.n = 0;
    _this.ids = 0;
    _this.callbacks = {};
    _this.identity = String(process.pid);

    _this.set('hwm', Infinity);

    _this.set('retry timeout', 100);

    _this.set('retry max timeout', 5000);

    _this.use((0, _queue["default"])());

    return _this;
  }

  (0, _createClass2["default"])(ReqSocket, [{
    key: "id",
    value: function id() {
      return "".concat(this.identity, ":").concat(this.ids++);
    }
  }, {
    key: "onmessage",
    value: function onmessage() {
      var self = this;
      return function (buf) {
        var msg = new _ampMessage["default"](buf);
        var id = msg.pop();
        var fn = self.callbacks[id];

        if (!fn) {
          return debug('missing callback %s', id);
        }

        fn.apply(null, msg.args);
        delete self.callbacks[id];
      };
    }
  }, {
    key: "selectSocket",
    value: function selectSocket(targetService) {
      if (this.socks.length > 0) {
        var socks = this.socks.filter(function (item) {
          return !!(item && item.advertisement && item.advertisement.name === targetService);
        });
        debug("Found ".concat(socks.length, " ").concat(targetService, " services"));
        return socks[this.n++ % socks.length];
      }

      return false;
    }
  }, {
    key: "sender",
    value: function sender() {
      var args = (0, _utils.slice)(arguments);
      var sock = this.selectSocket(args[0].service);

      if (sock) {
        var hasCallback = typeof args[args.length - 1] == 'function';

        if (!hasCallback) {
          args.push(function () {});
        }

        var fn = args.pop();
        fn.id = this.id();
        this.callbacks[fn.id] = fn;
        args.push(fn.id);
      }

      if (sock) {
        sock.write(this.pack(args));
      } else {
        debug('no connected peers');
        this.enqueue(args);
      }
    }
  }]);
  return ReqSocket;
}(_socket["default"]);

exports["default"] = ReqSocket;