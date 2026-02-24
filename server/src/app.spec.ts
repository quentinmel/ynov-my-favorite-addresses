import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

// Dictionnaire pour stocker les données entre les tests (scénario testing)
const ctx: Record<string, any> = {};

beforeAll(async () => {
  const dbPath = path.join(__dirname, "..", "db.sqlite");
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  await datasource.initialize();
});

afterAll(async () => {
  await datasource.destroy();
});

// --- Exercice 2 : création de compte ---

describe("POST /api/users", () => {
  it("crée un compte utilisateur avec des données aléatoires (faker)", async () => {
    ctx.email = faker.internet.email();
    ctx.password = faker.internet.password({ length: 12 });

    const response = await request(app)
      .post("/api/users")
      .send({ email: ctx.email, password: ctx.password });

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.email).toBe(ctx.email);
    expect(response.body.item.id).toBeDefined();

    ctx.userId = response.body.item.id;
  });

  it("retourne 400 si email ou password manquant", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "only@email.com" });

    expect(response.status).toBe(400);
  });
});

// --- Exercice 3 : scénario testing ---

describe("Scénario utilisateur complet", () => {
  it("connecte l'utilisateur créé (POST /api/users/tokens)", async () => {
    const response = await request(app)
      .post("/api/users/tokens")
      .send({ email: ctx.email, password: ctx.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();

    ctx.token = response.body.token;
  });

  it("récupère le profil de l'utilisateur connecté (GET /api/users/me)", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${ctx.token}`);

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.email).toBe(ctx.email);
    expect(response.body.item.id).toBe(ctx.userId);
  });

  it("retourne 403 sans token d'authentification", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(403);
  });
});