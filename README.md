# Homebridge Gira HomeServer Plugin

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">


Homebridge Plugin for integrating Gira HomeServer with HomeKit.

## Installation

1. Install Homebridge if you haven't already:

````ash
npm install -g homebridge
````

Install the Gira HomeServer Plugin:
````
npm install -g homebridge-gira-homeserver
````
## Configuration
Add the platform to your config.json file:

````
"platforms": [
  {
    "platform": "GiraHomeServer",
    "name": "Gira HomeServer",
    "lights": [
      {"name": "Light 1", "id": "1_1_13"},
      {"name": "Light 2", "id": "1_1_14"},
      {"name": "Light 3", "id": "1_1_15"}
    ],
    "serverIP": "ip",
    "username": "bn",
    "password": "pw"
  }
]
````
Adjust the configuration according to your Gira HomeServer installation.

License
This project is licensed under the MIT License.

