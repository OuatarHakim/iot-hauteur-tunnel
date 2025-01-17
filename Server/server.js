const { SerialPort } = require("serialport");
const express = require("express");
const http = require("http");
const Readline = require("@serialport/parser-readline");

const app = express();
const server = http.createServer(app);
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const mongoose = require("mongoose");

// Connexion à MongoDB
mongoose.connect("mongodb://mongodb:27017/arduino_data", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur de connexion à MongoDB :"));
db.once("open", () => {
  console.log("Connecté à la base de données MongoDB");
});

// Schéma pour les données Arduino
const arduinoDataSchema = new mongoose.Schema({
  distance: Number,
  maxAllowedHeight: Number,
  isAuthorized: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const ArduinoData = mongoose.model("ArduinoData", arduinoDataSchema);

// Fonction pour enregistrer les données dans la base de données MongoDB
function saveDataToMongoDB(distance, maxAllowedHeight, isAuthorized) {
  if (parseFloat(distance) !== 0) {
    const arduinoData = new ArduinoData({
      distance: parseFloat(distance),
      maxAllowedHeight: parseFloat(maxAllowedHeight),
      isAuthorized: isAuthorized,
    });

    arduinoData
      .save()
      .then(() => {
        console.log(
          "Données Arduino enregistrées avec succès dans la base de données"
        );
      })
      .catch((err) => {
        console.error(
          "Erreur lors de l'enregistrement des données Arduino:",
          err
        );
      });
  }
}

const serialPort = new SerialPort({
  path: "/dev/ttyACM0",
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

const parser = serialPort.pipe(
  new Readline.ReadlineParser({ delimiter: "\r\n" })
);

serialPort.on("open", function () {
  console.log("Port série ouvert");
});

serialPort.on("error", function (err) {
  console.error("Erreur :", err.message);
});


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/data", (req, res) => {
  parser.once("data", (data) => {
    const [distance, maxAllowedHeight] = data.split(",");
    console.log("Distance Update  = " + distance);
    console.log("Max Allowed Height Update = " + maxAllowedHeight);

    const isAuthorized = parseFloat(distance) >= parseFloat(maxAllowedHeight);

    const response = {
      type: "vehicleStatus",
      distance: parseFloat(distance),
      maxAllowedHeight: parseFloat(maxAllowedHeight),
      data: isAuthorized ? "Autorisé" : "Non Autorisé",
    };

    res.json(response);
    // Enregistrer les données dans la base de données MongoDB
    saveDataToMongoDB(distance, maxAllowedHeight, isAuthorized);
  });
});

app.post("/limit-distance", (req, res) => {
  const maxDistance = req.body.maxDistance;
  console.log("Distance maximale reçue depuis la page web:", maxDistance);

  // Envoyer la distance maximale à l'Arduino via le port série
  serialPort.write(`${maxDistance}\n`, (err) => {
    if (err) {
      console.error(
        "Erreur lors de l'envoi de la distance maximale à l'Arduino:",
        err
      );
      res.status(500).json({
        error: "Erreur lors de l'envoi de la distance maximale à l'Arduino",
      });
    } else {
      console.log(
        "Distance maximale envoyée avec succès à l'Arduino:",
        maxDistance
      );
      res.json({ maxDistance: maxDistance });
    }
  });
});

app.get("/statistics", (req, res) => {
  // Récupérer les données depuis la base de données MongoDB
  ArduinoData.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des données:", err);
      res.status(500).send("Erreur lors de la récupération des données");
    });
});

app.get("/unauthorized-vehicles", (req, res) => {
  // Récupérer le nombre de véhicules non autorisés regroupés par maxAllowedHeight
  ArduinoData.aggregate([
    {
      $match: {
        isAuthorized: false, // Filtrer les documents où isAuthorized est false
      },
    },
    {
      $group: {
        _id: "$maxAllowedHeight", // Champ pour le regroupement
        count: { $sum: 1 }, // Compter le nombre de documents dans chaque groupe
      },
    },
  ])
    .then((data) => {
      res.json(data); 
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des données:", err);
      res.status(500).send("Erreur lors de la récupération des données");
    });
});
app.get('/filter', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    console.log("conueeee")
    // Récupérer les statistiques entre les dates spécifiées
    const count = await ArduinoData.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } });
    console.log("conu" ,count)
    // Envoyer les statistiques récupérées en tant que réponse
    res.json(count);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des statistiques.' });
  }
});
server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
