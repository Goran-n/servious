const axon = require('@dashersw/axon');
const debug = require('debug')('axon:req');
const Configurable = require('./configurable');
const Monitorable = require('./monitorable');
const Component = require('./component');

const SUBSET_IDENTIFIER = '__subset';

export default class Requester extends Monitorable(Configurable(Component)) {
  constructor(advertisement, explorerOptions) {
    super(advertisement, explorerOptions);

    this.sock = new axon.types[ this.type ]();
    this.sock.set('retry timeout', 0);
    this.timeout = advertisement.timeout || process.env.SERVIOUS_REQ_TIMEOUT;

    this.sock.send = this.socketSend.bind(this);
    this.startExplorer();
  }

  filterSubsetInSocks(subset, socks) {
    // Find correct nodes
    const possibleNodes = Object.values(this.explorer.nodes).filter((node) => {
      return node.advertisement.subset == subset;
    });

    // Find corresponding sockets
    const possibleSocks = possibleNodes.map((node) => {
      return socks.find((sock) => {
        return sock.remoteAddress == node.address && sock.remotePort == node.advertisement.port;
      });
    }).filter((sock) => sock);

    return possibleSocks;
  }
  socketSend(...args) {
    const { socks } = this.sock;
    // Enqueue if no socks connected yet

    if (!socks || !socks.length) {
      debug('no connected peers');
      return this.sock.enqueue(args);
    }

    const data = args[ 0 ];
    const subset = data[ SUBSET_IDENTIFIER ];

    const possibleSocks = subset ? this.filterSubsetInSocks(subset, socks) : socks;
    // Enqueue if the correct nodes did not connect yet/does not exist

    if (!possibleSocks.length) {
      return this.sock.enqueue(args);
    }

    // Balances out node availability
    const sock = possibleSocks[ this.sock.n++ % possibleSocks.length ];

    const fn = args.pop();

    fn.id = this.sock.id();
    this.sock.callbacks[ fn.id ] = fn;
    args.push(fn.id);

    delete args[ 0 ][ SUBSET_IDENTIFIER ]; // Remove subset idf if present from message

    sock.write(this.sock.pack(args));
  }

  onAdded(obj) {
    super.onAdded(obj);

    const address = this.constructor.useHostNames ? obj.hostName : obj.address;

    const alreadyConnected = this.sock.socks.some((s) =>
      (this.constructor.useHostNames ? s._host == obj.hostName : s.remoteAddress == address) && s.remotePort == obj.advertisement.port);

    if (alreadyConnected) {
      return;
    }

    this.sock.connect(obj.advertisement.port, address);
  }

  send(...args) {
    const hasCallback = typeof args[ args.length - 1 ] == 'function';
    const timeout = args[ 0 ].__timeout || this.timeout;

    if (hasCallback) {
      return sendOverSocket(this.sock, timeout, ...args);
    }

    return new Promise((resolve, reject) => {
      sendOverSocket(this.sock, timeout, ...args, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
   }
  get type() {
    return 'req';
  }


  get oppo() {
    return 'rep';
  }
}
