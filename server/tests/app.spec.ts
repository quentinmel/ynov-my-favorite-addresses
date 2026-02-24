import request from "supertest";
import { app } from "../src/app";
import { faker } from "@faker-js/faker";
import datasource from "../src/datasource";

beforeAll(async () => {
  await datasource.initialize();
});

afterAll(async () => {
  await datasource.destroy();
});

describe("User registration", () => {
  it("should create a user with random email and password", async () => {

    const email = faker.internet.email();
    const password = faker.internet.password({ length: 12 });

    const response = await request(app)
      .post("/api/users")
      .send({
        email,
        password
      });

    expect(response.status).toBe(201);
    expect(response.body.item.email).toBe(email);
  });
});