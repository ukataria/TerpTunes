const express = require("express");
const router = express.Router();

const DEEZER_BASE = "https://api.deezer.com";

router.get("/search", async (req, res) => {
  try {
    const response = await fetch(
      `${DEEZER_BASE}/search?q=${encodeURIComponent(req.query.q || "")}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Deezer search failed" });
  }
});

router.get("/artist/:id", async (req, res) => {
  try {
    const response = await fetch(`${DEEZER_BASE}/artist/${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Deezer artist lookup failed" });
  }
});

router.get("/artist/:id/top", async (req, res) => {
  try {
    const response = await fetch(
      `${DEEZER_BASE}/artist/${req.params.id}/top?limit=10`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Deezer top tracks failed" });
  }
});

router.get("/artist/:id/related", async (req, res) => {
  try {
    const response = await fetch(
      `${DEEZER_BASE}/artist/${req.params.id}/related?limit=6`
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Deezer related artists failed" });
  }
});

module.exports = router;
