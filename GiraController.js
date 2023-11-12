const axios = require('axios');

class GiraController {
  constructor(log, host, username, password) {
    this.log = log;
    this.host = host;
    this.username = username;
    this.password = password;
    this.token = null;

    // Registrieren Sie den Client und initialisieren Sie den Token
    this.registerClient();
  }

  registerClient() {
    const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;

    const clientRegistrationData = {
      client: 'homebridge',
    };

    axios.post(`${this.host}/api/v2/clients`, clientRegistrationData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Cache-Control': 'no-cache',
      },
    })
      .then((response) => {
        // Erfolgreiche Antwort
        this.token = response.data.token;
        this.log('Client erfolgreich registriert. Token:', this.token);
      })
      .catch((error) => {
        // Fehler bei der Anfrage
        this.log.error('Fehler bei der Client-Registrierung:', error.message);
      });
  }

  // Hier können Sie Ihre spezifische Steuerungslogik implementieren
  // Beispiel: Schalten Sie ein Gira-Gerät ein
  turnOnDevice(deviceId) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Cache-Control': 'no-cache',
    };

    const requestData = {
      state: 'on',
    };

    axios.put(`${this.host}/api/v2/devices/${deviceId}`, requestData, { headers })
      .then((response) => {
        // Erfolgreiche Antwort
        this.log('Gerät eingeschaltet:', response.data);
      })
      .catch((error) => {
        // Fehler bei der Anfrage
        this.log.error('Fehler beim Einschalten des Geräts:', error.message);
      });
  }

  // Weitere Steuerungsfunktionen können hier hinzugefügt werden
}

module.exports = GiraController;
