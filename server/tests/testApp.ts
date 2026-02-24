import express from "express";

export const app = express();
app.use(express.json());

app.post("/count", (req, res) => {
  const { text, word } = req.body;

  if (!text || !word) {
    return res.status(400).json({ error: "Missing text or word" });
  }

  const regex = new RegExp(word, "gi");
  const matches = text.match(regex);

  const count = matches ? matches.length : 0;

  return res.status(200).json({ count });
});