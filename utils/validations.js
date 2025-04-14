// Fonctions de validation

// Validation du nom
const validateName = (name) => {
  return name && name.length >= 3 && name.length <= 50;
};

// Validation de l'âge
const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 16 && ageNum <= 100;
};

// Validation de l'email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation du moyen de paiement
const validatePaymentMethod = (method) => {
  const moyensPaiementValides = ["Carte bancaire", "Espèce"];
  return moyensPaiementValides.includes(method);
};

// Validation de la photo
const validatePhoto = (photo) => {
  if (!photo) return false;

  // Vérification du type d'image
  const validMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validMimeTypes.includes(photo.mimetype)) return false;

  // Vérification de la taille (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (photo.size > maxSize) return false;

  return true;
};

// Validation du CAPTCHA
const validateCaptcha = async (token) => {
  if (!token) return false;

  try {
    const captchaSecret = process.env.RECAPTCHA_SECRET;
    const captchaVerifyURL = "https://www.google.com/recaptcha/api/siteverify";

    const response = await fetch(captchaVerifyURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${captchaSecret}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Erreur lors de la validation du CAPTCHA:", error);
    return false;
  }
};

// Validation des champs obligatoires
const validateRequiredFields = (fields) => {
  const requiredFields = ["nom", "prenom", "age", "moyenPaiement", "email"];
  return requiredFields.every((field) => fields[field]);
};

module.exports = {
  validateName,
  validateAge,
  validateEmail,
  validatePaymentMethod,
  validatePhoto,
  validateCaptcha,
  validateRequiredFields,
};
