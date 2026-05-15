/* ---- Custom Audio Player ---- */
let currentAudio = null;
let currentPlayer = null;

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".player-btn");
  if (!btn) return;

  const player = btn.closest(".player");
  const src = player.dataset.src;
  if (!src) return;

  if (currentPlayer === player) {
    if (currentAudio.paused) {
      currentAudio.play();
      player.classList.add("playing");
    } else {
      currentAudio.pause();
      player.classList.remove("playing");
    }
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentPlayer.classList.remove("playing");
    const prevProgress = currentPlayer.querySelector(".player-progress");
    if (prevProgress) prevProgress.style.width = "0%";
    const prevTime = currentPlayer.querySelector(".player-time");
    if (prevTime) prevTime.textContent = "0:30";
  }

  const audio = new Audio(src);
  currentAudio = audio;
  currentPlayer = player;

  const progressBar = player.querySelector(".player-progress");
  const timeDisplay = player.querySelector(".player-time");

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = pct + "%";
      const remaining = Math.ceil(audio.duration - audio.currentTime);
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      timeDisplay.textContent = m + ":" + String(s).padStart(2, "0");
    }
  });

  audio.addEventListener("ended", () => {
    player.classList.remove("playing");
    progressBar.style.width = "0%";
    timeDisplay.textContent = "0:30";
    currentAudio = null;
    currentPlayer = null;
  });

  audio.play();
  player.classList.add("playing");
});

/* Seek on progress bar click */
document.addEventListener("click", (e) => {
  const bar = e.target.closest(".player-bar");
  if (!bar) return;

  const player = bar.closest(".player");
  if (player !== currentPlayer || !currentAudio) return;

  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  currentAudio.currentTime = pct * currentAudio.duration;
});

/* ---- Inline Star Rating Picker ---- */
document.addEventListener("click", (e) => {
  const star = e.target.closest(".star-pick");
  if (!star) return;

  const row = star.closest(".inline-rating");
  const value = parseInt(star.dataset.value, 10);
  row.dataset.rating = value;

  row.querySelectorAll(".star-pick").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.value, 10) <= value);
  });
});

/* hover preview for inline stars */
document.addEventListener("mouseover", (e) => {
  const star = e.target.closest(".star-pick");
  if (!star) return;

  const row = star.closest(".inline-rating");
  const value = parseInt(star.dataset.value, 10);

  row.querySelectorAll(".star-pick").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.value, 10) <= value);
  });
});

document.addEventListener("mouseout", (e) => {
  const star = e.target.closest(".star-pick");
  if (!star) return;

  const row = star.closest(".inline-rating");
  const saved = parseInt(row.dataset.rating, 10) || 0;

  row.querySelectorAll(".star-pick").forEach((s) => {
    s.classList.toggle("active", parseInt(s.dataset.value, 10) <= saved);
  });
});

/* ---- Save Track ---- */
async function saveTrack(button) {
  const data = JSON.parse(button.dataset.track);

  /* read rating from the inline picker in the same .save-row */
  const saveRow = button.closest(".save-row");
  if (saveRow) {
    const ratingRow = saveRow.querySelector(".inline-rating");
    const picked = parseInt(ratingRow?.dataset.rating, 10);
    if (picked >= 1 && picked <= 5) {
      data.rating = picked;
    }
  }

  button.disabled = true;
  button.textContent = "Saving...";

  try {
    const res = await fetch("/collection/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.duplicate) {
      button.textContent = "Already Saved";
      showToast("This track is already in your collection.", "error");
      return;
    }
    if (result.success) {
      button.textContent = "Saved!";
      showToast("Track saved to your collection!", "success");
    } else {
      throw new Error();
    }
  } catch {
    button.textContent = "Save";
    button.disabled = false;
    showToast("Failed to save track.", "error");
  }
}

/* ---- Delete Track ---- */
async function deleteTrack(id) {
  if (!confirm("Remove this track from your collection?")) return;

  try {
    const res = await fetch(`/collection/delete/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    if (result.success) {
      const card = document.getElementById(`track-${id}`);
      if (card) {
        card.style.transition = "opacity 0.3s, transform 0.3s";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => card.remove(), 300);
      }
      showToast("Track removed from collection.", "success");
    } else {
      throw new Error();
    }
  } catch {
    showToast("Failed to delete track.", "error");
  }
}

/* ---- Clear Collection ---- */
async function clearCollection() {
  if (!confirm("Delete ALL tracks from your collection? This cannot be undone.")) return;

  try {
    const res = await fetch("/collection/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    if (result.success) {
      showToast("Collection cleared.", "success");
      setTimeout(() => location.reload(), 500);
    } else {
      throw new Error();
    }
  } catch {
    showToast("Failed to clear collection.", "error");
  }
}

/* ---- Star Rating (edit page) ---- */
function setRating(value) {
  document.getElementById("rating-value").value = value;
  document.querySelectorAll(".star-input").forEach((star) => {
    const starVal = parseInt(star.dataset.value, 10);
    star.classList.toggle("star-input--active", starVal <= value);
  });
}

/* ---- Toast Notifications ---- */
function showToast(message, type) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
