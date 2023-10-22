const homebridge = require('homebridge');
const GiraHomeserverConnect = require('./GiraHomeserverConnect');

// Die Plugin-Namen und -Plattformen
const PluginName = 'homebridge-gira-homeserver';
const PlatformName = 'GiraHomeserverPlatform';

// Homebridge-Plugin initialisieren
module.exports = (api) => {
  // Register die GiraHomeserverPlatform bei Homebridge
  api.registerPlatform(PluginName, PlatformName, GiraHomeserverPlatform);
};

// GiraHomeserverPlatform-Klasse
class GiraHomeserverPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    if (!this.config.host) {
      throw new Error('Bitte geben Sie den Gira HomeServer-Host in der Konfiguration an.');
    }

    this.host = this.config.host;

    // Initialize die Verbindung zum Gira HomeServer
    this.giraServerConnect = new GiraHomeserverConnect(this.log, this.host);

    // Registriere die Plattform beim Homebridge
    this.api.registerPlatform(PluginName, PlatformName, this);

    // Callback für die Plattform
    this.api.on('didFinishLaunching', () => {
      this.log('Die Gira HomeServer-Plattform wurde erfolgreich initialisiert.');
    });
  }

  accessories(callback) {
    // Implementiere die accessories-Methode, um Geräte hinzuzufügen
    const accessories = [];

    // Hier können Schalter (Switches) hinzugefügt werden
    // Beispiel: Ein einfacher Lichtschalter
    accessories.push(new GiraSwitch(this.log, 'Wohnzimmer Licht', 'de.gira.schema.channels.Switch/OnOff'));

    callback(accessories);
  }
}
