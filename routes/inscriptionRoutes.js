const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const axios = require("axios");

router.post("/", async (req, res) => {
  // console.log("Requête reçue du front :", req.body);

  const { nom, prenom, photo, age, moyenPaiement, email, captchaToken } =
    req.body;
  const moyensPaiementValides = ["Carte bancaire", "Espèce"];

  // Vérification que le reCAPTCHA est bien fourni
  if (!captchaToken) {
    console.log("CAPTCHA manquant !");
    return res.status(400).json({ error: "CAPTCHA manquant." });
  }

  // Vérification du reCAPTCHA avec Google
  const captchaSecret = process.env.RECAPTCHA_SECRET;
  const captchaVerifyURL = "https://www.google.com/recaptcha/api/siteverify";

  // console.log("Vérification du reCAPTCHA avec Google...");
  try {
    const captchaResponse = await axios.post(captchaVerifyURL, null, {
      params: {
        secret: captchaSecret,
        response: captchaToken,
      },
    });
    // console.log("Réponse de Google reCAPTCHA :", captchaResponse.data);

    if (!captchaResponse.data.success) {
      return res.status(400).json({ error: "CAPTCHA invalide." });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du CAPTCHA :", error);
    return res
      .status(500)
      .json({ error: "Erreur de vérification du CAPTCHA." });
  }

  // Vérification des champs obligatoires
  if (!nom || !prenom || !photo || !age || !moyenPaiement || !email) {
    return res
      .status(400)
      .json({ error: "Tous les champs doivent être remplis." });
  }

  if (!moyensPaiementValides.includes(moyenPaiement)) {
    return res.status(400).json({ error: "Moyen de paiement invalide." });
  }

  // Configuration du transporteur d'e-mail avec nodemailer
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL, // Adresse Gmail utilisée pour envoyer les mails
      pass: process.env.PASSWORD,
    },
  });

  // Email envoyé au club avec les informations du membre
  let mailOptionsClub = {
    from: process.env.EMAIL,
    to: process.env.RECEIVING_EMAIL,
    subject: "Nouvelle inscription au club",
    text: `Nom: ${nom}\nPrénom: ${prenom}\nÂge: ${age}\nMoyen de paiement: ${moyenPaiement}\nEmail: ${email}\nPhoto: [Fichier attaché]`,
  };

  // Email envoyé au membre pour confirmer son inscription
  let mailOptionsMembre = {
    from: process.env.EMAIL,
    to: email, // Adresse du membre inscrit
    subject: "Confirmation d'inscription - Club de MMA",
    text: `Bonjour ${prenom},\n\nNous avons bien reçu votre demande d'inscription au club de MMA.\n\nDétails de votre inscription :\n- Nom : ${nom}\n- Prénom : ${prenom}\n- Âge : ${age}\n- Moyen de paiement : ${moyenPaiement}\n\nNous vous contacterons bientôt pour finaliser l'inscription.\n\nSportivement,\nMMA Casbah Fight.`,
  };

  try {
    //console.log("Tentative d'envoi d'email au club...");
    await transporter.sendMail(mailOptionsClub);
    //console.log("Email envoyé au club !");

    //console.log("Tentative d'envoi d'email au membre...");
    await transporter.sendMail(mailOptionsMembre);
    //console.log("Email envoyé au membre !");

    // Envoi de la réponse au front uniquement si les emails ont bien été envoyés
    //console.log("Inscription envoyée avec succès !");
    res.status(200).json({ message: "Inscription envoyée avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail :", error);
    return res
      .status(500)
      .json({ error: "Erreur lors de l'envoi de l'inscription." });
  }
});

module.exports = router;
