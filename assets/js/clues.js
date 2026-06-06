/* =============================================================================
 *  CLUES — EDIT THIS FILE FREELY
 * =============================================================================
 *
 *  This is the ONLY file you need to touch to write the clues. Edit any text
 *  between the quotes, save, and refresh the page — your changes show up
 *  immediately. (Structural stuff like the real location names, accepted
 *  passwords, and aliases lives in `content.js`; you usually won't need it.)
 *
 *  Each stop (keyed by its number, 1–6) has these pieces of text:
 *
 *    clue            — the riddle she reads first. DON'T name the place here.
 *    locationDetail  — shown under the place name once she's confirmed the
 *                      location: the exact address / what she'll see there.
 *    hint            — a gentle nudge toward the LOCATION (shown while she's
 *                      still guessing where to go).
 *    passwordHint    — a nudge toward the PASSWORD. She reveals this herself by
 *                      tapping the "need a hint?" button on the password screen.
 *                      Leave it "" to hide the hint button for that stop.
 *    reveal          — shown after she solves the stop; point her onward.
 *                      (Stop 6 has no reveal — solving it shows the victory page.)
 *
 *  Tip: to leave one blank, just use "" (empty quotes).
 * ============================================================================= */

window.HUNT_CLUES = {

  /* ---- Stop 1 · Bubs Bakery -------------------------------------------- */
  // Hidden word: the underlined + italic letters spell B-U-B-S, in order.
  1: {
    clue:
      "<u><em>B</em></u>egin where your day should: somewhere warm that smells " +
      "like sugar and fresh bread — the spot known for swirls of cinnamon, " +
      "where yo<u><em>u</em></u>r favorite sweet treat is waiting! Go gra<u><em>b</em></u> it, " +
      "and don't forget to pick up what's been left for you at the front, my <u><em>s</em></u>weet." +
      "You may need to use google maps to find the name of the place. The password you're looking for is the name of the treat that is in your bag!",

    locationDetail: "Bub's Bakery, 325 Lafayette Street, New York, NY 10012",
    hint: "A bakery near by with a yellow awning",
    passwordHint: "Read the underlined letters — and the password is simply the name of the treat in your bag.",
    reveal: "Some lovely cinnamon rolls waiting for my lovely girl. I hope this fuels you for your next stops!"
  },

  /* ---- Stop 2 · Balade ------------------------------------------------- */
  2: {
    clue:
      "Next, head further uptown, closer to your old place to a spot near and dear to your and my heart." +
      "You next stop is where we had our first start." +
      "While I hope its not raining when you go this time, I am so glad it did on our first visit because it helped make you mine."+
      "Look for you passowrd on a wooden doorframe a few buildings south (the way you're coming) from this place.",
    locationDetail:  "Balade, 208 1st Ave, New York, NY 10009, United States",
    hint: "Look for the wood doorframe between the L-Train and the Brodo, its towards the bottom on the right side of the doorframe",
    passwordHint: "PLACEHOLDER — optional nudge toward the password.",
    reveal: "Great job! I hope your memory of this place is a font as mine! Onto the next stop!"
  },

  /* ---- Stop 3 · Aum Shanti Bookshop ----------------------------------- */
  3: {
    clue:
      "Now find a quiet place full of incense and crystals, where the tarot " +
      "readers fill the room and the shelves hum with great energy. Your favorite place to get readings and my favorite to get crystals!" +
      "There you will find a spirit guide know to help you overcome fears as you leap into new territories" +
      "The password you're looking for is the name of the spirit guide waiting for you behind the counter or the crystal with it!",
    locationDetail: "Aum Shanti Bookshop, 230 E 14th St, New York, NY 10003, United States",
    hint: "PLACEHOLDER — optional gentle nudge toward the location.",
    passwordHint: "A more formal name for the animal you have next to my name in your contacts",
    reveal: "After you so generously gave me your amythist I thougt it was only fair to give you another one!"
  },

  /* ---- Stop 4 · Washington Square Park --------------------------------- */
  4: {
    clue:
      "Time for some fresh air. Head to the famous square with the grand arch " +
      "and the fountain at its heart, where students gather and the city comes " +
      "to people-watch. Meet me under the arch for a kiss.",
    locationDetail: "PLACEHOLDER — the exact spot (the arch? the fountain?).",
    hint: "PLACEHOLDER — optional gentle nudge toward the location.",
    passwordHint: "PLACEHOLDER — optional nudge toward the password.",
    reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
  },

  /* ---- Stop 5 · McNally Jackson Books ---------------------------------- */
  5: {
    clue:
      "Back to the world of books, but a bigger one this time — a beloved " +
      "bookstore where you could lose hours among the shelves. Find a quiet " +
      "corner there and whisper what I always call you.",
    locationDetail: "PLACEHOLDER — exact address / which location.",
    hint: "PLACEHOLDER — optional gentle nudge toward the location.",
    passwordHint: "PLACEHOLDER — optional nudge toward the password.",
    reveal: "PLACEHOLDER — what she discovers here, and a hint toward the next stop."
  },

  /* ---- Stop 6 · Pier 25 Minigolf (FINAL) ------------------------------- */
  6: {
    clue:
      "Last stop — out to the water's edge, to a pier on the river where you " +
      "can putt a little ball through windmills and tunnels. Meet me there for " +
      "one more game, and you'll find me at the end of it.",
    locationDetail: "PLACEHOLDER — the exact spot she should reach.",
    hint: "PLACEHOLDER — optional gentle nudge toward the location.",
    passwordHint: "PLACEHOLDER — optional nudge toward the password.",
    reveal: "" // no reveal — solving stop 6 triggers the victory page
  }

};
