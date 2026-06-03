/* =============================================================================
 *  HUNT CONTENT — EDIT THIS FILE TO CUSTOMIZE YOUR SCAVENGER HUNT
 * =============================================================================
 *
 *  Everything you need to personalize lives in this file. The rest of the app
 *  (HTML/CSS/JS) reads from here, so you should never need to touch the other
 *  files unless you want to change the visual design.
 *
 *  HOW TO GENERATE PASSWORD HASHES
 *  -------------------------------
 *  Passwords are stored as SHA-256 hashes so they aren't readable in the
 *  source. Open `tools/hash.html` in a browser (locally or on the deployed
 *  site), type a password, and copy the hash it gives you into the fields
 *  marked PASSWORD_HASH below.
 *
 *  DEFAULT TEST PASSWORDS (replace before sharing the site!)
 *  ---------------------------------------------------------
 *    Master gate ........ love
 *    Stage 1 ............ stage1
 *    Stage 2 ............ stage2
 *    Stage 3 ............ stage3
 *    Stage 4 ............ stage4
 *    Stage 5 ............ stage5
 *    Stage 6 ............ stage6
 *
 *  MEDIA FILES
 *  -----------
 *  Drop audio files in `assets/media/audio/` and videos in `assets/media/video/`,
 *  then reference them in the `entertainment` section below.
 * ============================================================================= */

