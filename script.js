// ===== Nivedita Kunj IPL 2026 — registration & display board =====

/* =========================================================
   CONFIG — paste your Google Apps Script Web App URL below
   (see SETUP-BACKEND.md). Until you do, the site runs in
   LOCAL mode (data saved only in this browser).
   ========================================================= */
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyfbwQRPbK6r6uA2egEet6BvgRLdgpDTTSDYUt_VCa0xhjU7VuPajRtyqdBTdM8wcM/exec",
};

const USE_BACKEND =
  typeof CONFIG.WEB_APP_URL === "string" &&
  CONFIG.WEB_APP_URL.indexOf("script.google.com") !== -1;

const STORAGE_KEY = "nk_ipl_teams_2026";
const DEADLINE = new Date("2026-07-13T23:59:59");

const CATEGORY_LABELS = {
  u12: "Under 12",
  "12to40": "12 to 40",
  "40plus": "40 Plus",
};

// In-memory copy of the current teams (source of truth for the board
// and duplicate checks). Filled from the backend or from localStorage.
let teamsCache = [];

/* ---------- local storage (fallback mode) ---------- */
function loadLocalTeams() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveLocalTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

/* ---------- backend (Google Apps Script) ---------- */

// Read the public team list via JSONP (avoids CORS issues with Apps Script).
function fetchTeamsJSONP() {
  return new Promise((resolve, reject) => {
    const cb = "nkipl_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, 12000);

    function cleanup() {
      clearTimeout(timer);
      delete window[cb];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cb] = (data) => {
      cleanup();
      resolve(data && data.teams ? data.teams : []);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("network error"));
    };
    script.src =
      CONFIG.WEB_APP_URL +
      "?callback=" + cb +
      "&t=" + Date.now();
    document.body.appendChild(script);
  });
}

// Write a registration. Uses a "simple" text/plain POST so the browser
// does not send a CORS preflight that Apps Script can't answer.
function postTeam(team) {
  return fetch(CONFIG.WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(team),
  });
}

/* ---------- display board ---------- */
function renderBoard() {
  const teams = teamsCache;
  const counts = { u12: 0, "12to40": 0, "40plus": 0 };
  teams.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });

  document.getElementById("count-total").textContent = teams.length;
  document.getElementById("count-u12").textContent = counts.u12;
  document.getElementById("count-12to40").textContent = counts["12to40"];
  document.getElementById("count-40plus").textContent = counts["40plus"];

  const list = document.getElementById("team-list");
  if (teams.length === 0) {
    list.innerHTML =
      '<p class="empty-note">No teams registered yet. Be the first! 🏆</p>';
    return;
  }

  list.innerHTML = teams
    .map((t) => {
      const players = (t.players || [])
        .map((p, i) =>
          i === 0
            ? `<span class="cap">★ ${escapeHtml(p)} (C)</span>`
            : escapeHtml(p)
        )
        .join(", ");
      return `
        <div class="team-item">
          <h4>${escapeHtml(t.teamName)} <span class="team-badge">${
        CATEGORY_LABELS[t.category] || escapeHtml(t.category)
      }</span></h4>
          <div class="team-meta">🏠 Flat ${escapeHtml(t.flat)}</div>
          <div class="team-players">${players}</div>
        </div>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ---------- refresh board from the right source ---------- */
async function refreshBoard() {
  if (USE_BACKEND) {
    try {
      teamsCache = await fetchTeamsJSONP();
    } catch (err) {
      // keep whatever we have; show a gentle note once
      console.warn("Could not load teams from backend:", err);
    }
  } else {
    teamsCache = loadLocalTeams();
  }
  renderBoard();
}

/* ---------- countdown ---------- */
function renderCountdown() {
  const el = document.getElementById("countdown");
  if (!el) return;
  const diff = DEADLINE - new Date();
  if (diff <= 0) {
    el.textContent = "Registration is now closed.";
    return;
  }
  const days = Math.floor(diff / 86400000);
  el.textContent =
    days > 0
      ? `${days} day${days === 1 ? "" : "s"} left to register`
      : "Last day to register!";
}

/* ---------- form handling ---------- */
function setMsg(text, type) {
  const msg = document.getElementById("form-msg");
  msg.textContent = text;
  msg.className = "form-msg" + (type ? " " + type : "");
}

function setSubmitting(isSubmitting) {
  const btn = document.querySelector("#reg-form button[type=submit]");
  if (!btn) return;
  btn.disabled = isSubmitting;
  btn.textContent = isSubmitting ? "Submitting…" : "🏏 Submit Registration";
}

document.getElementById("reg-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  if (new Date() > DEADLINE) {
    setMsg("Sorry, registration closed on July 13, 2026.", "error");
    return;
  }

  const teamName = document.getElementById("teamName").value.trim();
  const category = document.getElementById("category").value;
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const flat = document.getElementById("flat").value.trim();

  const playerInputs = Array.from(document.querySelectorAll(".player-name"));
  const players = playerInputs.map((i) => i.value.trim()).filter(Boolean);

  // --- validation ---
  if (!teamName || !category || !email || !mobile || !flat) {
    setMsg("Please fill in all required team details.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMsg("Please enter a valid email address.", "error");
    return;
  }
  if (!/^\d{10}$/.test(mobile)) {
    setMsg("Mobile number must be exactly 10 digits.", "error");
    return;
  }
  if (players.length === 0) {
    setMsg("Please enter at least the captain's name.", "error");
    return;
  }
  if (players.length > 4) {
    setMsg("A team can have a maximum of 4 players.", "error");
    return;
  }

  // client-side duplicate check against the latest known list
  if (
    teamsCache.some(
      (t) =>
        String(t.flat).toLowerCase() === flat.toLowerCase() &&
        t.category === category
    )
  ) {
    setMsg(
      "A team from this flat is already registered in this category.",
      "error"
    );
    return;
  }

  const team = {
    teamName, category, email, mobile, flat, players,
    registeredAt: new Date().toISOString(),
  };

  setSubmitting(true);

  if (USE_BACKEND) {
    try {
      await postTeam(team);
      // optimistic update so the board reflects it instantly
      teamsCache = teamsCache.concat([team]);
      renderBoard();
      setMsg(
        `🎉 Team "${teamName}" registered successfully in ${CATEGORY_LABELS[category]}!`,
        "success"
      );
      this.reset();
      // re-sync with the server shortly after (confirms the saved data)
      setTimeout(refreshBoard, 2500);
    } catch (err) {
      setMsg(
        "Network problem — could not submit. Please check your connection and try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  } else {
    // LOCAL fallback mode
    const teams = loadLocalTeams();
    teams.push(team);
    saveLocalTeams(teams);
    teamsCache = teams;
    renderBoard();
    setMsg(
      `🎉 Team "${teamName}" registered (local mode — set up the backend to share).`,
      "success"
    );
    this.reset();
    setSubmitting(false);
  }

  document.getElementById("board").scrollIntoView({ behavior: "smooth" });
});

// restrict mobile input to digits
document.getElementById("mobile").addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

/* ---------- init ---------- */
refreshBoard();
renderCountdown();
