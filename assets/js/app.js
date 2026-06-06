/* =============================================================================
 *  Dia dos Namorados Scavenger Hunt — app logic
 * =============================================================================
 *  - SHA-256 password checks via Web Crypto API (no plaintext in source).
 *  - Inputs are normalized (trim + lowercase) before hashing so casing/spacing
 *    doesn't trip people up. The companion `tools/hash.html` normalizes the
 *    same way, so the hashes will line up.
 *  - Progress is persisted in localStorage under a versioned key.
 * ============================================================================= */
(function () {
  "use strict";

  const CONTENT = window.HUNT_CONTENT;
  if (!CONTENT) {
    console.error("HUNT_CONTENT not loaded — check assets/js/content.js");
    return;
  }

  // Merge the editable clue text (assets/js/clues.js) into each stage, keyed
  // by stage number. This lets the clues be written/edited in one dedicated
  // file without touching the structural config here.
  const CLUES = window.HUNT_CLUES || {};
  if (Array.isArray(CONTENT.stages)) {
    CONTENT.stages.forEach((stage) => {
      const c = CLUES[stage.number];
      if (!c) return;
      ["clue", "hint", "passwordHint", "locationDetail", "reveal"].forEach((key) => {
        if (typeof c[key] === "string") stage[key] = c[key];
      });
    });
  }

  // -------------------------------------------------------------------------
  //  Storage
  //  Stage progress persists across visits, but the master gate does NOT —
  //  the locked door appears every time, even if they've already entered.
  // -------------------------------------------------------------------------
  const STORAGE_KEY = "hunt:v1:state";

  const defaultState = () => ({
    solved: [],               // stage numbers (1..6) that have been solved
    attempts: {},             // { [stageNumber]: numWrongAttempts }
    hintsShown: [],           // stages where the LOCATION hint has been revealed
    passwordHintsShown: [],   // stages where the PASSWORD hint has been revealed
    locationsConfirmed: []    // stage numbers whose location is guessed/revealed
  });
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch {
      return defaultState();
    }
  };
  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };

  let state = loadState();
  // gateUnlocked is in-memory only — the locked door always appears on fresh visits
  let gateUnlocked = false;

  // -------------------------------------------------------------------------
  //  Crypto — the master gate stays hashed (exact, never in source).
  //  `normalize` here must match what tools/hash.html uses (trim + lowercase),
  //  otherwise the gate hash won't line up.
  // -------------------------------------------------------------------------
  const normalize = (s) => String(s || "").trim().toLowerCase();
  async function sha256Hex(input) {
    const bytes = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  async function passwordMatches(input, expectedHash) {
    if (!expectedHash) return false;
    const h = await sha256Hex(normalize(input));
    return h === String(expectedHash).trim().toLowerCase();
  }

  // -------------------------------------------------------------------------
  //  Fuzzy answer matching (stage passwords)
  //  Stage answers are checked leniently: case-, space-, and accent-
  //  insensitive, with small typos forgiven. Any one of a stage's `answers`
  //  unlocks it.
  // -------------------------------------------------------------------------
  const looseNormalize = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents (saudádes → saudades)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");      // drop spaces & punctuation

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      prev = cur;
    }
    return prev[n];
  }

  // How many typos to forgive, scaled to the answer's length.
  const allowedTypos = (len) => (len <= 5 ? 1 : 2);

  function matchesAnswer(input, answers) {
    const got = looseNormalize(input);
    if (!got) return false;
    const list = Array.isArray(answers) ? answers : (answers != null ? [answers] : []);
    for (const ans of list) {
      const target = looseNormalize(ans);
      if (!target) continue;
      if (got === target) return true;
      if (levenshtein(got, target) <= allowedTypos(target.length)) return true;
    }
    return false;
  }

  // Location guessing is intentionally MORE lenient than passwords — anything
  // reasonably close counts: a partial name, a nickname, or a typo'd spelling.
  function locationGuessesFor(stage) {
    const list = [];
    if (stage.locationName) list.push(stage.locationName);
    if (Array.isArray(stage.locationAliases)) list.push(...stage.locationAliases);
    return list;
  }
  function matchesLocation(input, names) {
    const got = looseNormalize(input);
    if (got.length < 2) return false;
    for (const name of (names || [])) {
      const target = looseNormalize(name);
      if (!target) continue;
      if (got === target) return true;
      // partial match: a meaningful chunk of the name (or vice-versa)
      const shorter = got.length <= target.length ? got : target;
      const longer  = got.length <= target.length ? target : got;
      if (shorter.length >= 4 && longer.includes(shorter)) return true;
      // typo tolerance scaled to name length
      const thr = Math.max(2, Math.floor(target.length * 0.34));
      if (levenshtein(got, target) <= thr) return true;
    }
    return false;
  }

  // -------------------------------------------------------------------------
  //  DOM helpers
  // -------------------------------------------------------------------------
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const el = (tag, attrs, children) => {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c == null || c === false) continue;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      }
    }
    return node;
  };

  // -------------------------------------------------------------------------
  //  Boot — populate site text from content config
  // -------------------------------------------------------------------------
  document.title = CONTENT.site.title || "Dia dos Namorados Scavenger Hunt";
  $$("[data-title]").forEach((n) => (n.textContent = CONTENT.site.title || ""));
  $$("[data-subtitle]").forEach((n) => (n.textContent = CONTENT.site.subtitle || ""));
  $("#gate .gate__greeting").textContent = CONTENT.site.gateGreeting || "";
  $("#gate-input").setAttribute("placeholder", CONTENT.site.gatePlaceholder || "password");

  // -------------------------------------------------------------------------
  //  Floating heart particles
  // -------------------------------------------------------------------------
  function seedHearts() {
    const root = $(".hearts");
    if (!root) return;
    const glyphs = ["♡", "♥", "♡", "❥"];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "hearts__heart";
      heart.textContent = glyphs[i % glyphs.length];
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${12 + Math.random() * 18}px`;
      heart.style.animationDuration = `${18 + Math.random() * 22}s`;
      heart.style.animationDelay = `${Math.random() * 25}s`;
      heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 120}px`);
      heart.style.opacity = 0.6 + Math.random() * 0.3;
      root.appendChild(heart);
    }
  }
  seedHearts();

  // -------------------------------------------------------------------------
  //  Gate
  // -------------------------------------------------------------------------
  const gateEl   = $("#gate");
  const gateForm = $("#gate-form");
  const gateIn   = $("#gate-input");
  const gateErr  = $("#gate-error");

  function showError(message) {
    gateErr.textContent = message;
    gateErr.classList.add("is-visible");
    gateEl.classList.remove("is-shaking");
    void gateEl.offsetWidth;
    gateEl.classList.add("is-shaking");
  }
  function clearError() {
    gateErr.textContent = "";
    gateErr.classList.remove("is-visible");
  }

  gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = gateIn.value;
    if (!value) return;
    const ok = await passwordMatches(value, CONTENT.masterPasswordHash);
    if (ok) {
      gateUnlocked = true;
      clearError();
      enterApp();
    } else {
      showError(CONTENT.site.lockedMessage || "That's not it. Try again.");
      gateIn.select();
    }
  });
  gateIn.addEventListener("input", clearError);

  function enterApp() {
    gateEl.style.transition = "opacity .6s ease, transform .6s ease";
    gateEl.style.opacity = "0";
    gateEl.style.transform = "scale(0.96)";
    setTimeout(() => {
      gateEl.hidden = true;
      gateEl.style.display = "none";
      document.body.classList.remove("is-locked");
      $("#app").hidden = false;
      renderAll();
    }, 600);
  }

  // (gate is always shown on fresh visits — no auto-skip)

  // -------------------------------------------------------------------------
  //  Tab switching
  // -------------------------------------------------------------------------
  $$(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      $$(".tab").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$(".tab-panel").forEach((p) => {
        const on = p.id === `tab-${target}`;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    });
  });

  // -------------------------------------------------------------------------
  //  Reset
  // -------------------------------------------------------------------------
  $("#reset-btn").addEventListener("click", () => {
    if (!confirm("Reset all progress? You'll be sent back to the locked door.")) return;
    state = defaultState();
    saveState();
    location.reload();
  });

  // -------------------------------------------------------------------------
  //  Rendering
  // -------------------------------------------------------------------------
  function currentStageIndex() {
    // returns 0..stages.length, where stages.length means all done
    const total = CONTENT.stages.length;
    for (let i = 0; i < total; i++) {
      if (!state.solved.includes(CONTENT.stages[i].number)) return i;
    }
    return total;
  }

  // A stage's location counts as confirmed once it's been guessed/revealed or
  // the stage is fully solved.
  function isLocationConfirmed(stage) {
    return state.locationsConfirmed.includes(stage.number) ||
           state.solved.includes(stage.number);
  }

  // The heading shown for a stage: the real place name once the location is
  // confirmed, otherwise the non-revealing title.
  function displayTitleFor(stage) {
    if (isLocationConfirmed(stage) && stage.locationName) return stage.locationName;
    return stage.title || `Stage ${stage.number}`;
  }

  // Renders a "need a hint?" button that, once tapped, reveals the hint text.
  // `stateKey` is the state array tracking which stages have revealed this hint
  // (e.g. "hintsShown" for the location hint, "passwordHintsShown" for the
  // password hint), so the reveal persists across visits.
  function appendHintSection(wrap, stage, hintText, stateKey, buttonLabel) {
    if (!hintText) return;
    if (state[stateKey].includes(stage.number)) {
      wrap.appendChild(el("p", { class: "stage-card__hint" }, `hint — ${hintText}`));
      return;
    }
    const btn = el("button", { type: "button", class: "stage-card__hint-btn" },
      buttonLabel || "need a hint?");
    btn.addEventListener("click", () => {
      if (!state[stateKey].includes(stage.number)) state[stateKey].push(stage.number);
      saveState();
      renderStageCard();
    });
    wrap.appendChild(btn);
  }

  function renderStageCard() {
    const wrap = $("#stage-card");
    wrap.innerHTML = "";
    const idx = currentStageIndex();
    const total = CONTENT.stages.length;

    if (idx >= total) {
      // All stages solved — show a quiet "all done" card. The victory overlay
      // also fires on stage 6 solve, but if the user closes it, this remains.
      wrap.classList.add("stage-card--all-done");
      wrap.appendChild(el("p", { class: "stage-card__eyebrow" }, "the hunt"));
      wrap.appendChild(el("h2", { class: "stage-card__title" }, "All hearts found"));
      wrap.appendChild(el("p", { class: "stage-card__clue" },
        "You made it through every whisper. Open the victory message again whenever you like."));
      const btn = el("button", { type: "button", class: "gate__btn" }, "open the final message");
      btn.addEventListener("click", () => openVictory());
      wrap.appendChild(btn);
      return;
    }

    wrap.classList.remove("stage-card--all-done");
    const stage = CONTENT.stages[idx];

    const locationConfirmed = isLocationConfirmed(stage);

    wrap.appendChild(el("p", { class: "stage-card__eyebrow" },
      `stage ${stage.number} of ${total}`));
    wrap.appendChild(el("h2", { class: "stage-card__title" }, displayTitleFor(stage)));
    // Clue is rendered as HTML so it can include light formatting (e.g. <u>,
    // <em>, <br>) — handy for acrostics and emphasis.
    wrap.appendChild(el("p", { class: "stage-card__clue", html: stage.clue || "" }));

    function confirmLocation() {
      if (!state.locationsConfirmed.includes(stage.number)) {
        state.locationsConfirmed.push(stage.number);
      }
      saveState();
      renderStageCard();
    }

    // ---- PHASE 1: guess (or reveal) the location ------------------------
    if (!locationConfirmed) {
      const guessForm = el("form", { class: "stage-card__form", autocomplete: "off", novalidate: true });
      const guessInput = el("input", {
        type: "text",
        placeholder: "where do you think you're headed?",
        "aria-label": "Guess the location",
        autocapitalize: "off",
        autocorrect: "off",
        spellcheck: "false"
      });
      const guessBtn = el("button", { type: "submit" }, "guess");
      const guessFeedback = el("p", { class: "stage-card__feedback", "aria-live": "polite" });
      const revealBtn = el("button", { type: "button", class: "stage-card__reveal-location" }, "reveal location");

      guessForm.appendChild(guessInput);
      guessForm.appendChild(guessBtn);
      wrap.appendChild(guessForm);
      wrap.appendChild(guessFeedback);
      wrap.appendChild(revealBtn);

      // Optional nudge toward the LOCATION, revealed on tap.
      appendHintSection(wrap, stage, stage.hint, "hintsShown", "need a hint?");

      guessForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!guessInput.value) return;
        if (matchesLocation(guessInput.value, locationGuessesFor(stage))) {
          guessFeedback.textContent = "yes — that's the place. ♡";
          setTimeout(confirmLocation, 650);
        } else {
          wrap.classList.remove("is-shaking"); void wrap.offsetWidth;
          wrap.classList.add("is-shaking");
          guessFeedback.textContent = "not there. think again, or reveal it below.";
          guessInput.select();
        }
      });
      revealBtn.addEventListener("click", confirmLocation);

      setTimeout(() => guessInput.focus({ preventScroll: true }), 50);
      return;
    }

    // ---- PHASE 2: location confirmed → show banner + password field -----
    if (stage.locationName || stage.locationDetail) {
      wrap.appendChild(el("div", { class: "stage-card__location" }, [
        el("span", { class: "stage-card__location-pin", "aria-hidden": "true" }, "📍"),
        el("span", null, [
          el("span", { class: "stage-card__location-label" }, "Where to go"),
          stage.locationName ? el("span", { class: "stage-card__location-name" }, stage.locationName) : false,
          stage.locationDetail ? el("span", { class: "stage-card__location-detail" }, stage.locationDetail) : false
        ])
      ]));
    }

    const form = el("form", { class: "stage-card__form", autocomplete: "off", novalidate: true });
    const input = el("input", {
      type: "text",
      placeholder: "the password you found…",
      "aria-label": `Password for ${stage.locationName || "this stop"}`,
      autocapitalize: "off",
      autocorrect: "off",
      spellcheck: "false"
    });
    const submit = el("button", { type: "submit" }, "unlock");
    const feedback = el("p", { class: "stage-card__feedback", "aria-live": "polite" });
    form.appendChild(input);
    form.appendChild(submit);
    wrap.appendChild(form);
    wrap.appendChild(feedback);

    // "need a hint?" button for the PASSWORD. Also auto-reveals after 3 wrong
    // attempts (handled in the submit handler below).
    appendHintSection(wrap, stage, stage.passwordHint, "passwordHintsShown", "need a hint?");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!input.value) return;
      const ok = matchesAnswer(input.value, stage.answers);
      if (ok) {
        if (!state.solved.includes(stage.number)) state.solved.push(stage.number);
        state.attempts[stage.number] = 0;
        saveState();
        feedback.textContent = "yes. that's it. ♡";
        setTimeout(() => {
          renderAll();
          if (stage.isFinal) openVictory();
        }, 700);
      } else {
        state.attempts[stage.number] = (state.attempts[stage.number] || 0) + 1;
        const autoReveal = state.attempts[stage.number] >= 3 && stage.passwordHint &&
                           !state.passwordHintsShown.includes(stage.number);
        if (autoReveal) state.passwordHintsShown.push(stage.number);
        saveState();
        wrap.classList.remove("is-shaking"); void wrap.offsetWidth;
        wrap.classList.add("is-shaking");
        feedback.textContent = "not quite. listen closer.";
        if (autoReveal) {
          // re-render so the password hint appears
          setTimeout(renderStageCard, 350);
        }
        input.select();
      }
    });

    setTimeout(() => input.focus({ preventScroll: true }), 50);
  }

  function renderReveals() {
    const wrap = $("#reveals");
    wrap.innerHTML = "";
    const solvedStages = CONTENT.stages.filter((s) => state.solved.includes(s.number));
    for (const s of solvedStages) {
      if (s.isFinal || !s.reveal) continue;
      const card = el("div", { class: "reveal" });
      card.appendChild(el("div", { class: "reveal__head" }, [
        el("span", null, `stage ${s.number} — ${displayTitleFor(s)}`),
        el("span", null, "unlocked ♡")
      ]));
      card.appendChild(el("p", { class: "reveal__body" }, s.reveal));
      wrap.appendChild(card);
    }
  }

  function renderRoadmap() {
    const list = $("#roadmap");
    list.innerHTML = "";
    const currentIdx = currentStageIndex();

    CONTENT.stages.forEach((stage, i) => {
      const isDone    = state.solved.includes(stage.number);
      const isCurrent = !isDone && i === currentIdx;
      const isLocked  = !isDone && !isCurrent;

      const li = el("li", {
        class: [
          "roadmap__item",
          isDone    ? "is-done"    : "",
          isCurrent ? "is-current" : "",
          isLocked  ? "is-locked"  : ""
        ].filter(Boolean).join(" ")
      });
      li.appendChild(el("span", { class: "roadmap__num" }, isDone ? "♡" : String(stage.number)));
      li.appendChild(el("div", null, [
        el("p", { class: "roadmap__title" }, isLocked ? "—" : displayTitleFor(stage))
      ]));
      li.appendChild(el("span", { class: "roadmap__status" },
        isDone ? "found" : isCurrent ? "you are here" : "locked"));
      list.appendChild(li);
    });

    const total = CONTENT.stages.length;
    const done  = state.solved.length;
    $("#progress-count").textContent = String(done);
    $("#progress-total").textContent = String(total);
    $("#progress-fill").style.width = `${(done / total) * 100}%`;
  }

  function isItemUnlocked(item) {
    if (!item.unlockAtStage) return true;
    return state.solved.includes(Number(item.unlockAtStage));
  }

  function renderVault() {
    $("#vault-intro").textContent = CONTENT.entertainment?.intro || "";

    const audioList = $("#audio-list");
    const videoList = $("#video-list");
    audioList.innerHTML = "";
    videoList.innerHTML = "";

    const audio = CONTENT.entertainment?.audio || [];
    const videos = CONTENT.entertainment?.videos || [];

    if (audio.length === 0) {
      audioList.appendChild(el("div", { class: "media-empty" }, "no audio yet — drop files in assets/media/audio/"));
    } else {
      audio.forEach((item) => {
        if (!isItemUnlocked(item)) {
          audioList.appendChild(el("div", { class: "media-locked" },
            `something to hear — unlocks at stage ${item.unlockAtStage}`));
          return;
        }
        const card = el("div", { class: "media-card" });
        card.appendChild(el("h4", { class: "media-card__title" }, item.title || "untitled"));
        if (item.artist) card.appendChild(el("p", { class: "media-card__sub" }, item.artist));
        const a = el("audio", { controls: true, preload: "none", src: item.src });
        card.appendChild(a);
        audioList.appendChild(card);
      });
    }

    if (videos.length === 0) {
      videoList.appendChild(el("div", { class: "media-empty" }, "no video yet — drop files in assets/media/video/"));
    } else {
      videos.forEach((item) => {
        if (!isItemUnlocked(item)) {
          videoList.appendChild(el("div", { class: "media-locked" },
            `something to see — unlocks at stage ${item.unlockAtStage}`));
          return;
        }
        const card = el("div", { class: "media-card" });
        card.appendChild(el("h4", { class: "media-card__title" }, item.title || "untitled"));
        const v = el("video", { controls: true, preload: "metadata", src: item.src, playsinline: true });
        if (item.poster) v.setAttribute("poster", item.poster);
        card.appendChild(v);
        videoList.appendChild(card);
      });
    }
  }

  function renderAll() {
    renderStageCard();
    renderReveals();
    renderRoadmap();
    renderVault();
  }

  // -------------------------------------------------------------------------
  //  Victory overlay
  // -------------------------------------------------------------------------
  function openVictory() {
    const overlay = $("#victory");
    $("#victory-title").textContent     = CONTENT.victory?.title   || "You found me.";
    $("#victory-message").textContent   = CONTENT.victory?.message || "";
    $("#victory-signature").textContent = CONTENT.victory?.signature || "";

    const mediaWrap = $("#victory-media");
    mediaWrap.innerHTML = "";
    const m = CONTENT.victory?.media;
    if (m && m.src) {
      if (m.type === "video") {
        mediaWrap.appendChild(el("video", { controls: true, src: m.src, playsinline: true, preload: "metadata", poster: m.poster || "" }));
      } else if (m.type === "audio") {
        mediaWrap.appendChild(el("audio", { controls: true, src: m.src, preload: "none" }));
      } else if (m.type === "image") {
        mediaWrap.appendChild(el("img", { src: m.src, alt: m.alt || "" }));
      }
    }

    overlay.hidden = false;
    seedConfetti(overlay.querySelector(".victory__confetti"));
  }
  $("#victory-close").addEventListener("click", () => {
    $("#victory").hidden = true;
    const c = $(".victory__confetti");
    if (c) c.innerHTML = "";
  });

  function seedConfetti(root) {
    if (!root) return;
    root.innerHTML = "";
    const glyphs = ["♡", "♥", "❥", "✦"];
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement("span");
      piece.textContent = glyphs[i % glyphs.length];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.fontSize = `${14 + Math.random() * 20}px`;
      piece.style.animationDuration = `${4 + Math.random() * 5}s`;
      piece.style.animationDelay = `${Math.random() * 4}s`;
      piece.style.color = Math.random() < 0.4 ? "#ffd1e1" : "#ff7eb3";
      root.appendChild(piece);
    }
  }

  // -------------------------------------------------------------------------
  //  Countdown overlay (landing page)
  //  Floats over the locked door and counts down to the moment the hunt
  //  begins. The target carries its own timezone offset, so the math is
  //  correct regardless of the viewer's device timezone.
  // -------------------------------------------------------------------------
  const countdownEl = $("#countdown");
  let countdownTimer = null;
  const pad2 = (n) => String(n).padStart(2, "0");

  function initCountdown() {
    const cfg = CONTENT.countdown;
    if (!countdownEl) return false;
    if (!cfg || cfg.enabled === false || !cfg.target) {
      countdownEl.hidden = true;
      return false;
    }

    const target = new Date(cfg.target).getTime();
    if (isNaN(target)) {
      console.warn("countdown.target is not a valid date:", cfg.target);
      countdownEl.hidden = true;
      return false;
    }

    $("#countdown-message").textContent = cfg.message || "";
    $("#countdown-eyebrow").textContent = cfg.eyebrow || "";

    const clockEl = $("#countdown-clock");
    const readyEl = $("#countdown-ready");
    const daysEl  = $("#cd-days");
    const hoursEl = $("#cd-hours");
    const minsEl  = $("#cd-mins");
    const secsEl  = $("#cd-secs");

    let reachedReady = false;
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = "00";
        if (!reachedReady) {
          reachedReady = true;
          countdownEl.classList.add("is-ready");
          clockEl.hidden = true;
          readyEl.hidden = false;
          readyEl.textContent = cfg.readyMessage || "It's time. ♡";
        }
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      daysEl.textContent  = pad2(Math.floor(totalSec / 86400));
      hoursEl.textContent = pad2(Math.floor((totalSec % 86400) / 3600));
      minsEl.textContent  = pad2(Math.floor((totalSec % 3600) / 60));
      secsEl.textContent  = pad2(totalSec % 60);
    }

    function dismiss() {
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      countdownEl.style.transition = "opacity .5s ease";
      countdownEl.style.opacity = "0";
      setTimeout(() => {
        countdownEl.hidden = true;
        if (!gateUnlocked) $("#gate-input").focus({ preventScroll: true });
      }, 500);
    }

    // ---- Hidden bypass (for testing) -------------------------------------
    // There is intentionally NO visible button — a normal visitor cannot
    // click through. To bypass: tap/click the heart at the top 7 times in a
    // row (each tap within 1.5s of the last). Resets if you pause too long.
    const sigil = $("#countdown .countdown__sigil");
    if (sigil) {
      let taps = 0;
      let lastTap = 0;
      sigil.style.cursor = "default";
      sigil.addEventListener("click", () => {
        const now = Date.now();
        taps = (now - lastTap < 1500) ? taps + 1 : 1;
        lastTap = now;
        if (taps >= 7) { taps = 0; dismiss(); }
      });
    }

    countdownEl.hidden = false;
    tick();
    countdownTimer = setInterval(tick, 1000);
    return true;
  }

  const countdownActive = initCountdown();

  // -------------------------------------------------------------------------
  //  Initial focus on the gate input (skip while the countdown veil is up)
  // -------------------------------------------------------------------------
  if (!countdownActive) {
    setTimeout(() => $("#gate-input").focus({ preventScroll: true }), 200);
  }
})();
