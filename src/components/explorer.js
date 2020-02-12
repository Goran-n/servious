const Explore = require("node-discover");

// eslint-disable-next-line
const colors = require('colors');

const defaultOptions = {
  "helloInterval": 2000,
  "checkInterval": 4000,
  "nodeTimeout": 5000,
  "masterTimeout": 6000,
  "monitor": true,
  "log": true,
  "helloLogsEnabled": true,
  "statusLogsEnabled": true,
  "ignoreProcess": false
};

export default class Explorer extends Explore {
  constructor(advertisement, options) {

    options = { ...defaultOptions, ...Explorer.defaults, ...options };

    if(advertisement.node_type === 'req'){
      options.client = true
    }

    super(options);

    this.advertisement = { "type": "service", ...advertisement };

    this.advertise(this.advertisement);

    this.me.id = this.broadcast.instanceUuid;

    this.me.processId = this.broadcast.processUuid;

    this.me.processCommand = process.argv.slice(1).map((n) => {
      return n.split("/").slice(-2).join("/");
    }).join(" ");

    options.log && this.log(this.helloLogger());

    this.on("promotion", () =>  {
      this.log(["Process promoted to master node"]);
    });

    this.on("demotion", () => {
      this.log(["Process demoted from master"]);
    });

    this.on("master", () => {
      this.log(["Process allocated to master node"]);
    });

    this.on("added", (obj) => {
        if (!options.monitor && obj.advertisement.key !== this.advertisement.key || obj.advertisement.namespace !== this.advertisement.namespace) {
          return;
        }
      this.log && options.statusLogsEnabled && options.helloLogsEnabled && this.log(this.statusLogger(obj, "online"));
    });

    this.on("removed", (obj) => {
      if (!options.monitor && obj.advertisement.key !== this.advertisement.key || obj.advertisement.namespace !== this.advertisement.namespace) {
        return;
      }
      this.log && options.statusLogsEnabled && this.log(this.statusLogger(obj, "offline"));
    });
  }

  static setDefaults(options) {
    this.defaults = options;
  }

  log(logs) {
    console.log.apply(console.log, logs);
  }

  helloLogger() {
    return [ "\nHello! I'm".white, ...this.statusLogger(this.me), "\n========================\n".white ];
  }

  statusLogger(obj, status) {

    const logs = [];

    if (status) {
      const statusLog = status === "online" ? ".online".green : ".offline".red;

      logs.push([this.advertisement.namespace], [this.advertisement.name], "=>", obj.advertisement.type.magenta + statusLog + " --");
    }

    logs.push(
      `[ ${obj.advertisement.namespace} ] - ${obj.advertisement.name.white}${"#".grey}${obj.id.grey}`);

    if (obj.advertisement.port) {
      logs.push("on", obj.advertisement.port.toString().blue);
    }

    return logs;
  }
}
