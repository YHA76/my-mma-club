const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cache pour stocker les derniers envois
const lastSubmissionCache = {};

// Configuration de multer pour stocker en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Seuls les fichiers images sont autorisés!"), false);
    }
    cb(null, true);
  },
});

// Fonction pour vérifier si l'email peut soumettre un formulaire
const canSubmit = (email) => {
  const lastSubmission = lastSubmissionCache[email];
  if (!lastSubmission) return true;

  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes
  return now - lastSubmission >= fiveMinutes;
};

router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { nom, prenom, age, moyenPaiement, email, captchaToken } = req.body;
    const photo = req.file;
    const moyensPaiementValides = ["Carte bancaire", "Espèce"];

    // Vérification du délai entre les soumissions
    if (!canSubmit(email)) {
      const lastSubmission = lastSubmissionCache[email];
      const now = Date.now();
      const timeLeft = Math.ceil(
        (5 * 60 * 1000 - (now - lastSubmission)) / 1000 / 60
      );
      return res.status(429).json({
        error: `Vous devez attendre ${timeLeft} minute(s) avant de pouvoir soumettre un nouveau formulaire.`,
      });
    }

    // Vérification que le reCAPTCHA est bien fourni
    if (!captchaToken) {
      return res.status(400).json({ error: "CAPTCHA manquant." });
    }

    // Vérification du reCAPTCHA avec Google
    const captchaSecret = process.env.RECAPTCHA_SECRET;
    const captchaVerifyURL = "https://www.google.com/recaptcha/api/siteverify";

    try {
      const captchaResponse = await axios.post(captchaVerifyURL, null, {
        params: {
          secret: captchaSecret,
          response: captchaToken,
        },
      });

      if (!captchaResponse.data.success) {
        return res.status(400).json({ error: "CAPTCHA invalide." });
      }
    } catch (error) {
      // console.error("Erreur lors de la vérification du CAPTCHA :", error);
      return res
        .status(500)
        .json({ error: "Erreur de vérification du CAPTCHA." });
    }

    // Validation des champs obligatoires
    if (!nom || !prenom || !photo || !age || !moyenPaiement || !email) {
      return res
        .status(400)
        .json({ error: "Tous les champs doivent être remplis." });
    }

    // Validation de la longueur du nom et prénom
    if (nom.length < 3 || nom.length > 50) {
      return res
        .status(400)
        .json({ error: "Le nom doit contenir entre 3 et 50 caractères." });
    }

    if (prenom.length < 3 || prenom.length > 50) {
      return res
        .status(400)
        .json({ error: "Le prénom doit contenir entre 3 et 50 caractères." });
    }

    // Validation de l'âge
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return res
        .status(400)
        .json({ error: "L'âge doit être compris entre 16 et 100 ans." });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Veuillez entrer une adresse email valide." });
    }

    if (!moyensPaiementValides.includes(moyenPaiement)) {
      return res.status(400).json({ error: "Moyen de paiement invalide." });
    }

    // Configuration du transporteur d'e-mail avec nodemailer
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email envoyé au club avec les informations du membre
    let mailOptionsClub = {
      from: process.env.EMAIL,
      to: process.env.RECEIVING_EMAIL,
      subject: "Nouvelle inscription au club",
      html: `
        <h2>Nouvelle inscription au club</h2>
        <p><strong>Nom:</strong> ${nom}</p>
        <p><strong>Prénom:</strong> ${prenom}</p>
        <p><strong>Âge:</strong> ${age}</p>
        <p><strong>Moyen de paiement:</strong> ${moyenPaiement}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Photo:</strong> Voir pièce jointe</p>
      `,
      attachments: [
        {
          filename: photo.originalname,
          content: photo.buffer,
          contentType: photo.mimetype,
        },
      ],
    };

    // Email envoyé au membre pour confirmer son inscription
    let mailOptionsMembre = {
      from: process.env.EMAIL,
      to: email,
      subject: "Confirmation d'inscription - Club de MMA",
      html: `
        <h2>Confirmation d'inscription</h2>
        <p>Bonjour ${prenom},</p>
        <p>Nous avons bien reçu votre demande d'inscription au club de MMA.</p>
        <p><strong>Détails de votre inscription :</strong></p>
        <ul>
          <li>Nom : ${nom}</li>
          <li>Prénom : ${prenom}</li>
          <li>Âge : ${age}</li>
          <li>Moyen de paiement : ${moyenPaiement}</li>
        </ul>
        <p>Nous vous contacterons bientôt pour finaliser l'inscription.</p>
        <p>Sportivement,<br>MMA Casbah Fight.</p>
      `,
      attachments: [
        {
          filename: photo.originalname,
          content: photo.buffer,
          contentType: photo.mimetype,
        },
      ],
    };

    try {
      // console.log("Tentative d'envoi d'email avec pièce jointe...");
      // console.log("Type MIME:", photo.mimetype);
      // console.log("Taille du buffer:", photo.buffer.length);

      await transporter.sendMail(mailOptionsClub);
      // console.log("Email envoyé au club avec succès !");

      await transporter.sendMail(mailOptionsMembre);
      // console.log("Email envoyé au membre avec succès !");

      // Mise à jour du cache après un envoi réussi
      lastSubmissionCache[email] = Date.now();

      res.status(200).json({ message: "Inscription envoyée avec succès !" });
    } catch (error) {
      // console.error("Erreur lors de l'envoi du mail :", error);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'envoi de l'inscription." });
    }
  } catch (error) {
    // console.error("Erreur générale :", error);
    return res.status(500).json({
      error: "Une erreur est survenue lors du traitement de votre demande.",
    });
  }
});

module.exports = router;
