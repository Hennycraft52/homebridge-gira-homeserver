const request = require('request');
const { Service, Characteristic } = require('homebridge');

class GiraLightAccessory {
  constructor(log, config, host, username, password) {
    this.log = log;
    this.config = config;
    this.host = host;
    this.username = username;
    this.password = password;
    this.service = null;

    if (this.config) {
      // Hier weitere Initialisierung durchführen, falls erforderlich

      this.log.debug('Configuring Gira Light accessory:', this.config.name, this.config.id);
    } else {
      this.log.error('Missing configuration for Gira Light accessory. Please check your configuration file.');
    }
  }

  getServices() {
    this.service = new Service.Lightbulb(this.config.name);
    this.service.getCharacteristic(Characteristic.On)
      .on('get', this.getOn.bind(this))
      .on('set', this.setOn.bind(this));

    return [this.service];
  }

  refreshState() {
    const getEndpoint = `https://${this.host}/endpoints/call?key=${this.config.id}&method=get&user=${this.username}&pw=${this.password}`;

    request(getEndpoint, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        this.log.debug('Refresh light state response:', body);
        const currentState = parseResponseToState(body);
        this.service.getCharacteristic(Characteristic.On).updateValue(currentState);
      } else {
        this.log.error('Error refreshing light state:', error ? error.message : 'Invalid response');
      }
    });
  }

  toggleLight(on, callback) {
    const toggleEndpoint = `https://${this.host}/endpoints/call?key=${this.config.id}&method=toggle&value=${on ? 1 : 0}&user=${this.username}&pw=${this.password}`;

    request(toggleEndpoint, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        this.log.debug('Toggle light response:', body);
        this.refreshState(); // Aktualisiert den Zustand nach dem Umschalten
        callback(null);
      } else {
        this.log.error('Error toggling light:', error ? error.message : 'Invalid response');
        callback(error);
      }
    });
  }

  getOn(callback) {
    const getEndpoint = `https://${this.host}/endpoints/call?key=${this.config.id}&method=get&user=${this.username}&pw=${this.password}`;

    request(getEndpoint, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        this.log.debug('Get light state response:', body);
        const currentState = parseResponseToState(body);
        callback(null, currentState);
      } else {
        this.log.error('Error getting light state:', error ? error.message : 'Invalid response');
        callback(error);
      }
    });
  }

  setOn(value, callback) {
    this.toggleLight(value, callback);
  }
}

function parseResponseToState(response) {
  try {
    const parsedResponse = JSON.parse(response);
    return parsedResponse.status === 'on';
  } catch (error) {
    return false;
  }
}

module.exports = GiraLightAccessory;
