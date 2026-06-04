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
   *  THE SIX STAGES (the real stops)
   *
   *  The location is NOT given away. For each stop she sees the clue, then
   *  either guesses the location or taps "reveal location". Once confirmed,
   *  the "Where to go" banner and the password field appear.
   *
   *  Each stage has:
   *    title           — a non-revealing heading (don't put the place here)
   *    locationName    — the real place. Used for guess-matching AND shown in
   *                      the "Where to go" banner once confirmed.
   *    locationAliases — optional extra spellings/nicknames accepted as a
   *                      correct guess. Guessing is very lenient (anything
   *                      close — partial names, typos — counts), so these are
   *                      just for safety.
   *    locationDetail  — optional address / landmark shown under the place
   *                      name once confirmed.
   *    clue            — your riddle that leads her there (don't name it)
   *    hint            — optional; appears after 3 wrong password attempts
   *    answers         — the password(s) she'll find AT the location. ANY one
   *                      unlocks the stage. Matching ignores case, spaces, and
   *                      accents and forgives small typos.
   *    reveal          — shown after solving (point her toward the next stop)
   *
   *  Stage 6 is the FINAL stage and triggers the victory page.
   * --------------------------------------------------------------------- */
  stages: [
    {
      number: 1,
      title: "The First Stop",
      locationName: "Bubs Bakery",
      locationAliases: ["bubs", "bubs bakery"],
      locationDetail: "PLACEHOLDER — exact address / what she'll see when she's there.",
      clue: "PLACEHOLDER — your riddle that leads her to Bubs Bakery (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      answers: ["cinnamon roll", "roll"],
      reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
    },
    {
      number: 2,
      title: "The Second Stop",
      locationName: "Balade",
      locationAliases: ["balade"],
      locationDetail: "PLACEHOLDER — exact address / what she'll see when she's there.",
      clue: "PLACEHOLDER — your riddle that leads her to Balade (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      answers: ["lebanese"],
      reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
    },
    {
      number: 3,
      title: "The Third Stop",
      locationName: "Aum Shanti Bookshop",
      locationAliases: ["aum shanti", "aum shanti bookshop", "aum shanti book shop"],
      locationDetail: "PLACEHOLDER — exact address / what she'll see when she's there.",
      clue: "PLACEHOLDER — your riddle that leads her to Aum Shanti Bookshop (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      answers: ["amethyst", "rabbit", "bunny"],
      reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
    },
    {
      number: 4,
      title: "The Fourth Stop",
      locationName: "Washington Square Park",
      locationAliases: ["washington square park", "washington square", "wsp", "the park"],
      locationDetail: "PLACEHOLDER — the exact spot (the arch? the fountain?).",
      clue: "PLACEHOLDER — your riddle that leads her to Washington Square Park (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      answers: ["kiss"],
      reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
    },
    {
      number: 5,
      title: "The Fifth Stop",
      locationName: "McNally Jackson Books",
      locationAliases: ["mcnally jackson", "mcnally jackson books", "mcnally", "mcnallys"],
      locationDetail: "PLACEHOLDER — exact address / which location.",
      clue: "PLACEHOLDER — your riddle that leads her to McNally Jackson (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      // NOTE: you wrote "Men amor" — I assumed the Portuguese "meu amor".
      // Both are accepted; remove either if you like.
      answers: ["meu amor", "men amor"],
      reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
    },
    {
      number: 6,
      title: "The Final Stop",
      locationName: "Pier 25 Minigolf",
      locationAliases: ["pier 25", "pier 25 minigolf", "pier 25 mini golf", "minigolf", "mini golf"],
      locationDetail: "PLACEHOLDER — the exact spot she should reach.",
      clue: "PLACEHOLDER — your riddle that leads her to Pier 25 minigolf (don't name it outright).",
      hint: "PLACEHOLDER — optional gentle nudge.",
      answers: ["saudades"],
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
