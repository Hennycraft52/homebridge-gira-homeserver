// lib/get.js
const axios = require('axios');
const https = require('https');

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
    getLampStatus
};
