const { SerialPort } = require("serialport");
const express = require("express");
const http = require("http");
const Readline = require("@serialport/parser-readline");

const app = express();
const server = http.createServer(app);
const port = 3000;

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
  });
});

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
