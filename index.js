const GiraHomeserverPlatform = require('./GiraHomeserverPlatform');

module.exports = (api) => {
  api.registerPlatform('homebridge-gira-homeserver', 'GiraHomeserverPlatform', GiraHomeserverPlatform);
};
