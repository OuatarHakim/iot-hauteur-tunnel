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
/*
app.get("/data", (req, res) => {
  parser.once("data", (data) => {
    res.json({ type: "arduinoData", data: data.trim() });
  });
});
*/
app.get("/data", (req, res) => {
  parser.once("data", (data) => {
    const distance = parseFloat(data.trim());
    const isAuthorized = distance >= 100;

    const response = {
      type: "vehicleStatus",
      distance: distance,
      data: isAuthorized ? "Autorisé" : "Non Autorisé",
    };

    res.json(response);
  });
});

server.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
