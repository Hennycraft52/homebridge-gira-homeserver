const axios = require('axios');
const https = require('https');
const fs = require('fs');

class GiraHomeServerDiscovery {
  constructor(log, config, homebridge) {
    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.devices = this.loadDevices();
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

  async updateDeviceStatus() {
    this.log('Updating device status...');
    this.devices.forEach(async (device) => {
      const status = await this.getDeviceStatus(device.id);
      this.log(`Device ${device.name} status updated to ${status}`);
      const accessory = this.homebridge.accessories.find(acc => acc.context.id === device.id);
      if (accessory) {
        accessory.getService(this.homebridge.hap.Service.Switch).updateCharacteristic(this.homebridge.hap.Characteristic.On, status === '1');
        accessory.getService(this.homebridge.hap.Service.Switch).updateCharacteristic(this.homebridge.hap.Characteristic.Status, status === '1');
      }
    });
  }

  async discoverDevices() {
    const { ip, username, password } = this.config;

    if (this.devices.length === 0) {
      this.log('No devices found. Discovering devices...');

      for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= 9; j++) {
          for (let k = 1; k <= 9; k++) {
            const id = `${i}_${j}_${k}`;
            await this.getDeviceInfo(id, ip, username, password);
          }
        }
      }

      this.devices = this.devices.filter(device => device.tag !== null);

      // Speichern Sie die entdeckten Geräte in einer JSON-Datei
      const jsonData = JSON.stringify(this.devices, null, 2);
      fs.writeFileSync('devices.json', jsonData);
      this.log('Devices saved to devices.json');
    } else {
      this.log('Devices loaded from devices.json:', this.devices);
    }

    // Erstellen und speichern Sie HomeKit-Geräte für jedes Gira-Gerät
    this.devices.forEach(device => {
      this.createHomeKitDevice(device);
    });

    return this.devices;
  }

  async getDeviceInfo(id, ip, username, password) {
    const url = `https://${ip}/endpoints/call?key=CO@${id}&method=meta&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      const { caption, tags } = response.data.data;
      const name = caption;
      const tag = tags.length > 0 ? tags[0] : null;

      this.devices.push({ id, name, tag });
    } catch (error) {
      this.log(`Error getting device info for ${id}: ${error.message}`);
    }
  }

  async createHomeKitDevice(device) {
    if (device.tag === 'Licht' || device.tag === 'Steckdose' || device.tag === 'Rolladen') {
      this.createToggleSwitch(device);
    }
    // Fügen Sie weitere Geräteklassen hinzu und erstellen Sie entsprechende HomeKit-Geräte

    this.log(`HomeKit device created for ${device.name} with tag ${device.tag}`);
  }

  createToggleSwitch(device) {
    const { Service, Characteristic } = this.homebridge.hap;

    const switchService = new Service.Switch(device.name, device.id);

    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', async callback => {
        const status = await this.getDeviceStatus(device.id);
        callback(null, status === '1');
      })
      .on('set', async (value, callback) => {
        await this.toggleDevice(device.id);
        callback(null);
      });

    // Beispiel: Fügen Sie ein neues Statusattribut hinzu
    switchService
      .addCharacteristic(new Characteristic.Status())
      .on('get', async callback => {
        const status = await this.getDeviceStatus(device.id);
        callback(null, status === '1');
      });

    // Beispiel: Speichern Sie Zubehörinformationen
    switchService.context.id = device.id;

    this.homebridge.registerAccessory('homebridge-gira-homeserver', 'ToggleSwitch', switchService);
  }

  async toggleDevice(deviceId) {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${deviceId}&method=toggle&value=1&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      this.log('Toggle response:', response.data);
    } catch (error) {
      this.log(`Toggle error for ${deviceId}: ${error.message}`);
    }
  }

  async getDeviceStatus(deviceId) {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${deviceId}&method=get&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      return response.data;
    } catch (error) {
      this.log(`Get status error for ${deviceId}: ${error.message}`);
      return '0'; // Annahme: Standardstatus ist '0'
    }
  }
}

// Beispiel-Nutzung
module.exports = (homebridge) => {
  homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerDiscovery);
};
