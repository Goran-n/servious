"use strict";

var _explorer = _interopRequireDefault(require("./components/explorer"));

var _requester = _interopRequireDefault(require("./components/requester"));

var _responder = _interopRequireDefault(require("./components/responder"));

var _methods = _interopRequireDefault(require("./components/methods"));

var _config = _interopRequireDefault(require("./config"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var optionsBuilder = require("./options-builder");

var Servious =
/*#__PURE__*/
function () {
  function Servious(options) {
    var _this = this;

    _classCallCheck(this, Servious);

    // this.root = null; // Dispatch reference of the root server
    // this.caches = new Map();
    // this.methods = new Methods(this);
    this.services = {}; // Track service registrations

    this.options = optionsBuilder(options);
    this.responder = null; // Servious components

    var components = [_requester["default"], _responder["default"]]; // // Pre configure each component

    components.forEach(function (component) {
      component.setEnvironment(_this.options.environment);
      component.setUseHostNames && component.setUseHostNames(_this.options.useHostNames);
    }); // Set default explorer conditions

    _explorer["default"].setDefaults(options);
  }

  _createClass(Servious, [{
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
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(service, operation, payload) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.services[service]) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", function (e) {
                  throw e;
                }(new Error("Service ".concat(service, " is not defined"))));

              case 2:
                return _context.abrupt("return", this.services[service].send({
                  "type": "".concat(operation),
                  "val": payload
                }).then(function (res) {
                  return res;
                })["catch"](function (e) {
                  return function (e) {
                    throw e;
                  }(e);
                }));

              case 3:
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
     * @param name
     * @param options
     */

  }, {
    key: "addLink",
    value: function addLink(name, options) {
      if (_typeof(name) !== "object") {
        return this._addLink(name, options);
      } // {} or [{}, {}]


      var items = [].concat(name);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          item = _config["default"].apply("linkObject", item);

          this._addLink(item.name, {
            "options": item.options,
            "namespace": item.namespace
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    /**
     * Appends the internally validated link
     * @param name
     * @param options
     * @private
     */

  }, {
    key: "_addLink",
    value: function _addLink(name, options) {
      this.services[name] = new _requester["default"](_objectSpread({
        name: name
      }, options));
    }
  }]);

  return Servious;
}();

module.exports = Servious;