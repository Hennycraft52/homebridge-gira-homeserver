const axios = require('axios');
const https = require('https');
const fs = require('fs');
const { toggleLamp } = require('./lib/toggle');
const { getLampStatus } = require('./lib/get');

class GiraHomeServerDiscovery {
  constructor() {
    this.devices = [];
    this.ip = ''; // Setzen Sie Ihre IP-Adresse hier
    this.username = ''; // Setzen Sie Ihren Benutzernamen hier
    this.password = ''; // Setzen Sie Ihr Passwort hier
  }

  async discoverDevices() {
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 9; j++) {
        for (let k = 1; k <= 9; k++) {
          const id = `${i}_${j}_${k}`;
          await this.getDeviceInfo(id);
        }
      }
    }
    this.devices = this.devices.filter(device => device.tag !== null);

    // Speichern Sie die entdeckten Geräte in einer JSON-Datei
    const jsonData = JSON.stringify(this.devices, null, 2);
    fs.writeFileSync('devices.json', jsonData);
    console.log('Devices saved to devices.json');

    return this.devices;
  }

  async getDeviceInfo(id) {
    const url = `https://${this.ip}/endpoints/call?key=CO@${id}&method=meta&user=${this.username}&pw=${this.password}`;

    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      });

      const { caption, tags } = response.data.data;
      const name = caption;
      const tag = tags.length > 0 ? tags[0] : null;

      this.devices.push({ id, name, tag });
    } catch (error) {
      console.error(`Error getting device info for ${id}:`, error.message);
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

    console.log(`HomeKit device created for ${device.name} with tag ${device.tag}`);
  }

  createToggleSwitch(device) {
    const Service = this.homebridge.hap.Service;
    const Characteristic = this.homebridge.hap.Characteristic;

    const lampService = new Service.Switch(device.name, device.id);

    lampService
      .getCharacteristic(Characteristic.On)
      .on('get', async callback => {
        const status = await getLampStatus(this.ip, device.id, this.username, this.password);
        callback(null, status === '1');
      })
      .on('set', async (value, callback) => {
        await toggleLamp(this.ip, device.id, this.username, this.password);
        callback(null);
      });

    this.homebridge.registerAccessory('homebridge-gira-homeserver', 'LampSwitch', lampService);
  }
}

// Beispiel-Nutzung
const discovery = new GiraHomeServerDiscovery();

discovery.discoverDevices()
  .then(devices => {
    console.log('Discovered Devices:', devices);

    // Hier können Sie weitere Logik hinzufügen, um die Geräte in Ihr Homebridge-Plugin zu integrieren
    // Zum Beispiel: Erstellen Sie für jedes Gerät ein HomeKit-Gerät
    devices.forEach(device => {
      discovery.createHomeKitDevice(device);
    });
  })
  .catch(error => console.error('Error:', error));

