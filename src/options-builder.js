const parser = {
  "bool": (v) => v.toLowerCase() == "true", // node always converts process.env values to string, so no need to check
  // for type: https://nodejs.org/api/process.html#process_process_env
  "int": (v) => parseInt(v, 10), // see above for skipping type checks
  "str": (v) => v,
  "exists": (v) => !!v
};

const defaultOptions = {
  "environment": "",
  "useHostNames": false,
  "broadcast": null,
  "multicast": null,
  "logUnknownEvents": true
};

const envVarOptionsMap = {
  "SERVIOUS_ENV": [ "environment", parser.str ],
  "SERVIOUS_USE_HOST_NAMES": [ "useHostNames", parser.exists ],
  "SERVIOUS_MULTICAST_ADDRESS": [ "multicast", parser.str ],
  "SERVIOUS_CHECK_INTERVAL": [ "checkInterval", parser.int ],
  "SERVIOUS_HELLO_INTERVAL": [ "helloInterval", parser.int ],
  "SERVIOUS_HELLO_LOGS_ENABLED": [ "helloLogsEnabled", parser.bool ],
  "SERVIOUS_STATUS_LOGS_ENABLED": [ "statusLogsEnabled", parser.bool ],
  "SERVIOUS_LOG": [ "log", parser.bool ],
  "SERVIOUS_LOG_UNKNOWN_EVENTS": [ "logUnknownEvents", parser.bool ],
  "SERVIOUS_NODE_TIMEOUT": [ "nodeTimeout", parser.int ],
  "SERVIOUS_IGNORE_PROCESS": [ "ignoreProcess", parser.bool ]
};

module.exports = (options) => {
  const environmentSettings = {};

  Object.entries(envVarOptionsMap).forEach(([ envVar, [ setting, parser ] ]) => {
    if (!(envVar in process.env)) {
      return;
    }

    const value = process.env[ envVar ];

    environmentSettings[ setting ] = parser(value);
  });

  if (!process.env.SERVIOUS_BROADCAST_ADDRESS && process.env.DOCKERCLOUD_IP_ADDRESS) {
    environmentSettings.broadcast = "10.7.255.255";
  }

  const keys = Object.keys(process.env).filter((k) => k.slice(0, 15) == "SERVIOUS_explorer_");

  keys.forEach((k) => {
    const keyName = k.slice(15);
    const keyArray = keyName.split("_").map((k) => k.toLowerCase());
    const pluginName = keyArray.shift();

    const pluginObj = environmentSettings[ pluginName ] = environmentSettings[ pluginName ] || {};

    keyArray.forEach((k) => {
      pluginObj[ k ] = process.env[ `SERVIOUS_explorer_${pluginName.toUpperCase()}_${k.toUpperCase()}` ];
    });

    // Explorer plugins (such as redis) may not have access to real IP addresses.
    // Therefore we automatically default to `true` for `SERVIOUS_USE_HOST_NAMES`,
    // since host names are accurate.
    environmentSettings.useHostNames = true;
  });

  return { ...defaultOptions, ...environmentSettings, ...options };
};
