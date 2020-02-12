const EventEmitter = require("eventemitter2").EventEmitter2;

import Explorer from "./explorer";

module.exports = class Component extends EventEmitter {
  constructor(advertisement, explorerOptions = {}) {
    super({
      "wildcard": true, // should the event emitter use wildcards.
      "delimiter": "::", // the delimiter used to segment namespaces, defaults to `.`.
      "newListener": false, // if you want to emit the newListener event set to true.
      "maxListeners": 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    advertisement.key = `${this.constructor.environment }$$${ advertisement.key || ""}`;

    this.timeout = 30;
    this.advertisement = advertisement;
    this.advertisement.node_type = this.type;

    this.explorerOptions = { ...Explorer.defaults, ...explorerOptions };
    this.explorerOptions.address = this.explorerOptions.address || "0.0.0.0";
  }

  startExplorer() {

    this.explorer = new Explorer(this.advertisement, this.explorerOptions);

    this.explorer.on("added", (item) => {

      if (
        item.advertisement.node_type !== this.oppo || item.advertisement.key !== this.advertisement.key || this.advertisement.namespace !== item.advertisement.namespace
      ) {
        return;
      }

      if(this.onAdded){
        this.onAdded(item);
      }

      this.emit("servious:added", item);
    });

    this.explorer.on("removed", (item) => {
      if (
        item.advertisement.node_type !== this.oppo ||
        item.advertisement.key !== this.advertisement.key ||
        this.advertisement.namespace !== item.advertisement.namespace
      ) return;

      this.onRemoved(item);
      this.emit("servious:removed", item);
    });
  }

  close() {
    this.sock && this.sock.close();
    this.explorer && this.explorer.stop();
  }
};
