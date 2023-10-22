const homebridge = require('homebridge');
const GiraHomeserverConnect = require('./GiraHomeserverConnect');

const PluginName = 'homebridge-gira-homeserver';
const PlatformName = 'GiraHomeserverPlatform';

class GiraHomeserverPlatform {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    if (!this.config.host) {
      throw new Error('Please specify the Gira HomeServer host in your configuration.');
    }

    this.host = this.config.host;

    // Initialize your Gira HomeServer integration here
    new GiraHomeserverConnect(this.log, this.host, this.api);

    // Register the platform to Homebridge
    this.api.registerPlatform(PluginName, PlatformName, this);
  }

  accessories(callback) {
    // Implement the accessories() method to return an array of devices
    const accessories = [];

    // Create and push devices to the accessories array

    callback(accessories);
  }
}

module.exports = (api) => {
  api.registerPlatform(PluginName, PlatformName, GiraHomeserverPlatform);
};
