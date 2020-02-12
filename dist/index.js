"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _requester = _interopRequireDefault(require("./components/requester"));

var _responder = _interopRequireDefault(require("./components/responder"));

var _config = _interopRequireDefault(require("./config"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var optionsBuilder = require("./options-builder");

var Servious =
/*#__PURE__*/
function () {
  function Servious(options) {
    (0, _classCallCheck2["default"])(this, Servious);
    options = optionsBuilder(options);
    this.services = {}; // Track service registrations

    this.options = optionsBuilder(options);
    this.responder = null; // Servious components

    this.components = [_requester["default"], _responder["default"]]; // // Pre configure each component

    this.components.forEach(function (component) {
      component.setEnvironment(options.environment);
      component.setUseHostNames && component.setUseHostNames(options.useHostNames);
    });
  }

  (0, _createClass2["default"])(Servious, [{
    key: "registerResponder",
    value: function registerResponder(advertisement, options) {
      this.responder = new _responder["default"]({
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

  }, {
    key: "on",
    value: function on(operation, logic) {
      this.responder.on(operation, logic);
    }
    /**
     * Sends a request to a pre defined responder link
     * @param service
     * @param operation
     * @param payload
     * @returns Promise
     */

  }, {
    key: "send",
    value: function () {
      var _send = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(service, operation, payload) {
        var advertisement;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.services[service]) {
                  _context.next = 2;
                  break;
                }

                throw new Error("Service ".concat(service, " is not defined"));

              case 2:
                advertisement = this.services[service].advertisement;
                return _context.abrupt("return", this.services[service].send({
                  "type": "".concat(operation),
                  service: advertisement.service,
                  "val": payload
                }).then(function (res) {
                  return res;
                })["catch"](function (e) {
                  throw e;
                }));

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function send(_x, _x2, _x3) {
        return _send.apply(this, arguments);
      }

      return send;
    }()
    /**
     * Appends a requester to the service
     */

  }, {
    key: "addLink",
    value: function addLink(_ref) {
      var name = _ref.name,
          service = _ref.service,
          options = _ref.options;
      var linkOptions = arguments ? arguments[0] : null;

      var link = _config["default"].apply("linkObject", linkOptions);

      this._addLink(link.name, link.service, link.options);
    }
    /**
     * Appends the internally validated link
     * @param name
     * @param options
     * @private
     */

  }, {
    key: "_addLink",
    value: function _addLink(name, service, options) {
      this.services[name] = new _requester["default"](_objectSpread({
        name: name,
        service: service
      }, options));
    }
  }]);
  return Servious;
}();

module.exports = Servious;