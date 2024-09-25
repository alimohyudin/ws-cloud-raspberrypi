const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

let ws;
const jsonFilePath = path.join(__dirname, process.env.DETECTION_FILE || './detection_data.json');
const reconnectInterval = 5000;
let heartbeatInterval;
const heartbeatTime = 30000;


function connectWebSocket() {
    ws = new WebSocket(`ws://${process.env.VPS_HOST}:${process.env.VPS_PORT}`);

    ws.on('open', () => {
        console.log('Connected to VPS WebSocket server');
        
        heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, heartbeatTime);

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
        console.log('Disconnected from VPS WebSocket server. Attempting to reconnect...');
        clearInterval(heartbeatInterval);
        setTimeout(connectWebSocket, reconnectInterval);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close();
        setTimeout(connectWebSocket, reconnectInterval);
    });
}
// Start the WebSocket connection
connectWebSocket();

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