const request = require('request');
const { Accessory } = require('homebridge');

class GiraHomeserverPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];

    if (this.api) {
      this.api.on('didFinishLaunching', () => {
        this.initialize();
      });
    } else {
      this.log.error('Homebridge API is not available. Unable to initialize the plugin.');
    }
  }

  initialize() {
    if (this.config) {
      // Hier Initialisierung vornehmen

      // Register the platform
      if (this.api) {
        this.api.registerPlatform('homebridge-gira-homeserver', 'GiraHomeserverPlatform', this);
      } else {
        this.log.error('Homebridge API is not available. Unable to register the platform.');
      }
    } else {
      this.log.error('Missing configuration for GiraHomeserverPlatform. Please check your configuration file.');
    }
  }

  accessories(callback) {
    this.log.debug('Discovering accessories...');
    const accessories = [];

    // Erstellen Sie für jedes Licht ein Accessory
    for (const light of this.config.lights) {
      const accessory = new GiraLightAccessory(this.log, light, this.config.serverIP, this.config.username, this.config.password);
      accessories.push(accessory);
      this.accessories.push(accessory);
    }

    callback(accessories);
  }
}

module.exports = GiraHomeserverPlatform;
