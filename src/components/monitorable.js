const axon = require('@dashersw/axon');

module.exports = (Base) => class Monitorable extends Base {
    startExplorer() {
        super.startExplorer();

        this.explorer.on('added', (obj) => {
            const adv = obj.advertisement;

            if (adv.type != 'monitor' || !this.advertisement.key.startsWith(adv.key)) {
                return;
            }

            this.onMonitorAdded(obj);
        });
    }
    onMonitorAdded(obj) {
        if (!this.monitorStatusPublisher) {
            this.monitorStatusPublisher = new axon.PubEmitterSocket();
            this.monitorStatusPublisher.sock.set('retry timeout', 0);
            const statusInterval = this.explorerOptions.statusInterval || 5000;

            this.monitorInterval = setInterval(() => this.onMonitorInterval(), statusInterval);
        }

        let address = obj.address;
        if (this.constructor.useHostNames) address = obj.hostName;

        this.monitorStatusPublisher.connect(obj.advertisement.port, address);
    }
    onMonitorInterval() {
        if (!this.monitorStatusPublisher.sock.socks.length) return;

        const nodes = (this.sock.socks || this.sock.sock.socks).map((s) => {
            if (s.id) return s.id;

            for (const id in this.explorer.nodes) {
                const node = this.explorer.nodes[id];

                if ((this.constructor.useHostNames ? s._host == node.hostName : s.remoteAddress == node.address) &&
                    s.remotePort == node.broadcast.port) {
                    s.id = node.id;

                    return s.id;
                }
            }
        });
        this.monitorStatusPublisher.emit('status', {
            id: this.explorer.me.id,
            nodes: nodes,
        });
    }
};
