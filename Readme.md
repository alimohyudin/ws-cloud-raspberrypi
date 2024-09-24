# WebSocket-Counter-Server

This is a WebSocket server which is used to count the number of people entering and leaving a room. It is used in conjunction with a LiDAR sensor and a Raspberry Pi.

## Installation

1. Clone the repository
2. Install the dependencies with `npm install`
3. Create a `.env` file with the following variables:
   - `VPS_HOST`: the hostname or IP address of the VPS
   - `VPS_PORT`: the port number to use for the WebSocket connection
   - `DETECTION_FILE`: the file path of the detection data JSON file
4. Run the server with `node index.js`

## Usage

1. Connect to the WebSocket server with a WebSocket client
2. Send a message to the server with the following format:
   - `{"device": "LiDAR", "status": "active"}`
3. The server will respond with the current count of people in the room
4. When a person enters or leaves the room, the server will send a message to the client with the updated count

## API

The server has one API endpoint:

* `GET /api/data`: returns the current count of people in the room

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
