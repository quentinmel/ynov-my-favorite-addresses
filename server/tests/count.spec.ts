import request from "supertest";
import { app } from "./testApp";

describe("POST /count", () => {
  it("should return the number of occurrences of a word", async () => {
    const response = await request(app)
      .post("/count")
      .send({
        text: "chat chien chat Chat",
        word: "chat"
      });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(3);
  });

  it("should return 400 if missing parameters", async () => {
    const response = await request(app)
      .post("/count")
      .send({});

    expect(response.status).toBe(400);
  });
});