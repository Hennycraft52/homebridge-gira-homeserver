const { toggleLamp, getLampStatus } = require('./lib/toggle');

module.exports = function (homebridge) {
    const { Service, Characteristic } = homebridge.hap;

    class LampAccessory {
        constructor(log, config) {
            this.log = log;
            this.config = config;

            setInterval(() => {
                const { ip, lampId, username, password } = this.config;

                getLampStatus(ip, lampId, username, password)
                    .then(status => {
                        console.log(`Lamp status: ${status}`);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }, 10000);

            this.service = new Service.Lightbulb(config.name);

            this.service
                .getCharacteristic(Characteristic.On)
                .on('get', this.getOn.bind(this))
                .on('set', this.setOn.bind(this));
        }

        getServices() {
            return [this.service];
        }

        getOn(callback) {
            const { ip, lampId, username, password } = this.config;

            getLampStatus(ip, lampId, username, password)
                .then(status => {
                    callback(null, status === 'on');
                })
                .catch(error => {
                    callback(error);
                });
        }

        setOn(value, callback) {
            const { ip, lampId, username, password } = this.config;

            toggleLamp(ip, lampId, username, password)
                .then(() => {
                    callback(null);
                })
                .catch(error => {
                    callback(error);
                });
        }
    }

    homebridge.registerAccessory('homebridge-lamp', 'Lamp', LampAccessory);
};
