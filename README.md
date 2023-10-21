# Gira HomeServer Homebridge Plugin

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dein-benutzername/dein-repository/CI)
![GitHub](https://img.shields.io/github/license/dein-benutzername/dein-repository)

Dies ist ein Homebridge-Plugin für die Integration deines Gira HomeServer in Apple HomeKit. Mit diesem Plugin kannst du deine Gira-Geräte und -Services in deinem Apple HomeKit-Ökosystem steuern.

## Features

- Unterstützung für Gira HomeServer
- Integration von Gira-Geräten und -Services in HomeKit
- Einfache Konfiguration über die Homebridge-UI

## Voraussetzungen

- Eine funktionierende Homebridge-Installation
- Einen Gira HomeServer in deinem Netzwerk
- Node.js und npm auf deinem Homebridge-Host

## Installation

1. Installiere das Plugin über npm:

   ```bash
   npm install -g homebridge-gira-homeserver

Konfiguriere das Plugin in deiner Homebridge-config.json-Datei. Siehe Konfiguration für Details.

Starte Homebridge neu.

Konfiguration
Füge das Plugin zu deiner Homebridge-config.json-Datei hinzu. Hier ist ein Beispiel:
{
 "platforms": [
  {
    "platform": "GiraHomeServer",
    "name": "Gira HomeServer",
    "host": "IP_deines_Gira_HomeServers",
    "username": "dein_Benutzername",
    "password": "dein_Passwort"
  }
] 
}


platform: Der Name deiner Plattform.
name: Der Anzeigename deiner Plattform in HomeKit.
host: Die IP-Adresse oder der Hostname deines Gira HomeServers.
username: Dein Gira HomeServer Benutzername.
password: Dein Gira HomeServer Passwort.

##Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe LICENSE für weitere Details.

##Mitwirkende
Wir begrüßen Beiträge und Issues von der Community. Bitte beachte unsere Beitragshinweise für weitere Informationen.



