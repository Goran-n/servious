"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _explorer = _interopRequireDefault(require("./components/explorer"));

var _requester = _interopRequireDefault(require("./components/requester"));

var _responder = _interopRequireDefault(require("./components/responder"));

var _config = _interopRequireDefault(require("./config"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var optionsBuilder = require("./options-builder");

var Servious =
/*#__PURE__*/
function () {
  function Servious(options) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, Servious);
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
        return _regenerator["default"].wrap(function _callee$(_context) {
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
      if ((0, _typeof2["default"])(name) !== "object") {
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