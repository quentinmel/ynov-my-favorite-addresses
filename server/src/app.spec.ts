import request from "supertest";
import app from "./app";
import datasource from "./datasource";
import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

  it("retourne 400 si email invalide", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "not-an-email", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid email");
  });

  it("retourne 400 si email déjà utilisé", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: ctx.email, password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("email already used");
  });

  it("retourne 400 si email ou password manquant", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "only@email.com" });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si seulement password fourni", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ password: "somepassword" });

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

// --- Tests supplémentaires pour augmenter le code coverage ---

describe("POST /api/users/tokens - cas d'erreur", () => {
  it("retourne 400 si email ou password manquant", async () => {
    const response = await request(app)
      .post("/api/users/tokens")
      .send({ email: "test@test.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("email and password are required");
  });

  it("retourne 400 si l'utilisateur n'existe pas", async () => {
    const response = await request(app)
      .post("/api/users/tokens")
      .send({ email: "nonexistent@test.com", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("wrong credentials");
  });

  it("retourne 400 si le mot de passe est incorrect", async () => {
    const response = await request(app)
      .post("/api/users/tokens")
      .send({ email: ctx.email, password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("wrong credentials");
  });
});

describe("GET /api/users/me - cas d'erreur", () => {
  it("retourne 403 avec un token invalide", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.status).toBe(403);
  });

  it("retourne 403 avec un header Authorization mal formé", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", "NotBearer sometoken");

    expect(response.status).toBe(403);
  });
});

describe("Addresses - CRUD complet", () => {
  it("POST /api/addresses - crée une adresse avec succès", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        features: [
          {
            geometry: {
              coordinates: [2.3522, 48.8566],
            },
          },
        ],
      },
    });

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        searchWord: "Paris",
        name: "Mon adresse Paris",
        description: "Une belle adresse",
      });

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.name).toBe("Mon adresse Paris");
    expect(response.body.item.lng).toBe(2.3522);
    expect(response.body.item.lat).toBe(48.8566);

    ctx.addressId = response.body.item.id;
  });

  it("POST /api/addresses - crée une adresse avec lat/lng sans géocodage", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        name: "Adresse latlng",
        description: "Sans geocodage",
        lat: 48.85837,
        lng: 2.29448,
      });

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.lat).toBe(48.85837);
    expect(response.body.item.lng).toBe(2.29448);
  });

  it("PUT /api/addresses/:id - modifie une adresse", async () => {
    const response = await request(app)
      .put(`/api/addresses/${ctx.addressId}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Adresse modifiée", description: "Nouvelle description" });

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.name).toBe("Adresse modifiée");
    expect(response.body.item.description).toBe("Nouvelle description");
  });

  it("PUT /api/addresses/:id - retourne 400 si name manquant", async () => {
    const response = await request(app)
      .put(`/api/addresses/${ctx.addressId}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ description: "Description seule" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("name is required");
  });

  it("PUT /api/addresses/:id - retourne 404 si adresse inconnue", async () => {
    const response = await request(app)
      .put(`/api/addresses/999999`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Adresse inexistante" });

    expect(response.status).toBe(404);
  });

  it("PUT /api/addresses/:id - retourne 403 sans authentification", async () => {
    const response = await request(app)
      .put(`/api/addresses/${ctx.addressId}`)
      .send({ name: "Adresse modifiée" });

    expect(response.status).toBe(403);
  });

  it("PATCH /api/addresses/:id/verify - marque une adresse comme vérifiée", async () => {
    const response = await request(app)
      .patch(`/api/addresses/${ctx.addressId}/verify`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ verified: true });

    expect(response.status).toBe(200);
    expect(response.body.item).toBeDefined();
    expect(response.body.item.verified).toBe(true);
  });

  it("POST /api/addresses - retourne 400 si name ou searchWord manquant", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Test" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("name and search word are required");
  });

  it("POST /api/addresses - retourne 404 si l'adresse n'est pas trouvée par l'API geo", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { features: [] },
    });

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ searchWord: "xyznonexistent", name: "Nowhere" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("search word not found");
  });

  it("POST /api/addresses - retourne 403 sans authentification", async () => {
    const response = await request(app)
      .post("/api/addresses")
      .send({ searchWord: "Paris", name: "Test" });

    expect(response.status).toBe(403);
  });

  it("GET /api/addresses - récupère les adresses de l'utilisateur", async () => {
    const response = await request(app)
      .get("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/addresses - ne retourne pas les adresses d'un autre utilisateur", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 12 });

    const createRes = await request(app)
      .post("/api/users")
      .send({ email, password });

    const tokenRes = await request(app)
      .post("/api/users/tokens")
      .send({ email, password });

    const otherToken = tokenRes.body.token;

    const otherAddresses = await request(app)
      .get("/api/addresses")
      .set("Authorization", `Bearer ${otherToken}`);

    const ids = (otherAddresses.body.items || []).map((item: any) => item.id);
    expect(ids).not.toContain(ctx.addressId);
    expect(createRes.status).toBe(200);
    expect(tokenRes.status).toBe(200);
  });

  it("PUT /api/addresses/:id - interdit la modification par un autre utilisateur", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 12 });

    await request(app).post("/api/users").send({ email, password });
    const tokenRes = await request(app)
      .post("/api/users/tokens")
      .send({ email, password });

    const response = await request(app)
      .put(`/api/addresses/${ctx.addressId}`)
      .set("Authorization", `Bearer ${tokenRes.body.token}`)
      .send({ name: "Tentative d'édition" });

    expect(response.status).toBe(404);
  });

  it("GET /api/addresses - retourne 403 sans authentification", async () => {
    const response = await request(app).get("/api/addresses");

    expect(response.status).toBe(403);
  });
});

describe("POST /api/addresses/searches - recherche par rayon", () => {
  it("retourne les adresses dans le rayon", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        radius: 1000,
        from: { lat: 48.8566, lng: 2.3522 },
      });

    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it("retourne un tableau vide si aucune adresse dans le rayon", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        radius: 0.001,
        from: { lat: -33.8688, lng: 151.2093 },
      });

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it("retourne 400 si radius manquant", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si radius négatif", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ radius: -5, from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si radius n'est pas un nombre", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ radius: "abc", from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si from manquant", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ radius: 100 });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si from.lat manquant", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ radius: 100, from: { lng: 2.3522 } });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si from.lng n'est pas un nombre", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ radius: 100, from: { lat: 48.8566, lng: "abc" } });

    expect(response.status).toBe(400);
  });

  it("retourne 403 sans authentification", async () => {
    const response = await request(app)
      .post("/api/addresses/searches")
      .send({ radius: 100, from: { lat: 48.8566, lng: 2.3522 } });

    expect(response.status).toBe(403);
  });
});

describe("getCoordinatesFromSearch - via mock axios", () => {
  it("retourne null si l'API geo lance une erreur", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ searchWord: "ErrorTest", name: "Error" });

    expect(response.status).toBe(404);
  });

  it("retourne null si features ne contient pas de coordonnées valides", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        features: [
          {
            geometry: {
              coordinates: [1], // seulement 1 coordonnée au lieu de 2
            },
          },
        ],
      },
    });

    const response = await request(app)
      .post("/api/addresses")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ searchWord: "BadData", name: "Bad" });

    expect(response.status).toBe(404);
  });
});

describe("Route 404", () => {
  it("retourne 404 pour une route inconnue", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
  });

  it("retourne 404 pour une route hors /api", async () => {
    const response = await request(app).get("/nonexistent");

    expect(response.status).toBe(404);
  });
});
