/* ============================================================
   Rami & Yasmeen — RSVP logic + gentle magic
============================================================ */

/* ---------- 1. Scroll-reveal ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* ---------- 2. Falling petals ---------- */
(function petals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    if (document.hidden) return;
    const p = document.createElement("div");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "vw";
    const dur = 7 + Math.random() * 7;
    p.style.animationDuration = dur + "s";
    p.style.opacity = 0.4 + Math.random() * 0.5;
    const s = 8 + Math.random() * 12;
    p.style.width = p.style.height = s + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 500);
  }, 1400);
})();

/* ---------- 2b. Sunshine light rays ---------- */
(function lightRays() {
  const host = document.querySelector(".light-rays");
  if (!host) return;
  const COUNT = 11;
  // Fan the rays across a downward arc centered on the top of the page.
  const spread = 70; // total degrees, from -35° to +35°
  for (let i = 0; i < COUNT; i++) {
    const ray = document.createElement("div");
    ray.className = "ray";
    // even base angle + a little jitter so it feels hand-painted
    const base = -spread / 2 + (spread / (COUNT - 1)) * i;
    const angle = base + (Math.random() * 6 - 3);
    ray.style.setProperty("--a", angle.toFixed(2) + "deg");
    ray.style.setProperty("--o", (0.28 + Math.random() * 0.4).toFixed(2));
    ray.style.setProperty("--dur", (3.5 + Math.random() * 3).toFixed(1) + "s");
    ray.style.animationDelay = "-" + (Math.random() * 4).toFixed(1) + "s";
    ray.style.width = (5 + Math.random() * 5).toFixed(1) + "vw";
    host.appendChild(ray);
  }
})();

/* ---------- 3. RSVP ---------- */
const lookupBox = document.getElementById("rsvp-lookup");
const lookupErr = document.getElementById("lookup-error");
const codeInput = document.getElementById("code-input");
const form = document.getElementById("rsvp-form");
const greetingEl = document.getElementById("greeting");
const membersEl = document.getElementById("members");
const thanksEl = document.getElementById("rsvp-thanks");
const thanksSummary = document.getElementById("thanks-summary");
const songInput = document.getElementById("song-input");

let GUESTS = {};
let current = null; // { code, title, members }

/* Encode/decode the form body for Netlify */
function encode(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

/* Read ?c= invite code from URL */
function codeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("c") || params.get("code") || "").trim().toLowerCase();
}

/* Build the party member rows */
function renderParty(party) {
  current = party;
  greetingEl.textContent = "Dear " + party.title + ", we'd be honoured by your company.";
  membersEl.innerHTML = "";
  party.members.forEach((name, i) => {
    const row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML =
      '<span class="member-name">' + escapeHTML(name) + "</span>" +
      '<span class="choices">' +
        '<label><input type="radio" name="m' + i + '" value="Accepts with love" required /> Accept</label>' +
        '<label><input type="radio" name="m' + i + '" value="Regretfully declines" /> Decline</label>' +
      "</span>";
    membersEl.appendChild(row);
  });
  lookupBox.hidden = true;
  thanksEl.hidden = true;
  form.hidden = false;
}

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* Try to find a party by code */
function tryCode(raw) {
  const code = (raw || "").trim().toLowerCase();
  const party = GUESTS[code];
  if (party) {
    renderParty({ code, title: party.title, members: party.members });
    // keep code in URL so a refresh remembers them
    history.replaceState(null, "", "?c=" + encodeURIComponent(code));
    return true;
  }
  return false;
}

/* Load guest list, then decide what to show */
fetch("data/guests.json")
  .then((r) => r.json())
  .then((data) => {
    delete data._README;
    GUESTS = data;
    const urlCode = codeFromURL();
    if (urlCode && tryCode(urlCode)) return;
    // no valid code -> show lookup
    lookupBox.hidden = false;
  })
  .catch(() => { lookupBox.hidden = false; });

/* Lookup button */
document.getElementById("code-go").addEventListener("click", () => {
  if (!tryCode(codeInput.value)) {
    lookupErr.hidden = false;
  }
});
codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") document.getElementById("code-go").click(); });
codeInput.addEventListener("input", () => { lookupErr.hidden = true; });

/* Edit-again button */
document.getElementById("edit-again").addEventListener("click", () => {
  thanksEl.hidden = true;
  form.hidden = false;
});

/* Submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!current) return;

  // Build a readable per-person summary
  const lines = current.members.map((name, i) => {
    const sel = form.querySelector('input[name="m' + i + '"]:checked');
    return name + " — " + (sel ? sel.value : "no reply");
  });
  const responses = lines.join("\n");
  const song = (songInput && songInput.value.trim()) || "";

  const payload = {
    "form-name": "rsvp",
    inviteCode: current.code,
    partyTitle: current.title,
    responses: responses,
    songRequest: song,
    message: "",
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "sending…";

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encode(payload),
  })
    .then(() => showThanks(responses, song))
    .catch(() => {
      // Local preview (file://) or offline: still show confirmation so testing works
      showThanks(responses, song, true);
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "confirm";
    });
});

function showThanks(responses, song, local) {
  form.hidden = true;
  thanksEl.hidden = false;
  let txt = responses;
  if (song) txt += "\n\n♫ Song request: " + song;
  if (local) txt += "\n\n(Preview mode — this will be saved for real once the site is live on Netlify.)";
  thanksSummary.textContent = txt;
  thanksEl.scrollIntoView({ behavior: "smooth", block: "center" });
}
