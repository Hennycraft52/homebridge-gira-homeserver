const axios = require('axios');
const https = require('https');

function toggleLamp(ip, lampId, username, password) {
    const url = `https://${ip}/endpoints/call?key=CO@${lampId}&method=toggle&value=1&user=${username}&pw=${password}`;

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    return axios.get(url, { httpsAgent: agent })
        .then(response => response.data)
        .catch(error => {
            if (error.response) {
                return error.response.data;
            } else {
                throw error;
            }
        });
}

function getLampStatus(ip, lampId, username, password) {
    const url = `https://${ip}/endpoints/call?key=CO@${lampId}&method=get&user=${username}&pw=${password}`;

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    return axios.get(url, { httpsAgent: agent })
        .then(response => response.data)
        .catch(error => {
            if (error.response) {
                return error.response.data;
            } else {
                throw error;
            }
        });
}

module.exports = {
    toggleLamp,
    getLampStatus
};
