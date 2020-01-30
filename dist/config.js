"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _joi = _interopRequireDefault(require("@hapi/joi"));

var internals = {};

exports.apply = function (type, options) {
  var result = internals[type].validate(options);

  if (result.error) {
    for (var _len = arguments.length, message = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      message[_key - 2] = arguments[_key];
    }

    throw new Error("Invalid ".concat(type, " options ").concat(message.length ? "(".concat(message.join(' '), ")") : '', " ").concat(result.error.annotate()));
  }

  return result.value;
};

internals.cachePolicy = _joi["default"].object({
  cache: _joi["default"].string().allow(null).allow(''),
  segment: _joi["default"].string(),
  shared: _joi["default"]["boolean"]()
}).unknown();
internals.method = _joi["default"].object({
  bind: _joi["default"].object().allow(null),
  generateKey: _joi["default"]["function"](),
  cache: internals.cachePolicy
});
internals.methodObject = _joi["default"].object({
  name: _joi["default"].string().required(),
  method: _joi["default"]["function"]().required(),
  options: _joi["default"].object()
});
internals.linkObject = _joi["default"].object({
  name: _joi["default"].string().required(),
  options: _joi["default"].object().optional()
});