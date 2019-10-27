"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var info = function info() {
  if (process.env.SERVIOUS_LOG_INFO != 0) {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    console.info(args); // eslint-disable-line no-console
  }
};

var warn = function warn() {
  if (process.env.SERVIOUS_LOG_WARN != 0) {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    console.warn(args); // eslint-disable-line no-console
  }
};

var error = function error() {
  if (process.env.SERVIOUS_LOG_ERROR != 0) {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    console.error(args); // eslint-disable-line no-console
  }
};

var _default = {
  info: info,
  warn: warn,
  error: error
};
exports["default"] = _default;