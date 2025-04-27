const {
  validateName,
  validateAge,
  validateEmail,
  validatePaymentMethod,
} = require("../utils/validations");

describe("Validation des champs du formulaire", () => {
  // Test de validation du nom
  describe("Validation du nom", () => {
    test("devrait accepter un nom valide", () => {
      expect(validateName("Tests")).toBe(true);
    });

    test("devrait rejeter un nom trop court", () => {
      expect(validateName("Te")).toBe(false);
    });

    test("devrait rejeter un nom trop long", () => {
      expect(validateName("Tests".repeat(11))).toBe(false);
    });

    test("devrait accepter un nom avec des espaces", () => {
      expect(validateName("Tests Tests")).toBe(true);
    });
  });

  // Test de validation de l'âge
  describe("Validation de l'âge", () => {
    test("devrait accepter un âge valide", () => {
      expect(validateAge("25")).toBe(true);
    });

    test("devrait rejeter un âge trop jeune", () => {
      expect(validateAge("7")).toBe(false);
    });

    test("devrait rejeter un âge trop vieux", () => {
      expect(validateAge("101")).toBe(false);
    });

    test("devrait rejeter un âge non numérique", () => {
      expect(validateAge("vingt-cinq")).toBe(false);
    });
  });

  // Test de validation de l'email
  describe("Validation de l'email", () => {
    test("devrait accepter un email valide", () => {
      expect(validateEmail("test@example.com")).toBe(true);
    });

    test("devrait rejeter un email sans @", () => {
      expect(validateEmail("testexample.com")).toBe(false);
    });

    test("devrait rejeter un email sans domaine", () => {
      expect(validateEmail("test@")).toBe(false);
    });

    test("devrait rejeter un email sans nom d'utilisateur", () => {
      expect(validateEmail("@example.com")).toBe(false);
    });
  });

  // Test de validation du moyen de paiement
  describe("Validation du moyen de paiement", () => {
    test("devrait accepter un moyen de paiement valide", () => {
      expect(validatePaymentMethod("Carte bancaire")).toBe(true);
      expect(validatePaymentMethod("Espèce")).toBe(true);
    });

    test("devrait rejeter un moyen de paiement invalide", () => {
      expect(validatePaymentMethod("Chèque")).toBe(false);
      expect(validatePaymentMethod("Bitcoin")).toBe(false);
    });
  });
});
