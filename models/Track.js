const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  trackName: { type: String, required: true },
  artistName: { type: String, required: true },
  artistId: { type: Number },
  albumName: { type: String, default: "Unknown Album" },
  albumImage: { type: String },
  previewUrl: { type: String },
  deezerUrl: { type: String },
  duration: { type: Number },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  notes: { type: String, default: "" },
  savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Track", trackSchema);
