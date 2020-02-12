"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _utils = require("../utils");

var _ampMessage = _interopRequireDefault(require("amp-message"));

var _socket = _interopRequireDefault(require("./socket"));

var debug = require('debug')('servious:res');

var RepSocket =
/*#__PURE__*/
function (_Socket) {
  (0, _inherits2["default"])(RepSocket, _Socket);

  function RepSocket(props) {
    (0, _classCallCheck2["default"])(this, RepSocket);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(RepSocket).call(this, props));
  }

  (0, _createClass2["default"])(RepSocket, [{
    key: "id",
    value: function id() {
      return "".concat(this.identity, ":").concat(this.ids++);
    }
  }, {
    key: "onmessage",
    value: function onmessage(sock) {
      var self = this;
      return function (buf) {
        var msg = new _ampMessage["default"](buf);
        var args = msg.args;
        var id = args.pop();

        var reply = function reply() {
          var fn = function fn() {};

          var req = (0, _utils.slice)(arguments);
          req[0] = req[0] || null;
          var hasCallback = typeof req[req.length - 1] == 'function';

          if (hasCallback) {
            fn = req.pop();
          }

          req.push(id);

          if (sock.writable) {
            sock.write(self.pack(req), function () {
              fn(true);
            });
            return true;
          }

          debug('peer went away');
          process.nextTick(function () {
            fn(false);
          });
          return false;
        };

        args.unshift('message');
        args.push(reply);
        self.emit.apply(self, (0, _toConsumableArray2["default"])(args));
      };
    }
  }]);
  return RepSocket;
}(_socket["default"]);

exports["default"] = RepSocket;