const GiraController = require('./GiraController'); // Stellen Sie sicher, dass der Pfad korrekt ist

class GiraHomeServerPlatform {
  constructor(log, config) {
    this.log = log;
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.token = config.token;

    if (!this.token) {
      // Wenn kein Token vorhanden ist, registrieren Sie den Client und speichern Sie den Token
      this.registerClientAndInitialize();
    } else {
      // Wenn ein Token vorhanden ist, führen Sie die normale Logik fort
      this.initialize();
    }
  }

  registerClientAndInitialize() {
    const giraController = new GiraController(this.log, this.host, this.username, this.password);

    // Speichern Sie den Token in der Konfiguration
    this.token = giraController.token;
    this.saveTokenToConfig();

    // Initialisieren Sie Ihr Plugin nach der erfolgreichen Registrierung
    this.initialize();
  }

  saveTokenToConfig() {
    // Fügen Sie den Token zur Konfiguration hinzu und speichern Sie die Konfiguration
    this.config.token = this.token;
    this.saveConfig();
  }

  initialize() {
    // Führen Sie hier die normale Initialisierung für Ihr Plugin durch
    // Verwenden Sie this.host, this.username, this.password und this.token nach Bedarf

    // Beispiel: Schalten Sie ein Gira-Gerät mit ID '123' ein
    this.turnOnDevice('123');
  }

  turnOnDevice(deviceId) {
    // Hier können Sie Ihre Steuerungslogik implementieren
    // Rufen Sie die entsprechende Methode in GiraController auf
    const giraController = new GiraController(this.log, this.host, this.username, this.password);
    giraController.turnOnDevice(deviceId);
  }
}

// Registrieren Sie das Plugin
homebridge.registerPlatform('homebridge-gira-homeserver', 'GiraHomeServer', GiraHomeServerPlatform);

