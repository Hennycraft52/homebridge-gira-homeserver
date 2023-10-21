const GiraHomeServerPlatform = require('./GiraHomeserverPlatform.js');

module.exports = (homebridge) => {
  homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);
};
