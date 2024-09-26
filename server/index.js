const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;
app.use(cors());
app.use(bodyParser.json());

let wss;
let activePiConnection = null;

// Function to start the WebSocket server
function startServer() {
    wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

    wss.on('connection', (ws) => {
        console.log('LiDAR device connected via WebSocket');

        activePiConnection = ws;
        ws.isAlive = true; // Track if the client is alive

        ws.on('message', (message) => {
            console.log('Received data from Pi:');
            const data = JSON.parse(message);

            if (data.type === 'ping') {
                console.log('Received ping from Pi');
                ws.isAlive = true; // Reset the flag if ping is received
                ws.send('pong');
                return;
            }

            // Handle other messages here
            // console.log('Received data:', data);
        });

        const interval = setInterval(() => {
            wss.clients.forEach(client => {
                if (client.isAlive === false) {
                    console.log('LIDAR device disconnected.');
                    return client.terminate();
                }

                client.isAlive = false;
                client.ping();
            });
        }, 30000);

        ws.on('close', () => {
            console.log('LiDAR device disconnected');
            activePiConnection = null;
            clearInterval(interval); // Clear the interval on disconnect
        });
    });

    console.log(`WebSocket server is running on port ${process.env.WS_PORT || 8080}`);
}

// Function to close the server
function closeServer() {
    if (wss) {
        wss.close((err) => {
            if (err) {
                console.error('Error closing WebSocket server:', err);
            } else {
                console.log('WebSocket server closed');
                // Restart the server after closing
                startServer();
            }
        });
    }
}

app.get('/api/data', (req, res) => {
    if (activePiConnection && activePiConnection.readyState === WebSocket.OPEN) {
        activePiConnection.send('REQUEST_DATA');

        activePiConnection.once('message', (data) => {
            console.log('Received data from Pi for file');
            res.json({ success: true, data: JSON.parse(data) });
        });
    } else {
        closeServer();        
        res.status(404).json({ success: false, message: 'Pi is not connected' });
    }
});

startServer();


app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:8080`);
});
