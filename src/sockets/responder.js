import { slice } from '../utils';
import Message from 'amp-message';
import Socket from './socket';

let debug = require('debug')('servious:res');

export default class RepSocket extends Socket{
  constructor (props) {
    super(props);
  }
  id (){
    return `${this.identity }:${ this.ids++}`;
  }
  onmessage(sock){
    let self = this;

    return function (buf) {
      let msg = new Message(buf);
      let args = msg.args;

      let id = args.pop();

      const reply = function() {

        let fn = function () {};

        let req = slice(arguments);

        req[ 0 ] = req[ 0 ] || null;

        let hasCallback = typeof req[ req.length - 1 ] == 'function';

        if (hasCallback) {
          fn = req.pop();
        }

        req.push(id);

        if (sock.writable) {
          sock.write(self.pack(req), () => {
            fn(true);
          });
          return true;
        }

        debug('peer went away');

        process.nextTick(() => {
          fn(false);
        });

        return false;

      };

      args.unshift('message');
      args.push(reply);
      self.emit(...args);

    };
  }
}
