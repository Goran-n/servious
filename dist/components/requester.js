"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _requester = _interopRequireDefault(require("../sockets/requester"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var debug = require('debug')('servious:req');

var Configurable = require('./configurable');

var Component = require('./component');

var SUBSET_IDENTIFIER = '__subset';

var sendOverSocket = function sendOverSocket(sock, timeout) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  if (!timeout) {
    return sock.sender.apply(sock, args);
  }

  var cb = args.pop();
  var timeoutHandle = setTimeout(function () {
    var req = sock.queue.findIndex(function (r) {
      return r[r.length - 1] === messageCallback;
    });

    if (req > -1) {
      sock.queue.splice(req, 1);
    } // Remove the request callback


    delete sock.callbacks[messageCallback.id];
    cb(new Error('Request timed out.'));
  }, timeout);

  var messageCallback = function messageCallback() {
    clearTimeout(timeoutHandle);
    cb.apply(void 0, arguments);
  };

  sock.sender.apply(sock, args.concat([messageCallback]));
};

var Requester =
/*#__PURE__*/
function (_Configurable) {
  (0, _inherits2["default"])(Requester, _Configurable);

  function Requester(advertisement, explorerOptions) {
    var _this;

    (0, _classCallCheck2["default"])(this, Requester);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Requester).call(this, advertisement, explorerOptions));
    _this.sock = new _requester["default"]();

    _this.sock.set('retry timeout', 0);

    _this.timeout = advertisement.timeout || process.env.SERVIOUS_REQ_TIMEOUT || 12000;
    _this.sock.send = _this.socketSend.bind((0, _assertThisInitialized2["default"])(_this));

    _this.startExplorer();

    return _this;
  }

  (0, _createClass2["default"])(Requester, [{
    key: "filterSubsetInSocks",
    value: function filterSubsetInSocks(subset, socks) {
      // Find correct nodes
      var possibleNodes = Object.values(this.explorer.nodes).filter(function (node) {
        return node.advertisement.subset === subset;
      }); // Find corresponding sockets

      return possibleNodes.map(function (node) {
        return socks.find(function (sock) {
          return sock.remoteAddress === node.address && sock.remotePort === node.advertisement.port;
        });
      }).filter(function (sock) {
        return sock;
      });
    }
  }, {
    key: "socketSend",
    value: function socketSend() {
      var socks = this.sock.socks; // Enqueue if no socks connected yet

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (!socks || !socks.length) {
        debug('no connected peers');
        return this.sock.enqueue(args);
      }

      var data = args[0];
      var subset = data[SUBSET_IDENTIFIER];
      var possibleSocks = subset ? this.filterSubsetInSocks(subset, socks) : socks; // Enqueue if the correct nodes did not connect yet/does not exist

      if (!possibleSocks.length) {
        return this.sock.enqueue(args);
      } // Balances out node availability


      var sock = possibleSocks[this.sock.n++ % possibleSocks.length];
      var fn = args.pop();
      fn.id = this.sock.id();
      this.sock.callbacks[fn.id] = fn;
      args.push(fn.id);
      delete args[0][SUBSET_IDENTIFIER]; // Remove subset idf if present from message

      sock.write(this.sock.pack(args));
    }
  }, {
    key: "onAdded",
    value: function onAdded(obj) {
      var _this2 = this;

      var address = this.constructor.useHostNames ? obj.hostName : obj.address;
      var alreadyConnected = this.sock.socks.some(function (s) {
        return (_this2.constructor.useHostNames ? s._host === obj.hostName : s.remoteAddress === address) && s.remotePort === obj.advertisement.port;
      });

      if (alreadyConnected) {
        return;
      }

      this.sock.connect(_objectSpread({}, obj, {
        host: address
      }));
    }
  }, {
    key: "onRemoved",
    value: function onRemoved(obj) {
      var _this3 = this;

      var address = this.constructor.useHostNames ? obj.hostName : obj.address;
      var alreadyConnected = this.sock.socks.some(function (s) {
        return (_this3.constructor.useHostNames ? s._host === obj.hostName : s.remoteAddress === address) && s.remotePort === obj.advertisement.port;
      });

      if (alreadyConnected) {
        return;
      }

      this.sock.connect(obj.advertisement.port, address);
    }
  }, {
    key: "send",
    value: function send() {
      var _this4 = this;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var hasCallback = typeof args[args.length - 1] == 'function';
      var timeout = args[0].__timeout || this.timeout;

      if (hasCallback) {
        return sendOverSocket.apply(void 0, [this.sock, timeout].concat(args));
      }

      return new Promise(function (resolve, reject) {
        sendOverSocket.apply(void 0, [_this4.sock, timeout].concat(args, [function (err, res) {
          if (err) {
            return reject(err);
          }

          resolve(res);
        }]));
      });
    }
  }, {
    key: "type",
    get: function get() {
      return 'req';
    }
  }, {
    key: "oppo",
    get: function get() {
      return 'rep';
    }
  }]);
  return Requester;
}(Configurable(Component));

exports["default"] = Requester;