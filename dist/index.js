"use strict";

var _explorer = _interopRequireDefault(require("./components/explorer"));

var _requester = _interopRequireDefault(require("./components/requester"));

var _responder = _interopRequireDefault(require("./components/responder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const optionsBuilder = require('./options-builder');

const Servious = (options = {}) => {
  options = optionsBuilder(options);

  _explorer.default.setDefaults(options);

  const components = [_requester.default, _responder.default];
  components.forEach(function (component) {
    component.setEnvironment(options.environment);
    component.setUseHostNames && component.setUseHostNames(options.useHostNames);
  });
  return Servious;
};

Servious.Requester = _requester.default;
Servious.Responder = _responder.default;
module.exports = Servious();