# MMA Casbah Fight – Serveur Back-End

Ce projet est le serveur back-end pour le site **MMA Casbah Fight**, permettant la gestion des inscriptions avec envoi par e-mail.

## 🚀 Fonctionnalités

- Envoi des inscriptions avec photo via e-mail (Nodemailer).
- Protection reCAPTCHA.
- Vérifications avancées côté serveur :
  - Origine (`Origin` header).
  - User-Agent.
  - Limitation des requêtes (Rate-limit).
- Validation complète des champs.

## 🔧 Installation

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/YHA76/my-mma-club.git
   cd my-mma-club
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Configurer les variables d'environnement :

   - Créer un fichier `.env` :
     ```
     EMAIL=tonemail@gmail.com
     PASSWORD=ton_mot_de_passe
     RECEIVING_EMAIL=email_club@gmail.com
     ```

4. Lancer le serveur :
   ```bash
   npm start
   ```

## 🧪 Tests

Lancer les tests automatisés :

```bash
npm test
```

## 📂 Structure

- `server.js` – Point d'entrée.
- `routes/inscriptionRoutes.js` – Gestion des inscriptions.
- `middlewares/security.js` – Sécurité serveur.
