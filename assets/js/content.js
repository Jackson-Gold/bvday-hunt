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
   *  INSTRUCTIONS PAGE ("Start Here" tab)
   *  The first thing she sees after unlocking the door. She can return to it
   *  any time via the tab, and tap the button to jump into the hunt.
   *  Edit any of the text below.
   * --------------------------------------------------------------------- */
  instructions: {
    eyebrow: "how it works",
    title: "Welcome, meu amor",
    intro: "I made you a little adventure. Here's how to play — come back to this page anytime you need it.",
    steps: [
      { icon: "✦", text: "Each stop opens with a clue. Read it, then guess where you think you're headed — or tap reveal location if you'd rather just be told." },
      { icon: "📍", text: "Once the place is confirmed, a “Where to go” banner shows the spot. Make your way there." },
      { icon: "🔑", text: "At each location you'll find a password. Most of them are in the same format as the card you have, tap your phone to it and you will see the password. Type it in to unlock the stop and reveal where to go next." },
      { icon: "💡", text: "Stuck? Tap “need a hint?” for a nudge — a hint also appears on its own after a few wrong tries." },
      { icon: "♫", text: "Check out the Entertainment tab for a playlist and a folder of memories to keep you company on the way." },
      { icon: "♡", text: "There is an intro vide you should watch before you start under the entertainment button. Everything is actually hidden in public around the city so something may go wrong. There is a doc of all the passwords and exactly what should happen if something goes wrong." }
    ],
    note: "Your progress saves automatically, so you can close this and pick up right where you left off.",
    buttonLabel: "Begin the hunt ♡",

    // Optional: a Google Drive folder of instructional videos, embedded on this
    // page (between the steps and the note). Encrypted with the master password,
    // just like the entertainment links — change it via tools/secrets.html.
    // NOTE: the folder must be shared "Anyone with the link can view" for the
    // preview grid to appear.
    videos: {
      title: "Watch these first",
      blurb: "A few short videos walking you through it.",
      enc: "v1.wIY2SDlDMzrWY4+kFiYo2g==.V8gph/f9R8sODS7D.d3zZrcHCNpioJPGHt0uIummLXRkQ00FGfEvGtHC8haLEUF1+0+7cKwrOu57nXGic7UbkEaK1ZYKenuZEjFZmgu+FCItX7dmExHt7uenuB31rAQf0pzEDoQ=="
    }
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
   *  >>> THE CLUE TEXT LIVES IN `assets/js/clues.js` <<<
   *  Edit that file to write the clue, hint, location detail, and reveal for
   *  each stop. This file just holds the structural bits below.
   *
   *  The location is NOT given away. For each stop she sees the clue, then
   *  either guesses the location or taps "reveal location". Once confirmed,
   *  the "Where to go" banner and the password field appear, and the stop's
   *  title becomes the real place name everywhere it shows.
   *
   *  Each stage has:
   *    title           — a non-revealing heading shown BEFORE the location is
   *                      confirmed (don't put the place here)
   *    locationName    — the real place. Used for guess-matching, shown in the
   *                      "Where to go" banner, and becomes the title once the
   *                      location is guessed or revealed.
   *    locationAliases — optional extra spellings/nicknames accepted as a
   *                      correct guess. Guessing is very lenient (anything
   *                      close — partial names, typos — counts), so these are
   *                      just for safety.
   *    answers         — the password(s) she'll find AT the location. ANY one
   *                      unlocks the stage. Matching ignores case, spaces, and
   *                      accents and forgives small typos.
   *
   *  (The clue / hint / locationDetail / reveal TEXT is in clues.js.)
   *
   *  Stage 6 is the FINAL stage and triggers the victory page.
   * --------------------------------------------------------------------- */
  stages: [
    {
      number: 1,
      title: "The First Stop",
      locationName: "Bubs Bakery",
      locationAliases: ["bubs", "bubs bakery"],
      answers: ["cinnamon roll", "roll"]
    },
    {
      number: 2,
      title: "The Second Stop",
      locationName: "Balade",
      locationAliases: ["balade"],
      answers: ["lebanese"]
    },
    {
      number: 3,
      title: "The Third Stop",
      locationName: "Aum Shanti Bookshop",
      locationAliases: ["aum shanti", "aum shanti bookshop", "aum shanti book shop"],
      answers: ["amethyst", "rabbit", "bunny"]
    },
    {
      number: 4,
      title: "The Fourth Stop",
      locationName: "Washington Square Park",
      locationAliases: ["washington square park", "washington square", "wsp", "the park"],
      answers: ["kiss"]
    },
    {
      number: 5,
      title: "The Fifth Stop",
      locationName: "McNally Jackson Books",
      locationAliases: ["mcnally jackson", "mcnally jackson books", "mcnally", "mcnallys"],
      // NOTE: you wrote "Men amor" — I assumed the Portuguese "meu amor".
      // Both are accepted; remove either if you like.
      answers: ["meu amor", "men amor"]
    },
    {
      number: 6,
      title: "The Final Stop",
      locationName: "Pier 25 Minigolf",
      locationAliases: ["pier 25", "pier 25 minigolf", "pier 25 mini golf", "minigolf", "mini golf"],
      answers: ["saudades"],
      isFinal: true
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
   *
   *  Instead of uploading lots of media to the repo, this links out to a
   *  Spotify playlist and a Google Drive folder. Both links are ENCRYPTED with
   *  the master password, so the real URLs never appear in the source code —
   *  someone browsing the GitHub repo can't grab them. They're decrypted in the
   *  browser only after she unlocks the gate (the master password is the key,
   *  and only its hash — not the password itself — lives in this file).
   *
   *  >>> HOW TO CHANGE THESE LINKS <<<
   *  Open `tools/secrets.html`, type your MASTER password, paste the new URL,
   *  and copy the encrypted blob it gives you into `enc` below. If you ever
   *  change the master password, re-encrypt BOTH links the same way.
   * --------------------------------------------------------------------- */
  entertainment: {
    intro: "A playlist for the road and a folder of little memories. Press play, and peek whenever you need a smile.",

    // Spotify playlist — shows as an embedded player on the site.
    spotify: {
      title: "Our playlist",
      blurb: "Songs for you to walk to.",
      enc: "v1.WPIa7GkKBM6VU7GO/HWZUA==.Jt3ENLtc66ueP5Hc.bI9SRwGss/yJ4b7YNU1GW3AlWY2yI3TXoDc+pyRbZRNSJmqgjo1fBQbnT7LXkiEuEGIpU9FAx8hjIe1fLk9Q5qKtsOO7FnAgLf2zSBOPZcpK/LUaCB5f8aysk2j2dyim1f8TulV+jUQMNoQjt4sL7CPLIOLFKMID2YoP55Tgm9kEwoCJ8HVJtrhusXszu4umrfKL018ZMQ=="
      // unlockAtStage: 1   // optional: hide until this stage is solved
    },

    // Google Drive folder — shows an embedded preview grid + an "open" button.
    drive: {
      title: "Our little vault",
      blurb: "Photos and videos, just for us.",
      enc: "v1.d1OKeS9wfhbwvLOK6S5ufA==.jEoxqQiyS6lCfkau.9jE5FRvqcanUT2eaUo+6qGyp9IPwkh8PgY1qKDuFsDhdUx+1gOR7Uv9KZWeqmXzvcd3wVQepNqLtqGx3zNafGLRpbBYB0j0TwYMoKv/Hhy6I6hBpanpUfA=="
      // unlockAtStage: 1   // optional: hide until this stage is solved
    }
  }
};
