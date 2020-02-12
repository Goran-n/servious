
/**
 * Module dependencies.
 */

let debug = require('debug')('servious:req');

import queue from '../plugins/queue';
import { slice } from '../utils';
import Message from 'amp-message';
import Socket from './socket';

/**
 * Initialize a new `ReqSocket`.
 *
 * @api private
 */

export default class ReqSocket extends Socket{
  constructor (props) {
    super(props);

    this.n = 0;
    this.ids = 0;
    this.callbacks = {};
    this.identity = String(process.pid);

    this.set('hwm', Infinity);
    this.set('retry timeout', 100);
    this.set('retry max timeout', 5000);

    this.use(queue());

  }
  id (){
    return `${this.identity }:${ this.ids++}`;
  }
  onmessage (){
    let self = this;

    return function(buf){
      let msg = new Message(buf);
      let id = msg.pop();
      let fn = self.callbacks[ id ];

      if (!fn) {
        return debug('missing callback %s', id);
      }
      fn.apply(null, msg.args);
      delete self.callbacks[ id ];
    };

  }
  selectSocket(targetService){
    if (this.socks.length > 0){
      const socks = this.socks.filter((item) => {
        return !!(item && item.advertisement && item.advertisement.name === targetService);
      });

      debug(`Found ${socks.length} ${targetService} services`);
      return socks[ this.n++ % socks.length ];
    }
    return false;
  }
  sender (){

    let args = slice(arguments);

    const sock = this.selectSocket(args[ 0 ].service);

    if (sock) {
      let hasCallback = typeof args[ args.length - 1 ] == 'function';

      if (!hasCallback) {
        args.push(() => {});
      }
      let fn = args.pop();

      fn.id = this.id();
      this.callbacks[ fn.id ] = fn;
      args.push(fn.id);
    }

    if (sock) {
      sock.write(this.pack(args));
    } else {
      debug('no connected peers');
      this.enqueue(args);
    }
  }
}
