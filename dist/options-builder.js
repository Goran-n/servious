"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var parser = {
  "bool": function bool(v) {
    return v.toLowerCase() == "true";
  },
  // node always converts process.env values to string, so no need to check
  // for type: https://nodejs.org/api/process.html#process_process_env
  "int": function int(v) {
    return parseInt(v, 10);
  },
  // see above for skipping type checks
  "str": function str(v) {
    return v;
  },
  "exists": function exists(v) {
    return !!v;
  }
};
var defaultOptions = {
  "environment": "",
  "useHostNames": false,
  "broadcast": null,
  "multicast": null,
  "logUnknownEvents": true
};
var envVarOptionsMap = {
  "SERVIOUS_ENV": ["environment", parser.str],
  "SERVIOUS_USE_HOST_NAMES": ["useHostNames", parser.exists],
  "SERVIOUS_MULTICAST_ADDRESS": ["multicast", parser.str],
  "SERVIOUS_CHECK_INTERVAL": ["checkInterval", parser["int"]],
  "SERVIOUS_HELLO_INTERVAL": ["helloInterval", parser["int"]],
  "SERVIOUS_HELLO_LOGS_ENABLED": ["helloLogsEnabled", parser.bool],
  "SERVIOUS_STATUS_LOGS_ENABLED": ["statusLogsEnabled", parser.bool],
  "SERVIOUS_LOG": ["log", parser.bool],
  "SERVIOUS_LOG_UNKNOWN_EVENTS": ["logUnknownEvents", parser.bool],
  "SERVIOUS_NODE_TIMEOUT": ["nodeTimeout", parser["int"]],
  "SERVIOUS_IGNORE_PROCESS": ["ignoreProcess", parser.bool]
};

module.exports = function (options) {
  var environmentSettings = {};
  Object.entries(envVarOptionsMap).forEach(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        envVar = _ref2[0],
        _ref2$ = (0, _slicedToArray2["default"])(_ref2[1], 2),
        setting = _ref2$[0],
        parser = _ref2$[1];

    if (!(envVar in process.env)) {
      return;
    }

    var value = process.env[envVar];
    environmentSettings[setting] = parser(value);
  });

  if (!process.env.SERVIOUS_BROADCAST_ADDRESS && process.env.DOCKERCLOUD_IP_ADDRESS) {
    environmentSettings.broadcast = "10.7.255.255";
  }

  var keys = Object.keys(process.env).filter(function (k) {
    return k.slice(0, 15) == "SERVIOUS_explorer_";
  });
  keys.forEach(function (k) {
    var keyName = k.slice(15);
    var keyArray = keyName.split("_").map(function (k) {
      return k.toLowerCase();
    });
    var pluginName = keyArray.shift();
    var pluginObj = environmentSettings[pluginName] = environmentSettings[pluginName] || {};
    keyArray.forEach(function (k) {
      pluginObj[k] = process.env["SERVIOUS_explorer_".concat(pluginName.toUpperCase(), "_").concat(k.toUpperCase())];
    }); // Explorer plugins (such as redis) may not have access to real IP addresses.
    // Therefore we automatically default to `true` for `SERVIOUS_USE_HOST_NAMES`,
    // since host names are accurate.

    environmentSettings.useHostNames = true;
  });
  return _objectSpread({}, defaultOptions, {}, environmentSettings, {}, options);
};