"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const axon = require('@dashersw/axon');

const portfinder = require('portfinder');

const Configurable = require('./configurable');

const Component = require('./component');

class Responder extends Configurable(Component) {
  constructor(advertisement, explorerOptions) {
    super(advertisement, explorerOptions);
    this.sock = new axon.types[this.type]();
    this.sock.on('bind', () => this.startExplorer());
    this.sock.on('message', (req, cb) => {
      if (!req.type) return;

      if (this.listeners(req.type).length === 0 && this.explorerOptions.logUnknownEvents) {
        this.explorer.log([this.advertisement.name, '>', `No listeners found for event: ${req.type}`.yellow]);
      }

      this.emit(req.type, req, cb);
    });

    const onPort = (err, port) => {
      this.advertisement.port = +port;
      this.sock.bind(port);
      this.sock.server.on('error', err => {
        if (err.code != 'EADDRINUSE') throw err;
        portfinder.getPort({
          host: this.explorerOptions.address,
          port: this.advertisement.port
        }, onPort);
      });
    };

    portfinder.getPort({
      host: this.explorerOptions.address,
      port: advertisement.port
    }, onPort);
  }

  on(type, listener) {
    super.on(type, (...args) => {
      const rv = listener(...args);

      if (rv && typeof rv.then == 'function') {
        const cb = args.pop();
        rv.then(val => cb(null, val)).catch(cb);
      }
    });
  }

  get type() {
    return 'rep';
  }

  get oppo() {
    return 'req';
  }

}

exports.default = Responder;
;