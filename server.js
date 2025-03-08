require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;
const inscriptionRoutes = require("./routes/inscriptionRoutes");

// Middleware
app.use(cors()); // Autorise les requêtes du front
app.use(bodyParser.json()); // Pour lire le JSON envoyé par le front
app.use("/api/inscription", inscriptionRoutes); // Routes pour gérer les inscriptions

// Route de test
app.get("/", (req, res) => {
  res.send("Serveur my-mma-club opérationnel !");
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
