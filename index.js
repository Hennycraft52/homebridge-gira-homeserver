const axios = require('axios');

class GiraHomeServerPlatform {
  constructor(log, config) {
    this.log = log;
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.token = config.token;

    if (!this.token) {
      // Wenn kein Token vorhanden ist, registrieren Sie den Client und speichern Sie den Token
      this.registerClient();
    } else {
      // Wenn ein Token vorhanden ist, führen Sie die normale Logik fort
      this.initialize();
    }
  }

  registerClient() {
    const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;

    const clientRegistrationData = {
      client: 'de.example.myapp',
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

        // Speichern Sie den Token in der Konfiguration
        this.saveTokenToConfig();

        // Initialisieren Sie Ihr Plugin nach der erfolgreichen Registrierung
        this.initialize();
      })
      .catch((error) => {
        // Fehler bei der Anfrage
        this.log.error('Fehler bei der Client-Registrierung:', error.message);
      });
  }

  saveTokenToConfig() {
    // Fügen Sie den Token zur Konfiguration hinzu und speichern Sie die Konfiguration
    this.config.token = this.token;
    this.saveConfig();
  }

  initialize() {
    // Führen Sie hier die normale Initialisierung für Ihr Plugin durch
    // Verwenden Sie this.host, this.username, this.password und this.token nach Bedarf
  }
}

// Registrieren Sie das Plugin
homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);
