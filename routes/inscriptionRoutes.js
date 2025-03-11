const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const recentSubmissions = new Map(); // Stocke les inscriptions récentes (temporaire en RAM)

router.post("/", async (req, res) => {
  const { nom, prenom, photo, age, moyenPaiement, email } = req.body;
  const moyensPaiementValides = ["Carte bancaire", "Espèce"];

  // Vérifier si l'utilisateur a déjà soumis récemment
  const emailKey = email.toLowerCase();
  if (recentSubmissions.has(emailKey)) {
    return res.status(429).json({
      error:
        "Vous avez déjà soumis une inscription récemment. Veuillez patienter.",
    });
  }

  // Ajouter l'email à la liste des soumissions récentes (Expire après 10 minutes)
  recentSubmissions.set(emailKey, Date.now());
  setTimeout(() => recentSubmissions.delete(emailKey), 10 * 60 * 1000);

  // Vérification des champs obligatoires
  if (!nom || !prenom || !photo || !age || !moyenPaiement || !email) {
    return res
      .status(400)
      .json({ error: "Tous les champs doivent être remplis." });
  }

  // Vérification des champs obligatoires avec les limites de caractères
  if (!nom || nom.length < 3 || nom.length > 50) {
    return res
      .status(400)
      .json({ error: "Le nom doit contenir entre 3 et 50 caractères." });
  }

  if (!prenom || prenom.length < 3 || prenom.length > 50) {
    return res
      .status(400)
      .json({ error: "Le prénom doit contenir entre 3 et 50 caractères." });
  }

  // Vérifier que l'email est valide
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Veuillez entrez une adresse mail valide." });
  }

  // Vérifier que l'âge est un âge valide
  if (!age || isNaN(age) || age < 6 || age > 80) {
    return res
      .status(400)
      .json({ error: "L'âge doit être un nombre entre 6 et 80 ans." });
  }

  // Vérifier que le moyen de paiement est valide
  if (!moyenPaiement || !moyensPaiementValides.includes(moyenPaiement)) {
    return res.status(400).json({
      error: "Le moyen de paiement doit être 'Carte bancaire' ou 'Espèce'.",
    });
  }

  // Configurer le transporteur d'e-mail
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: process.env.RECEIVING_EMAIL,
    subject: "Nouvelle inscription au club",
    text: `Nom: ${nom}\nPrénom: ${prenom}\nÂge: ${age}\nMoyen de paiement: ${moyenPaiement}\nEmail: ${email}\nPhoto: [Fichier attaché]`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Inscription envoyée avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail :", error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'inscription." });
  }
});

module.exports = router;
