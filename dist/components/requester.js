"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var axon = require('@dashersw/axon');

var debug = require('debug')('axon:req');

var Configurable = require('./configurable');

var Monitorable = require('./monitorable');

var Component = require('./component');

var SUBSET_IDENTIFIER = '__subset';

var Requester =
/*#__PURE__*/
function (_Monitorable) {
  (0, _inherits2["default"])(Requester, _Monitorable);

  function Requester(advertisement, explorerOptions) {
    var _this;

    (0, _classCallCheck2["default"])(this, Requester);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Requester).call(this, advertisement, explorerOptions));
    _this.sock = new axon.types[_this.type]();

    _this.sock.set('retry timeout', 0);

    _this.timeout = advertisement.timeout || process.env.SERVIOUS_REQ_TIMEOUT;
    _this.sock.send = _this.socketSend.bind((0, _assertThisInitialized2["default"])(_this));

    _this.startExplorer();

    return _this;
  }

  (0, _createClass2["default"])(Requester, [{
    key: "filterSubsetInSocks",
    value: function filterSubsetInSocks(subset, socks) {
      // Find correct nodes
      var possibleNodes = Object.values(this.explorer.nodes).filter(function (node) {
        return node.advertisement.subset == subset;
      }); // Find corresponding sockets

      var possibleSocks = possibleNodes.map(function (node) {
        return socks.find(function (sock) {
          return sock.remoteAddress == node.address && sock.remotePort == node.advertisement.port;
        });
      }).filter(function (sock) {
        return sock;
      });
      return possibleSocks;
    }
  }, {
    key: "socketSend",
    value: function socketSend() {
      var socks = this.sock.socks; // Enqueue if no socks connected yet

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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

      (0, _get2["default"])((0, _getPrototypeOf2["default"])(Requester.prototype), "onAdded", this).call(this, obj);
      var address = this.constructor.useHostNames ? obj.hostName : obj.address;
      var alreadyConnected = this.sock.socks.some(function (s) {
        return (_this2.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) && s.remotePort == obj.advertisement.port;
      });

      if (alreadyConnected) {
        return;
      }

      this.sock.connect(obj.advertisement.port, address);
    }
  }, {
    key: "send",
    value: function send() {
      var _this3 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var hasCallback = typeof args[args.length - 1] == 'function';
      var timeout = args[0].__timeout || this.timeout;

      if (hasCallback) {
        return sendOverSocket.apply(void 0, [this.sock, timeout].concat(args));
      }

      return new Promise(function (resolve, reject) {
        sendOverSocket.apply(void 0, [_this3.sock, timeout].concat(args, [function (err, res) {
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
}(Monitorable(Configurable(Component)));

exports["default"] = Requester;

function sendOverSocket(sock, timeout) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    args[_key3 - 2] = arguments[_key3];
  }

  if (!timeout) {
    return sock.send.apply(sock, args);
  }

  var cb = args.pop();
  var timeoutHandle = setTimeout(function () {
    // Remove the request from the request queue so that it's not sent to responders (#183)
    var req = sock.queue.findIndex(function (r) {
      return r[r.length - 1] == messageCallback;
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

  sock.send.apply(sock, args.concat([messageCallback]));
}