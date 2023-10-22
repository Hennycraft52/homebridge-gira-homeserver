const homebridge = require('homebridge');
const GiraHomeserverConnect = require('./GiraHomeserverConnect');

const PluginName = 'homebridge-gira-homeserver';
const PlatformName = 'GiraHomeserverPlatform';

module.exports = (api) => {
  api.registerPlatform(PluginName, PlatformName, GiraHomeserverPlatform);
};

class GiraHomeserverPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    if (!this.config.host) {
      throw new Error('Bitte geben Sie den Gira HomeServer-Host in der Konfiguration an.');
    }

    this.host = this.config.host;

    this.giraServerConnect = new GiraHomeserverConnect(this.log, this.host);

    // Entferne die folgende Zeile
    // this.api.registerPlatform(PluginName, PlatformName, this);

    this.api.on('didFinishLaunching', () => {
      this.log('Die Gira HomeServer-Plattform wurde erfolgreich initialisiert.');
    });
  }

  accessories(callback) {
    const accessories = [];

    // Hier können Schalter (Switches) hinzugefügt werden
    // Beispiel: Ein einfacher Lichtschalter
    accessories.push(new GiraSwitch(this.log, 'Wohnzimmer Licht', 'de.gira.schema.channels.Switch/OnOff'));

    callback(accessories);
  }
}

