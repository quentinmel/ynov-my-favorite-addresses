import express from "express";
import apiRouter from "./router";

export const app = express();

// use JSON for req.body
app.use(express.json());

// expose coverage data for E2E tests (only when instrumented by nyc)
app.get("/__coverage__", (_, res) => {
  const g = globalThis as Record<string, unknown>;
  if (g.__coverage__) {
    res.json(g.__coverage__);
  } else {
    res.status(404).json({ message: "no coverage data available" });
  }
});

// use the router to answers request on /api
app.use("/api", apiRouter);

// return HTTP 404 if the request has not been handled
app.use((_, res) => {
  res.status(404).send();
});

export default app;
