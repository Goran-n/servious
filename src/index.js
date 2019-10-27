import Explorer from "./components/explorer";
import Requester from "./components/requester";
import Responder from "./components/responder";
import Methods from "./components/methods";
import Config from "./config";
import logger from "./logger";

const optionsBuilder = require("./options-builder");

const Servious = class {
  constructor(options) {
    // this.root = null; // Dispatch reference of the root server
    // this.caches = new Map();
    // this.methods = new Methods(this);
    this.services = {}; // Track service registrations
    this.options = optionsBuilder(options);
    this.responder = null;

    // Servious components
    const components = [
      Requester,
      Responder
    ];

    // // Pre configure each component
    components.forEach((component) => {
      component.setEnvironment(this.options.environment);
      component.setUseHostNames && component.setUseHostNames(this.options.useHostNames);
    });

    // Set default explorer conditions
    Explorer.setDefaults(options);
  }
  registerResponder(advertisement, options){
    this.responder = new Responder({
      "name": advertisement.name,
      "namespace": advertisement.namespace || undefined,
      "respondsTo": advertisement.respondsTo,
      "options": options
    });
  }
  /**
   * Responder responder definitions
   * @param operation
   * @param logic
   */
  on(operation, logic){
    this.responder.on(operation, logic);
  }
  /**
   * Sends a request to a pre defined responder link
   * @param service
   * @param operation
   * @param payload
   * @returns Promise
   */
  async send(service, operation, payload){
    if (!this.services[ service ]){
      return throw new Error(`Service ${service} is not defined`);
    }

    // logger.info({ "service-rs": "public-api", "type": `${operation}`, "r": { ...payload }, "namespace": this.services[ service ].namespace });
    return this.services[ service ].send({ "type": `${operation}`, "val": payload })
      .then((res) => {
        return res;
      })
      .catch((e) => throw e);
  }
  /**
   * Appends a requester to the service
   * @param name
   * @param options
   */
  addLink(name, options){
    if (typeof name !== "object") {
      return this._addLink(name, options);
    }

    // {} or [{}, {}]

    const items = [].concat(name);

    for (let item of items) {
      item = Config.apply("linkObject", item);
      this._addLink(item.name, {
        "options": item.options,
        "namespace": item.namespace
      });
    }
  }

  /**
   * Appends the internally validated link
   * @param name
   * @param options
   * @private
   */
  _addLink(name, options){
    this.services[ name ] = new Requester({
      name,
      ...options
    });
  }
};

module.exports = Servious;
