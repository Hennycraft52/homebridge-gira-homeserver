const axios = require('axios');

module.exports = {
  connect: async (host, log) => {
    log('Connecting to Gira HomeServer...');
    try {
      const response = await axios.get(`http://${host}/api/someEndpoint`);
      log('Connected to Gira HomeServer successfully');
      return response;
    } catch (error) {
      log.error(`Error while connecting to Gira HomeServer: ${error}`);
      throw error;
    }
  },
};
