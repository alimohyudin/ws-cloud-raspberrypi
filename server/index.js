const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;
app.use(cors());
app.use(bodyParser.json());

const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

let activePiConnection = null;

wss.on('connection', (ws) => {
    console.log('LiDAR device connected via WebSocket');

    activePiConnection = ws;

    ws.on('message', (message) => {
        console.log('Received data from Pi:', message);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('LiDAR device disconnected');
        activePiConnection = null;
    });
});

app.get('/api/data', (req, res) => {
    if (activePiConnection && activePiConnection.readyState === WebSocket.OPEN) {
        activePiConnection.send('REQUEST_DATA');

        activePiConnection.once('message', (data) => {
            console.log('Received data from P');
            res.json({ success: true, data: JSON.parse(data) });
        });
    } else {
        res.status(404).json({ success: false, message: 'Pi is not connected' });
    }
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:8080`);
});
