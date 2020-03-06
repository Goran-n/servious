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

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var Emitter = require('events').EventEmitter;

var Configurable = require('configurable');

var debug = require('debug')('servious:sock');

var Message = require('amp-message');

var Parser = require('amp').Stream;

var url = require('url');

var net = require('net');

var fs = require('fs');
/**
 * Errors to ignore.
 */


var ignore = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENETUNREACH', 'ENETDOWN', 'EPIPE', 'ENOENT'];

var Socket =
/*#__PURE__*/
function (_Emitter) {
  (0, _inherits2["default"])(Socket, _Emitter);

  function Socket(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, Socket);
    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Socket).call(this, props)); // Make it configurable `.set()` etc.

    Configurable((0, _assertThisInitialized2["default"])(_this));
    _this.server = null;
    _this.socks = [];
    _this.settings = {};
    return _this;
  }

  (0, _createClass2["default"])(Socket, [{
    key: "use",
    value: function use(plugin) {
      plugin(this);
      return this;
    }
  }, {
    key: "pack",
    value: function pack(args) {
      var msg = new Message(args);
      return msg.toBuffer();
    }
  }, {
    key: "closeSockets",
    value: function closeSockets() {
      debug('%s closing %d connections', this.type, this.socks.length);
      this.socks.forEach(function (sock) {
        sock.destroy();
      });
    }
  }, {
    key: "close",
    value: function close(fn) {
      debug('%s closing', this.type);
      this.closing = true;
      this.closeSockets();

      if (this.server) {
        this.closeServer(fn);
      }
    }
  }, {
    key: "closeServer",
    value: function closeServer(fn) {
      debug('%s closing server', this.type);
      this.server.on('close', this.emit.bind(this, 'close'));
      this.server.close();
      fn && fn();
    }
  }, {
    key: "address",
    value: function address() {
      if (!this.server) {
        return;
      }

      var addr = this.server.address();
      addr.string = "tcp://".concat(addr.address, ":").concat(addr.port);
      return addr;
    }
  }, {
    key: "removeSocket",
    value: function removeSocket(sock) {
      var i = this.socks.indexOf(sock);

      if (!~i) {
        return;
      }

      debug('%s remove socket %d', this.type, i);
      this.socks.splice(i, 1);
    }
  }, {
    key: "addSocket",
    value: function addSocket(sock) {
      var parser = new Parser();
      var i = this.socks.push(sock) - 1;
      debug('%s add socket %d', this.type, i);
      sock.pipe(parser);
      parser.on('data', this.onmessage(sock));
    }
  }, {
    key: "handleErrors",
    value: function handleErrors(sock) {
      var self = this;
      sock.on('error', function (err) {
        debug('%s error %s', self.type, err.code || err.message);
        self.emit('socket error', err);
        self.removeSocket(sock);

        if (!~ignore.indexOf(err.code)) {
          return self.emit('error', err);
        }

        debug('%s ignored %s', self.type, err.code);
        self.emit('ignored error', err);
      });
    }
  }, {
    key: "onmessage",
    value: function onmessage(sock) {
      var self = this;
      return function (buf) {
        var msg = new Message(buf);
        self.emit.apply(self, ['message'].concat(msg.args));
      };
    }
  }, {
    key: "connect",
    value: function connect(_ref, fn) {
      var advertisement = _ref.advertisement,
          port = _ref.port,
          host = _ref.host;
      var self = this;

      if (this.type === 'server') {
        throw new Error('cannot connect() after bind()');
      }

      if (typeof host == 'function') {
        fn = host;
        host = undefined;
      }

      if (typeof port == 'string') {
        port = url.parse(port);

        if (port.protocol === 'unix:') {
          host = fn;
          fn = undefined;
          port = port.pathname;
        } else {
          host = port.hostname || '0.0.0.0';
          port = parseInt(port.port, 10);
        }
      } else {
        host = host || '0.0.0.0';
      }

      var max = self.get('retry max timeout');
      var sock = new net.Socket();
      sock.advertisement = advertisement;
      sock.setNoDelay();
      this.type = 'client';
      this.handleErrors(sock);
      sock.on('close', function () {
        self.emit('socket close', sock);
        self.connected = false;
        self.removeSocket(sock);

        if (self.closing) {
          return self.emit('close');
        }

        var retry = self.retry || self.get('retry timeout');
        sock.destroy(); // setTimeout(() => {
        //   debug('%s attempting reconnect', self.type);
        //   self.emit('reconnect attempt');
        //   self.connect({ port, host });
        //   self.retry = Math.round(Math.min(max, retry * 1.5)) || 2;
        // }, retry);
      });
      sock.on('connect', function () {
        debug('%s connect', self.type);
        self.connected = true;
        self.addSocket(sock);
        self.retry = self.get('retry timeout');
        self.emit('connect', sock);
        fn && fn();
      });
      debug('%s connect attempt %s:%s', self.type, host, port);
      sock.connect(port, host);
      return this;
    }
    /**
     * Handle connection.
     *
     * @param {Socket} sock
     * @api private
     */

  }, {
    key: "onconnect",
    value: function onconnect(sock) {
      var self = this;
      var addr = "".concat(sock.remoteAddress, ":").concat(sock.remotePort);
      debug('%s accept %s', self.type, addr);
      this.addSocket(sock);
      this.handleErrors(sock);
      this.emit('connect', sock);
      sock.on('close', function () {
        debug('%s disconnect %s', self.type, addr);
        self.emit('disconnect', sock);
        self.removeSocket(sock);
      });
    }
  }, {
    key: "bind",
    value: function bind(port, host, fn) {
      var self = this;

      if (this.type === 'client') {
        throw new Error('cannot bind() after connect()');
      }

      if (typeof host == 'function') {
        fn = host;
        host = undefined;
      }

      var unixSocket = false;

      if (typeof port == 'string') {
        port = url.parse(port);

        if (port.protocol === 'unix:') {
          host = fn;
          fn = undefined;
          port = port.pathname;
          unixSocket = true;
        } else {
          host = port.hostname || '0.0.0.0';
          port = parseInt(port.port, 10);
        }
      } else {
        host = host || '0.0.0.0';
      }

      this.type = 'server';
      this.server = net.createServer(this.onconnect.bind(this));
      debug('%s bind %s:%s', this.type, host, port);
      this.server.on('listening', this.emit.bind(this, 'bind'));

      if (unixSocket) {
        // TODO: move out
        this.server.on('error', function (e) {
          if (e.code === 'EADDRINUSE') {
            // Unix file socket and error EADDRINUSE is the case if
            // the file socket exists. We check if other processes
            // listen on file socket, otherwise it is a stale socket
            // that we could reopen
            // We try to connect to socket via plain network socket
            var clientSocket = new net.Socket();
            clientSocket.on('error', function (e2) {
              if (e2.code === 'ECONNREFUSED') {
                // No other server listening, so we can delete stale
                // socket file and reopen server socket
                fs.unlink(port);
                self.server.listen(port, host, fn);
              }
            });
            clientSocket.connect({
              path: port
            }, function () {
              // Connection is possible, so other server is listening
              // on this file socket
              throw e;
            });
          }
        });
      }

      this.server.listen(port, host, fn);
      return this;
    }
  }]);
  return Socket;
}(Emitter); //
// /**
//  * Expose `Socket`.
//  */
// export default Socket


exports["default"] = Socket;