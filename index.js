const girahome = require('./lib/girahome'); // Passe den Pfad entsprechend an
const { Accessory, Service, Characteristic, uuid } = require('homebridge');
const axios = require('axios');
const https = require('https');


class GirahomePlatform {
    constructor(log, config) {
        this.log = log;
        this.config = config;
        this.devices = [];
        this.deviceController = new DeviceController(config);
        this.girahome = girahome; // Verwende deine Bibliothek

        this.setupAccessories();
    }

    async setupAccessories() {
        try {
            await this.deviceController.populateDevices();

            for (const device of this.deviceController.devices) {
                const accessory = new Accessory(device.name, uuid.generate(device.id));

                switch (device.type) {
                    case 'Licht':
                        accessory.addService(Service.Lightbulb, device.name);
                        break;
                    // Weitere Cases für verschiedene Gerätetypen
                    default:
                        this.log(`Unsupported device type: ${device.type}`);
                        continue;
                }

                accessory
                    .getService(Service.AccessoryInformation)
                    .setCharacteristic(Characteristic.Manufacturer, 'Girahome')
                    .setCharacteristic(Characteristic.Model, '1.0')
                    .setCharacteristic(Characteristic.SerialNumber, device.id);

                accessory
                    .getService(Service.Lightbulb)
                    .getCharacteristic(Characteristic.On)
                    .on('get', this.getDeviceStatus.bind(this, device.id))
                    .on('set', this.setDeviceStatus.bind(this, device.id));

                this.devices.push(accessory);
            }
        } catch (error) {
            this.log('Error setting up accessories:', error);
        }
    }

    async getDeviceStatus(deviceId, callback) {
        const { ip, username, password } = this.config;
        try {
            const status = await this.girahome.getDeviceStatus(ip, deviceId, username, password);
            this.log(`Get Status for ${deviceId}: ${status}`);
            callback(null, status);
        } catch (error) {
            this.log('Error getting device status:', error);
            callback(error);
        }
    }

    async setDeviceStatus(deviceId, value, callback) {
        const { ip, username, password } = this.config;
        try {
            await this.girahome.toggleDevice(ip, deviceId, username, password);
            this.log(`Set Status for ${deviceId} to ${value}`);
            callback();
        } catch (error) {
            this.log('Error setting device status:', error);
            callback(error);
        }
    }

    accessories(callback) {
        callback(this.devices);
    }
}

class DeviceController {
    constructor(config) {
        this.ip = config.ip;
        this.username = config.username;
        this.password = config.password;
        this.devices = [];
    }

    async populateDevices() {
        const deviceTypes = ['Licht', 'Steckdose', 'Garage', 'Heizstrahler', 'Rolladen', 'Fensterkontakt', 'Tuerkontakt'];

        for (const type of deviceTypes) {
            for (let i = 1; i <= 9; i++) {
                for (let j = 1; j <= 9; j++) {
                    for (let k = 1; k <= 9; k++) {
                        const id = `${i}_${j}_${k}`;
                        const name = `Device_${id}`;

                        try {
                            const deviceInfo = await this.getDeviceInformation(id, type);
                            if (deviceInfo) {
                                this.devices.push({
                                    id,
                                    name,
                                    type,
                                    // Hier können Sie weitere Eigenschaften je nach Bedarf hinzufügen
                                });
                            }
                        } catch (error) {
                            console.error(`Error getting device information for ${id}:`, error.message);
                        }
                    }
                }
            }
        }
    }

   async getDeviceInformation(id, type) {
    const url = `https://${this.ip}/endpoints/call?key=CO@${id}&method=meta&user=${this.username}&pw=${this.password}`;

    try {
        const response = await axios.get(url, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        console.log('API Response:', response.data);

        if (response.data && response.data.data && response.data.data.caption) {
            const { caption, tags } = response.data.data;
            // Hier können Sie weitere Informationen je nach Bedarf extrahieren

            return {
                caption,
                tags,
                // Fügen Sie weitere Informationen hinzu, wenn benötigt
            };
        } else {
            console.error(`Error getting device information for ${id}: Response data is incomplete.`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting device information for ${id}:`, error.message);
        throw error;
    }
}



module.exports = homebridge => {
    homebridge.registerPlatform('GirahomePlatform', 'Girahome', GirahomePlatform, true);
};

