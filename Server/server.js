// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

app.get('/', (req, res) => {
  res.send('Serveur IoT');
});

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });

  socket.on('vehicleHeight', (height) => {
    if (height > limiteHauteur) {
      // Si la hauteur dépasse la limite, on envoie un message au client
      io.emit('message', 'Attention! La hauteur du véhicule est trop grande.');
    }
  });
});

const limiteHauteur = 200;  // la limite 

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
