const express = require("express");
const router = express.Router();
const Track = require("../models/Track");

router.get("/", async (req, res) => {
  try {
    const tracks = await Track.find().sort({ savedAt: -1 });
    res.render("collection", { tracks });
  } catch (err) {
    console.error("Collection fetch error:", err);
    res.render("collection", { tracks: [] });
  }
});

router.post("/save", async (req, res) => {
  try {
    const existing = await Track.findOne({
      trackName: req.body.trackName,
      artistName: req.body.artistName,
    });

    if (existing) {
      if (req.headers["content-type"]?.includes("application/json")) {
        return res.json({ success: false, duplicate: true });
      }
      return res.redirect("/collection");
    }

    const track = new Track({
      trackName: req.body.trackName,
      artistName: req.body.artistName,
      artistId: req.body.artistId ? Number(req.body.artistId) : undefined,
      albumName: req.body.albumName || "Unknown Album",
      albumImage: req.body.albumImage,
      previewUrl: req.body.previewUrl,
      deezerUrl: req.body.deezerUrl,
      duration: req.body.duration ? Number(req.body.duration) : undefined,
      rating: req.body.rating ? Number(req.body.rating) : 3,
      notes: req.body.notes || "",
    });
    await track.save();

    if (req.headers["content-type"]?.includes("application/json")) {
      return res.json({ success: true, track });
    }
    res.redirect("/collection");
  } catch (err) {
    console.error("Save error:", err);
    if (req.headers["content-type"]?.includes("application/json")) {
      return res.status(500).json({ error: "Failed to save track" });
    }
    res.redirect("/collection");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.redirect("/collection");
    res.render("editTrack", { track });
  } catch (err) {
    console.error("Edit fetch error:", err);
    res.redirect("/collection");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    await Track.findByIdAndUpdate(req.params.id, {
      rating: Number(req.body.rating),
      notes: req.body.notes || "",
    });
    res.redirect("/collection");
  } catch (err) {
    console.error("Edit update error:", err);
    res.redirect("/collection");
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    await Track.findByIdAndDelete(req.params.id);

    if (req.headers["content-type"]?.includes("application/json")) {
      return res.json({ success: true });
    }
    res.redirect("/collection");
  } catch (err) {
    console.error("Delete error:", err);
    if (req.headers["content-type"]?.includes("application/json")) {
      return res.status(500).json({ error: "Failed to delete track" });
    }
    res.redirect("/collection");
  }
});

router.post("/clear", async (req, res) => {
  try {
    await Track.deleteMany({});

    if (req.headers["content-type"]?.includes("application/json")) {
      return res.json({ success: true });
    }
    res.redirect("/collection");
  } catch (err) {
    console.error("Clear error:", err);
    if (req.headers["content-type"]?.includes("application/json")) {
      return res.status(500).json({ error: "Failed to clear collection" });
    }
    res.redirect("/collection");
  }
});

module.exports = router;
