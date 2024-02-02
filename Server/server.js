// server.js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Serveur IoT');
});

app.post('/distance', (req, res) => {
  // Recevoir la distance depuis Arduino et prendre des actions en conséquence
  const distance = req.body.distance;

  // Logique pour demander de ne pas avancer si la hauteur du véhicule est trop grande

  res.send(`Distance reçue : ${distance}`);
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});