window.HUNT_CONTENT = {

  /* -----------------------------------------------------------------------
   *  SITE METADATA
   * --------------------------------------------------------------------- */
  site: {
    title: "Dia dos Namorados Scavenger Hunt",
    subtitle: "for the one I love",
    gateGreeting: "A secret door. A whispered word. Speak it, and step in.",
    gatePlaceholder: "the word that lets you in…",
    lockedMessage: "Not quite. Listen closer to your heart.",
  },

  /* -----------------------------------------------------------------------
   *  COUNTDOWN OVERLAY (shown on the landing page)
   *  A translucent overlay that floats over the locked door and counts down
   *  to the moment the hunt begins.
   *
   *  `target` is an ISO 8601 timestamp WITH an explicit timezone offset, so
   *  the countdown is correct no matter where the viewer is. Eastern Time in
   *  June is EDT (UTC-04:00), so noon on June 12th is written as
   *  "2026-06-12T12:00:00-04:00".
   * --------------------------------------------------------------------- */
  countdown: {
    enabled: true,
    target: "2026-06-12T12:00:00-04:00",
    eyebrow: "until it begins",
    // Shown once the countdown reaches zero
    readyMessage: "It's time, meu amor. Step inside. ♡",
    message:
      "Hey meu amor,\n\n" +
      "I bet you're wondering what this is and why a playing card in your bag led you here. " +
      "Well that's a great question, and it will all become clear. " +
      "I hope you like the surprise! Miss you so much! Love you!\n\n" +
      "Yours,\nJackson",
  },

  /* -----------------------------------------------------------------------
   *  MASTER GATE PASSWORD
   *  This is the password required to ENTER the site at all.
   *  Default plaintext: "love"
   * --------------------------------------------------------------------- */
  masterPasswordHash: "686f746a95b6f836d7d70567c302c3f9ebb5ee0def3d1220ee9d4e9f34f5e131",

  /* -----------------------------------------------------------------------
   *  THE SIX STAGES
   *  Each stage has a clue (shown before solving), a password (hashed), and
   *  a reveal (shown after solving — usually the next clue or location).
   *  Stage 6 is the FINAL stage and triggers the victory page.
   * --------------------------------------------------------------------- */
  stages: [
    {
      number: 1,
      title: "The First Whisper",
      // Shown when this stage is the current one
      clue: "PLACEHOLDER — write your first clue here. A riddle, a location, an inside joke. Something only they would know.",
      // Hint appears after 3 wrong attempts
      hint: "PLACEHOLDER — a gentle nudge in the right direction.",
      // SHA-256 of the answer. Default plaintext: "stage1"
      passwordHash: "ef24c98b6f6843d9d586189733598c533de9fa109464aa1d7045c667a4621b0f",
      // Shown once they unlock this stage — typically points to where stage 2 lives
      reveal: "PLACEHOLDER — what they discover for solving stage 1. A memory, a photo caption, instructions for where to physically go next."
    },
    {
      number: 2,
      title: "The Second Heartbeat",
      clue: "PLACEHOLDER — your second clue goes here.",
      hint: "PLACEHOLDER — optional hint for stage 2.",
      // Default plaintext: "stage2"
      passwordHash: "5e585fd3fab5cb85a941179b4df835cef988f0281af9f47878024f539c302df5",
      reveal: "PLACEHOLDER — reveal text for stage 2."
    },
    {
      number: 3,
      title: "The Hidden Verse",
      clue: "PLACEHOLDER — your third clue goes here.",
      hint: "PLACEHOLDER — optional hint for stage 3.",
      // Default plaintext: "stage3"
      passwordHash: "1d1444f304d444a21b68e0d07f873bb024d5545820b6df946923956bd86b0826",
      reveal: "PLACEHOLDER — reveal text for stage 3."
    },
    {
      number: 4,
      title: "The Quiet Trail",
      clue: "PLACEHOLDER — your fourth clue goes here.",
      hint: "PLACEHOLDER — optional hint for stage 4.",
      // Default plaintext: "stage4"
      passwordHash: "f0a2f992de07a18a5e405328f42a5aa40c15470874bca6708f4d92190aaa9556",
      reveal: "PLACEHOLDER — reveal text for stage 4."
    },
    {
      number: 5,
      title: "The Final Approach",
      clue: "PLACEHOLDER — your fifth clue goes here.",
      hint: "PLACEHOLDER — optional hint for stage 5.",
      // Default plaintext: "stage5"
      passwordHash: "65c8f9120c5164b07c7500563cde3e0984d838bf7308df576a7519989b51d433",
      reveal: "PLACEHOLDER — reveal text for stage 5. Hint at what's coming."
    },
    {
      number: 6,
      title: "The Heart's Resting Place",
      clue: "PLACEHOLDER — your sixth and final clue.",
      hint: "PLACEHOLDER — optional hint for the final stage.",
      // Default plaintext: "stage6"
      passwordHash: "e70045a5cc2d5c62af70e8edc9b03ab2d7abf14fd1ce3b734a98b099059c1758",
      isFinal: true
      // (no `reveal` — solving stage 6 triggers the victory page below)
    }
  ],

  /* -----------------------------------------------------------------------
   *  VICTORY PAGE
   *  Shown when stage 6 is solved. Can include an optional media reveal.
   * --------------------------------------------------------------------- */
  victory: {
    title: "You found me.",
    message: "PLACEHOLDER — your victory message. The big one. Tell them everything you've been wanting to say. This is the heart of the hunt.",
    signature: "— yours, always",
    // Optional finale media (set to null to skip). Examples:
    //   { type: "video", src: "assets/media/video/finale.mp4", poster: "" }
    //   { type: "audio", src: "assets/media/audio/finale.mp3" }
    //   { type: "image", src: "assets/media/finale.jpg", alt: "us" }
    media: null
  },

  /* -----------------------------------------------------------------------
   *  ENTERTAINMENT SECTION
   *  Audio + video to play while on the hunt. Available after the master
   *  gate. Optionally, set `unlockAtStage` on any item to keep it hidden
   *  until that stage is solved (1–6). Leave it out to show immediately.
   * --------------------------------------------------------------------- */
  entertainment: {
    intro: "Soundtrack and little memories for the road. Press play whenever you need a smile.",

    audio: [
      {
        title: "PLACEHOLDER — a song for you",
        artist: "PLACEHOLDER — artist or 'me'",
        src: "assets/media/audio/track-1.mp3"
        // unlockAtStage: 2
      },
      {
        title: "PLACEHOLDER — a voice note",
        artist: "from me",
        src: "assets/media/audio/track-2.mp3"
      }
    ],

    videos: [
      {
        title: "PLACEHOLDER — a memory in motion",
        src: "assets/media/video/clip-1.mp4",
        poster: "" // optional thumbnail path
        // unlockAtStage: 3
      }
    ]
  }
};
