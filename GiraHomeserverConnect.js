const axios = require('axios');

class GiraHomeserverConnect {
  constructor(log, host) {
    this.log = log;
    this.host = host;
  }

  // Funktion zum Abrufen eines Datenpunkts
  async getDatenpunkt(urn) {
    try {
      const response = await axios.get(`http://${this.host}/api/${urn}`);
      return response.data.value; // Wert des Datenpunkts
    } catch (error) {
      this.log.error('Fehler beim Abrufen des Datenpunkts:', error);
      return null;
    }
  }

  // Funktion zum Aktualisieren eines Datenpunkts
  async setDatenpunkt(urn, value) {
    try {
      await axios.put(`http://${this.host}/api/${urn}`, { value });
      this.log(`Datenpunkt ${urn} wurde auf ${value} gesetzt.`);
    } catch (error) {
      this.log.error('Fehler beim Aktualisieren des Datenpunkts:', error);
    }
  }
}

module.exports = GiraHomeserverConnect;
