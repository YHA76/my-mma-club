const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const inscriptionRoutes = require("../routes/inscriptionRoutes");

// Préparer l'application pour le test
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/inscription", inscriptionRoutes);

describe("API /api/inscription", () => {
  test("devrait retourner 400 si aucun champ n'est envoyé", async () => {
    const res = await request(app).post("/api/inscription");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
