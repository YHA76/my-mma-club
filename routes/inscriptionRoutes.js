const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { nom, prenom, photo, age, moyenPaiement, email } = req.body;

  // Vérification des champs obligatoires
  if (!nom || !prenom || !photo || !age || !moyenPaiement || !email) {
    return res
      .status(400)
      .json({ error: "Tous les champs obligatoires doivent être remplis." });
  }

  // Vérifier que l'email est valide
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  // Vérifier que l'âge est un nombre positif
  if (isNaN(age) || age <= 0) {
    return res
      .status(400)
      .json({ error: "L'âge doit être un nombre positif." });
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
