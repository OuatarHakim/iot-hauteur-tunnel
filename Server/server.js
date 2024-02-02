const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

app.get('/', (req, res) => {
  res.send('Serveur IoT');
});

wss.on('connection', (ws) => {
  console.log('Un client s\'est connecté');

  ws.on('close', () => {
    console.log('Client déconnecté');
  });

  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);

    if (type === 'vehicleHeight') {
      const height = parseFloat(data);
      if (!isNaN(height) && height > limiteHauteur) {
        // Si la hauteur dépasse la limite, on envoie un message au client
        ws.send(JSON.stringify({ type: 'message', data: 'Attention! La hauteur du véhicule est trop grande.' }));
      }
    }
  });
});

const limiteHauteur = 200;  // la limite 

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
