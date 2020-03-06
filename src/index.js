import Requester from "./components/requester";
import Responder from "./components/responder";
import Config from "./config";

const optionsBuilder = require("./options-builder");

const Servious = {
  services: {},
  options: optionsBuilder({}),
  responder: null,
  // Servious components
  components: [
    Requester,
    Responder
  ],
  configure(options = {}){
    this.options = optionsBuilder(options)
  },
  registerResponder(advertisement, options){
    this.responder = new Responder({
      "name": advertisement.name,
      "namespace": advertisement.namespace || undefined,
      "respondsTo": advertisement.respondsTo,
      "options": options
    });
  },
  /**
   * Responder responder definitions
   * @param operation
   * @param logic
   */
  on(operation, logic){
    this.responder.on(operation, logic);
  },
  /**
   * Sends a request to a pre defined responder link
   * @param service
   * @param operation
   * @param payload
   * @returns Promise
   */
  async send(service, operation, payload){

    if (!this.services[ service ]){
      throw new Error(`Service ${service} is not defined`);
    }

    const { advertisement } = this.services[service];

    return this.services[ service ].send({ "type": `${operation}`, service: advertisement.service, "val": payload })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        throw e;
      });
  },
  /**
   * Appends a requester to the service
   */
  addLink({ name, service, options }){

    const linkOptions = arguments ? arguments[0] : null;
    const link = Config.apply("linkObject", linkOptions);

    this._addLink(link.name, link.service, link.options);

  },

  /**
   * Appends the internally validated link
   * @param name
   * @param service
   * @param options
   * @private
   */
  _addLink(name, service, options){
    this.services[ name ] = new Requester({
      name,
      service,
      ...options
    }, this.options);
  },
  listServices(){
    return this.services;
  }
};

Servious.components.forEach((component) => {
  component.setEnvironment(Servious.options.environment);
  component.setUseHostNames &&
  component.setUseHostNames(Servious.options.useHostNames);
});

module.exports = Servious;
