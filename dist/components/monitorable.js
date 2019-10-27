"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var axon = require("@dashersw/axon");

module.exports = function (Base) {
  return (
    /*#__PURE__*/
    function (_Base) {
      _inherits(Monitorable, _Base);

      function Monitorable() {
        _classCallCheck(this, Monitorable);

        return _possibleConstructorReturn(this, _getPrototypeOf(Monitorable).apply(this, arguments));
      }

      _createClass(Monitorable, [{
        key: "startExplorer",
        value: function startExplorer() {
          var _this = this;

          _get(_getPrototypeOf(Monitorable.prototype), "startExplorer", this).call(this);

          this.explorer.on("added", function (obj) {
            var adv = obj.advertisement;

            if (adv.type != "monitor" || !_this.advertisement.key.startsWith(adv.key)) {
              return;
            }

            _this.onMonitorAdded(obj);
          });
        }
      }, {
        key: "onMonitorAdded",
        value: function onMonitorAdded(obj) {
          var _this2 = this;

          if (!this.monitorStatusPublisher) {
            this.monitorStatusPublisher = new axon.PubEmitterSocket();
            this.monitorStatusPublisher.sock.set("retry timeout", 0);
            var statusInterval = this.explorerOptions.statusInterval || 5000;
            this.monitorInterval = setInterval(function () {
              return _this2.onMonitorInterval();
            }, statusInterval);
          }

          var address = obj.address;

          if (this.constructor.useHostNames) {
            address = obj.hostName;
          }

          this.monitorStatusPublisher.connect(obj.advertisement.port, address);
        }
      }, {
        key: "onMonitorInterval",
        value: function onMonitorInterval() {
          var _this3 = this;

          if (!this.monitorStatusPublisher.sock.socks.length) {
            return;
          }

          var nodes = (this.sock.socks || this.sock.sock.socks).map(function (s) {
            if (s.id) {
              return s.id;
            }

            for (var id in _this3.explorer.nodes) {
              var node = _this3.explorer.nodes[id];

              if ((_this3.constructor.useHostNames ? s._host == node.hostName : s.remoteAddress == node.address) && s.remotePort == node.broadcast.port) {
                s.id = node.id;
                return s.id;
              }
            }
          });
          this.monitorStatusPublisher.emit("status", {
            "id": this.explorer.me.id,
            "nodes": nodes
          });
        }
      }]);

      return Monitorable;
    }(Base)
  );
};