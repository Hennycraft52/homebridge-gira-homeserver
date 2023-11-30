const axios = require('axios');
const https = require('https');
const fs = require('fs');

class GiraHomeServerAccessory {
  constructor(log, config, homebridge, device) {
    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.device = device;
    this.service = this.createAccessoryService();
    this.setupAccessoryService();
  }

  createAccessoryService() {
    const { Service, Characteristic } = this.homebridge.hap;
    const { name, tag } = this.device;

    if (tag === 'Licht' || tag === 'Steckdose' || tag === 'Rolladen') {
      return new Service.Switch(name, this.device.id);
    }

    // Hier können Sie weitere Zubehörtypen hinzufügen, die zu Ihren Gira-Geräten passen
    // Beispiel:
    // if (tag === 'Garage') {
    //   return new Service.GarageDoorOpener(name, this.device.id);
    // }

    // Rückgabe eines Standarddienstes, falls kein passender Typ gefunden wurde
    return new Service.AccessoryInformation();
  }

  setupAccessoryService() {
    const { Service, Characteristic } = this.homebridge.hap;

    if (this.service instanceof Service.Switch) {
      this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.handleGet.bind(this))
        .on('set', this.handleSet.bind(this));
    }

    // Hier können Sie weitere Zubehörtypen einrichten
    // Beispiel:
    // if (this.service instanceof Service.GarageDoorOpener) {
    //   this.service
    //     .getCharacteristic(Characteristic.TargetDoorState)
    //     .on('set', this.handleSet.bind(this));
    // }
  }

  async handleGet(callback) {
    const status = await this.getDeviceStatus();
    callback(null, status === '1');
  }

  async handleSet(value, callback) {
    await this.toggleDevice();
    callback(null);
  }

  async getDeviceStatus() {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${this.device.id}&method=get&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      return response.data;
    } catch (error) {
      this.log(`Get status error for ${this.device.id}: ${error.message}`);
      return '0';
    }
  }

  async toggleDevice() {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${this.device.id}&method=toggle&value=1&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      this.log('Toggle response:', response.data);
    } catch (error) {
      this.log(`Toggle error for ${this.device.id}: ${error.message}`);
    }
  }

  identify(callback) {
    this.log(`Identify requested for ${this.device.name}`);
    callback();
  }

  getServices() {
    return [this.service];
  }
}

class GiraHomeServerPlatform {
  constructor(log, config, homebridge) {
    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.devices = this.loadDevices();
    this.accessories = this.createAccessories();
    this.updateInterval = setInterval(() => this.updateDeviceStatus(), 10000); // Aktualisieren Sie alle 10 Sekunden
  }

  loadDevices() {
    try {
      const rawData = fs.readFileSync('devices.json');
      return JSON.parse(rawData);
    } catch (error) {
      return [];
    }
  }

  createAccessories() {
    const accessories = [];
    this.devices.forEach(device => {
      const accessory = new GiraHomeServerAccessory(this.log, this.config, this.homebridge, device);
      accessories.push(accessory);
    });
    return accessories;
  }

  async updateDeviceStatus() {
    this.log('Updating device status...');
    this.accessories.forEach(async accessory => {
      if (accessory instanceof GiraHomeServerAccessory) {
        const status = await accessory.getDeviceStatus();
        this.log(`Device ${accessory.device.name} status updated to ${status}`);
        accessory.service.updateCharacteristic(this.homebridge.hap.Characteristic.On, status === '1');
      }
    });
  }

  accessories(callback) {
    callback(this.accessories);
  }
}

// Beispiel-Nutzung
module.exports = homebridge => {
  homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);
};
