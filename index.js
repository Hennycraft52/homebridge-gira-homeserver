const GiraHomeServerPlatform = require('./GiraHomeserverPlatform');

module.exports = (homebridge) => {
  homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);
};
