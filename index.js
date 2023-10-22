const homebridge = require('homebridge');
const GiraHomeserverPlatform = require('./GiraHomeserverPlatform');

homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeserverPlatform', GiraHomeserverPlatform);
