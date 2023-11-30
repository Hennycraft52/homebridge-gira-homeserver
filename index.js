const axios = require('axios');
const https = require('https');
const fs = require('fs');

class GiraHomeServerDiscovery {
  constructor(log, config, homebridge) {
    this.log = log;
    this.config = config;
    this.homebridge = homebridge;
    this.devices = [];
  }

  async discoverDevices() {
    const { ip, username, password } = this.config;

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
    // Hier können Sie Logik hinzufügen, um ein HomeKit-Gerät für jedes Gira-Gerät zu erstellen
    // Verwenden Sie dazu die Informationen aus dem "device" Objekt.
    // Beachten Sie, dass dies stark von den Homebridge-APIs und Ihren spezifischen Anforderungen abhängt.

    // Beispiel: Umschaltfunktion für Lampen
    if (device.tag === 'Licht') {
      this.createToggleSwitch(device);
    }
    // Fügen Sie weitere Geräteklassen hinzu und erstellen Sie entsprechende HomeKit-Geräte

    this.log(`HomeKit device created for ${device.name} with tag ${device.tag}`);
  }

  createToggleSwitch(device) {
    const { Service, Characteristic } = this.homebridge.hap;

    const lampService = new Service.Switch(device.name, device.id);

    lampService
      .getCharacteristic(Characteristic.On)
      .on('get', async callback => {
        const status = await this.getLampStatus(device.id);
        callback(null, status === '1');
      })
      .on('set', async (value, callback) => {
        await this.toggleLamp(device.id);
        callback(null);
      });

    this.homebridge.registerAccessory('homebridge-gira-homeserver', 'LampSwitch', lampService);
  }

  async toggleLamp(lampId) {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${lampId}&method=toggle&value=1&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      this.log('Toggle response:', response.data);
    } catch (error) {
      this.log(`Toggle error for ${lampId}: ${error.message}`);
    }
  }

  async getLampStatus(lampId) {
    const { ip, username, password } = this.config;
    const url = `https://${ip}/endpoints/call?key=CO@${lampId}&method=get&user=${username}&pw=${password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      return response.data;
    } catch (error) {
      this.log(`Get status error for ${lampId}: ${error.message}`);
      return '0'; // Annahme: Standardstatus ist '0'
    }
  }
}

// Beispiel-Nutzung
module.exports = (homebridge) => {
  homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerDiscovery);
};
