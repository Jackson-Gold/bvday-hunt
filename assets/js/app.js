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

  // -------------------------------------------------------------------------
  //  Storage
  //  Stage progress persists across visits, but the master gate does NOT —
  //  the locked door appears every time, even if they've already entered.
  // -------------------------------------------------------------------------
  const STORAGE_KEY = "hunt:v1:state";

  const defaultState = () => ({
    solved: [],       // array of stage numbers (1..6) that have been solved
    attempts: {},     // { [stageNumber]: numWrongAttempts }
    hintsShown: []    // stage numbers where the hint has been revealed
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
  //  Crypto
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
    const attempts = state.attempts[stage.number] || 0;
    const hintRevealed = state.hintsShown.includes(stage.number) || attempts >= 3;

    wrap.appendChild(el("p", { class: "stage-card__eyebrow" },
      `stage ${stage.number} of ${total}`));
    wrap.appendChild(el("h2", { class: "stage-card__title" }, stage.title || `Stage ${stage.number}`));
    wrap.appendChild(el("p", { class: "stage-card__clue" }, stage.clue || ""));

    if (hintRevealed && stage.hint) {
      wrap.appendChild(el("p", { class: "stage-card__hint" }, `hint — ${stage.hint}`));
    }

    const form = el("form", { class: "stage-card__form", autocomplete: "off", novalidate: true });
    const input = el("input", {
      type: "password",
      placeholder: "the answer…",
      "aria-label": `Answer for stage ${stage.number}`,
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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!input.value) return;
      const ok = await passwordMatches(input.value, stage.passwordHash);
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
        if (state.attempts[stage.number] >= 3 && !state.hintsShown.includes(stage.number)) {
          state.hintsShown.push(stage.number);
        }
        saveState();
        wrap.classList.remove("is-shaking"); void wrap.offsetWidth;
        wrap.classList.add("is-shaking");
        feedback.textContent = "not quite. listen closer.";
        if (state.attempts[stage.number] >= 3 && stage.hint) {
          // re-render so the hint appears
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
        el("span", null, `stage ${s.number} — ${s.title || ""}`),
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
        el("p", { class: "roadmap__title" }, isLocked ? "—" : (stage.title || `Stage ${stage.number}`))
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
  //  Initial focus on the gate input
  // -------------------------------------------------------------------------
  setTimeout(() => $("#gate-input").focus({ preventScroll: true }), 200);
})();
