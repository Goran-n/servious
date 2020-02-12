let Emitter = require('events').EventEmitter;
let Configurable = require('configurable');
let debug = require('debug')('servious:sock');
let Message = require('amp-message');
let Parser = require('amp').Stream;
let url = require('url');
let net = require('net');
let fs = require('fs');

/**
 * Errors to ignore.
 */

let ignore = [
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENETDOWN',
  'EPIPE',
  'ENOENT'
];

export default class Socket extends Emitter{
  constructor(props) {

    super(props);

    // Make it configurable `.set()` etc.
    Configurable(this);

    this.server = null;
    this.socks = [];
    this.settings = {};

  }
  use (plugin){
    plugin(this);
    return this;
  }
  pack (args){
    let msg = new Message(args);

    return msg.toBuffer();
  }
  closeSockets(){
    debug('%s closing %d connections', this.type, this.socks.length);
    this.socks.forEach((sock) => {
      sock.destroy();
    });
  }
  close (fn) {
    debug('%s closing', this.type);
    this.closing = true;
    this.closeSockets();
    if (this.server) {
      this.closeServer(fn);
    }
  }
  closeServer (fn){
    debug('%s closing server', this.type);
    this.server.on('close', this.emit.bind(this, 'close'));
    this.server.close();
    fn && fn();
  }
  address (){
    if (!this.server) {
      return;
    }
    let addr = this.server.address();

    addr.string = `tcp://${ addr.address }:${ addr.port}`;
    return addr;
  }
  removeSocket (sock){
    let i = this.socks.indexOf(sock);

    if (!~i) {
      return;
    }
    debug('%s remove socket %d', this.type, i);
    this.socks.splice(i, 1);
  }
  addSocket (sock){
    let parser = new Parser();
    let i = this.socks.push(sock) - 1;

    debug('%s add socket %d', this.type, i);
    sock.pipe(parser);
    parser.on('data', this.onmessage(sock));
  }
  handleErrors (sock){
    let self = this;

    sock.on('error', (err) => {
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
  onmessage (sock){
    let self = this;

    return function(buf){
      let msg = new Message(buf);

      self.emit.apply(self, [ 'message' ].concat(msg.args));
    };
  }
  connect ( { advertisement, host }, fn ){

    const { port } = advertisement

    let self = this;

    if (this.type === 'server') {
      throw new Error('cannot connect() after bind()');
    }

    if (typeof host == 'function') {
      fn = host;
      host = undefined;
    }

    if (typeof port == 'string') {
      port = url.parse(port);

      if (port.protocol == 'unix:') {
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

    let max = self.get('retry max timeout');
    let sock = new net.Socket();


    sock.advertisement = advertisement;

      sock.setNoDelay();
    this.type = 'client';

    this.handleErrors(sock);

    sock.on('close', () => {
      self.emit('socket close', sock);
      self.connected = false;
      self.removeSocket(sock);
      if (self.closing) {
        return self.emit('close');
      }
      let retry = self.retry || self.get('retry timeout');

      setTimeout(() => {
        debug('%s attempting reconnect', self.type);
        self.emit('reconnect attempt');
        sock.destroy();
        self.connect(port, host);
        self.retry = Math.round(Math.min(max, retry * 1.5));
      }, retry);
    });

    sock.on('connect', () => {
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

  onconnect (sock){
    let self = this;
    let addr = `${sock.remoteAddress }:${ sock.remotePort}`;

    debug('%s accept %s', self.type, addr);
    this.addSocket(sock);
    this.handleErrors(sock);
    this.emit('connect', sock);
    sock.on('close', () => {
      debug('%s disconnect %s', self.type, addr);
      self.emit('disconnect', sock);
      self.removeSocket(sock);
    });
  }

  bind (port, host, fn){
    let self = this;

    if (this.type == 'client') {
      throw new Error('cannot bind() after connect()');
    }
    if (typeof host == 'function') {
      fn = host;
      host = undefined;
    }

    let unixSocket = false;

    if (typeof port == 'string') {
      port = url.parse(port);

      if (port.protocol == 'unix:') {
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
      this.server.on('error', (e) => {
        if (e.code == 'EADDRINUSE') {
          // Unix file socket and error EADDRINUSE is the case if
          // the file socket exists. We check if other processes
          // listen on file socket, otherwise it is a stale socket
          // that we could reopen
          // We try to connect to socket via plain network socket
          let clientSocket = new net.Socket();

          clientSocket.on('error', (e2) => {
            if (e2.code == 'ECONNREFUSED') {
              // No other server listening, so we can delete stale
              // socket file and reopen server socket
              fs.unlink(port);
              self.server.listen(port, host, fn);
            }
          });

          clientSocket.connect({ path: port }, () => {
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
}

//
// /**
//  * Expose `Socket`.
//  */
// export default Socket
