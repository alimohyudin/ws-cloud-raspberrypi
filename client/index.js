const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const ws = new WebSocket(`ws://${process.env.VPS_HOST}:${process.env.VPS_PORT}`);
const jsonFilePath = path.join(__dirname, process.env.DETECTION_FILE || './detection_data.json');


ws.on('open', () => {
    console.log('Connected to VPS WebSocket server');

    ws.send(JSON.stringify({ device: 'LiDAR', status: 'active' }));
});

ws.on('message', (message) => {
    const messageStr = message.toString();
    console.log('Received from server:', messageStr);

    if (messageStr === 'REQUEST_DATA') {
        filterAndSendData();
    }
});

ws.on('close', () => {
    console.log('Disconnected from VPS WebSocket server');
});

function filterAndSendData() {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            return;
        }

        const currentDate = new Date();

        const filteredData = jsonData.filter(entry => {
            const entryDate = new Date(entry.DateTime);
            const diffInDays = (currentDate - entryDate) / (1000 * 60 * 60 * 24);
            return diffInDays <= 7;
        });

        fs.writeFile(jsonFilePath, JSON.stringify(filteredData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing filtered data to file:', writeErr);
            } else {
                console.log('Filtered data saved to file');
            }
        });

        ws.send(JSON.stringify(filteredData));
    });
}