const request = require('request-promise');

class GiraHomeServerPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.accessories = [];

    if (this.config) {
      this.host = this.config.host;
      this.username = this.config.username;
      this.password = this.config.password;
      this.lights = this.config.lights || [];
      this.refreshInterval = this.config.refreshInterval || 20;

      this.log.debug('Configuring Gira HomeServer platform:', this.host, this.username);

      // Start the refresh interval
      setInterval(() => {
        this.refreshAccessories();
      }, this.refreshInterval * 1000);

      // Register the platform
      this.api.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', this);
    } else {
      this.log.error('Missing configuration for Gira HomeServer platform. Please check your configuration file.');
    }
  }

  accessories(callback) {
    this.log.debug('Discovering accessories...');
    const accessories = [];

    // Create an accessory for each light
    for (const light of this.lights) {
      const accessory = new GiraLightAccessory(this.log, light, this.host, this.username, this.password);
      accessories.push(accessory);
      this.accessories.push(accessory);
    }

    callback(accessories);
  }

  refreshAccessories() {
    this.log.debug('Refreshing accessories...');
    for (const accessory of this.accessories) {
      accessory.refreshState();
    }
  }
}

class GiraLightAccessory {
  constructor(log, config, host, username, password) {
    this.log = log;
    this.config = config;
    this.host = host;
    this.username = username;
    this.password = password;
    this.service = null;

    if (this.config) {
      this.name = this.config.name;
      this.id = this.config.id;

      // You can perform additional setup here if needed

      this.log.debug('Configuring Gira Light accessory:', this.name, this.id);
    } else {
      this.log.error('Missing configuration for Gira Light accessory. Please check your configuration file.');
    }
  }

  getServices() {
    // Implement the services for the light accessory
    // ...

    // Example service
    this.service = new Service.Lightbulb(this.name);
    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getOn.bind(this))
      .on('set', this.setOn.bind(this));

    return [this.service];
  }

  refreshState() {
    // Implement the logic to refresh the state of the light accessory
    // ...

    // Example: Update the On state every refresh interval
    this.getOn((error, value) => {
      if (!error) {
        this.service.getCharacteristic(Characteristic.On).updateValue(value);
      }
    });
  }

  // Example method to toggle the light
  toggleLight(on, callback) {
    const endpoint = `https://${this.host}/endpoints/call?key=${this.id}&method=toggle&value=${on ? 1 : 0}&user=${this.username}&pw=${this.password}`;

    request(endpoint)
      .then(response => {
        this.log.debug('Toggle light response:', response);

        // If the toggle was successful, update the internal state
        this.getOn((error, value) => {
          if (!error) {
            this.service.getCharacteristic(Characteristic.On).updateValue(value);
          }
        });

        callback(null);
      })
      .catch(error => {
        this.log.error('Error toggling light:', error.message);
        callback(error);
      });
  }

  getOn(callback) {
    const endpoint = `https://${this.host}/endpoints/call?key=${this.id}&method=get&user=${this.username}&pw=${this.password}`;

    request(endpoint)
      .then(response => {
        this.log.debug('Get light state response:', response);

        // Parse the response to determine the current state
        const currentState = parseResponseToState(response);

        callback(null, currentState);
      })
      .catch(error => {
        this.log.error('Error getting light state:', error.message);
        callback(error);
      });
  }

  setOn(value, callback) {
    // Implement the logic to set the On state of the light
    // ...

    // Example: Toggle the light state
    this.toggleLight(value, callback);
  }
}

function parseResponseToState(response) {
  try {
    const parsedResponse = JSON.parse(response);
    // Hier gehen wir davon aus, dass der Status im JSON als true oder false gespeichert ist
    return parsedResponse.status === 'on';
  } catch (error) {
    // Fehler beim Parsen der Antwort
    return false;
  }
}

// Export the platform to Homebridge
module.exports = (api) => {
  api.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);
};

