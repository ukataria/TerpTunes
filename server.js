require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const apiRoutes = require("./routes/apiRoutes");
const collectionRoutes = require("./routes/collectionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);
app.use("/collection", collectionRoutes);

/* ---- Page Routes ---- */

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.redirect("/");

  try {
    const response = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    res.render("searchResults", { tracks: data.data || [], query });
  } catch (err) {
    console.error("Deezer search error:", err);
    res.render("searchResults", { tracks: [], query });
  }
});

app.get("/artist/:id", async (req, res) => {
  const artistId = req.params.id;
  try {
    const [artistRes, topRes, relatedRes] = await Promise.all([
      fetch(`https://api.deezer.com/artist/${artistId}`),
      fetch(`https://api.deezer.com/artist/${artistId}/top?limit=10`),
      fetch(`https://api.deezer.com/artist/${artistId}/related?limit=6`),
    ]);

    const artist = await artistRes.json();
    const topTracks = await topRes.json();
    const related = await relatedRes.json();

    res.render("artist", {
      artist,
      topTracks: topTracks.data || [],
      relatedArtists: related.data || [],
    });
  } catch (err) {
    console.error("Deezer artist error:", err);
    res.redirect("/");
  }
});

/* ---- Start ---- */

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected, reconnecting...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    serverSelectionTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`TerpTunes running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
