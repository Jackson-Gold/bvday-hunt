# Dia dos Namorados Scavenger Hunt

A static, password-gated scavenger hunt site for a loved one. Six progressive stages, a roadmap, an entertainment vault for music & video, and a victory finale. Designed for GitHub Pages — auto-deploys via GitHub Actions on every push.

- Locked entry behind a master password
- Six stages, each unlocked by its own password
- Stage 6 triggers a victory page with an optional finale media reveal
- Roadmap that shows progress (1 of 6, 2 of 6, …)
- Entertainment "vault" of audio + video, with optional per-stage unlocking
- Progress persisted in the browser (localStorage)
- All passwords stored as SHA-256 hashes — never in plaintext

## Quick start

```bash
# 1. Open the site locally to test (any static server works)
cd "BVday Scavenger Hunt"
python3 -m http.server 8000
# then visit http://localhost:8000
```

With everything still at defaults, the test passwords are:

| Gate    | Password |
| ------- | -------- |
| Master  | `love`   |
| Stage 1 | `stage1` |
| Stage 2 | `stage2` |
| Stage 3 | `stage3` |
| Stage 4 | `stage4` |
| Stage 5 | `stage5` |
| Stage 6 | `stage6` |

Replace these before sharing the site! See below.

## How to customize

All content lives in **`assets/js/content.js`**. Open it — every spot you should edit is marked `PLACEHOLDER`. You can change:

- The site title, subtitle, and the greeting on the locked door
- The master password (the word that gets her into the site)
- Each of the six stops (title, location, clue, hint, accepted passwords, reveal text)
- The victory page (title, message, signature, optional finale media)
- The entertainment vault (audio and video items)

### The stops and their passwords

Each stage represents a real stop, and the location is hidden until she guesses or reveals it. The important fields:

```js
{
  number: 1,
  title: "The First Stop",                 // non-revealing heading
  locationName: "Bubs Bakery",             // the place (guess target + banner)
  locationAliases: ["bubs", "bubs bakery"],// optional extra accepted guesses
  locationDetail: "123 Main St (pink awning)", // optional, shown after confirm
  clue: "Your riddle that leads her there (don't name it outright).",
  hint: "Optional nudge, shown after 3 wrong password tries.",
  answers: ["cinnamon roll", "roll"],      // ANY one of these unlocks it
  reveal: "What she finds here / where to go next."
}
```

How a stop plays out:

1. She sees the **clue** plus a **"where do you think you're headed?"** guess field and a **reveal location** button.
2. If she guesses the place (matching is very lenient — partial names, nicknames, and typos all count) **or** taps reveal, the **📍 Where to go** banner appears with `locationName` and `locationDetail`.
3. She walks there, finds the password, and enters it in the **unlock** field that appears with the banner.

Notes:

- **Guessing the location is lenient on purpose** — "washington square", "the park", "minigolf", or a typo'd "bubs bakary" all pass. Add `locationAliases` only if you want to be extra safe.
- **`answers`** is a list; any one unlocks the stage. Matching is **case-, space-, and accent-insensitive and tolerates small typos**, so "Cinnamon Roll", "cinnamonroll", and "cinamon roll" all work.
- Upcoming stops never show their name on the Map, and the heading (`title`) is deliberately generic, so locations stay a surprise until she reaches them.

### The master password (still hashed)

Only the **site entry** password is hashed (so it isn't readable in source). To change it:

1. Open **`tools/hash.html`** in any browser (locally, or after deploy at `https://<your-user>.github.io/<repo>/tools/hash.html`).
2. Type your password — the hash appears instantly.
3. Click "copy hash" and paste it into `masterPasswordHash` in `assets/js/content.js`.

> Why aren't the stage passwords hashed? Forgiving typos requires comparing the typed text to the real word, which a one-way hash can't do. The stop names and clues already live in `content.js` in plain text, so the hunt's secrecy comes from the physical experience — don't put anything you need truly hidden into the clues.

### The entertainment vault (Spotify + Google Drive)

Rather than uploading lots of media to the repo, the vault links out to a **Spotify playlist** (shown as an embedded player) and a **Google Drive folder** (shown as an embedded preview grid plus an "open" button). Both links are **encrypted with the master password**, so the real URLs never appear in the source — someone browsing the repo can't grab them. They're decrypted in the browser only after she unlocks the gate (the master password is the decryption key, and only its hash lives in the source).

They're configured in the `entertainment` section of `content.js`:

```js
entertainment: {
  intro: "A playlist for the road and a folder of little memories.",
  spotify: { title: "Our playlist",  blurb: "Songs for you.",      enc: "v1.…" },
  drive:   { title: "Our little vault", blurb: "Photos & videos.",  enc: "v1.…" }
}
```

**To change a link** (or after changing the master password):

1. Open **`tools/secrets.html`** in any browser (locally, or at `https://<your-user>.github.io/<repo>/tools/secrets.html`).
2. Type your **master password** and paste the new Spotify/Drive URL.
3. Copy the encrypted `v1.…` blob it produces into the matching `enc` field in `content.js`.

> ⚠️ If you change the master password, you must re-encrypt **every** vault link with the new password, or they won't open on the site.

Notes:

- Add an optional `unlockAtStage: 3` to either item to keep it hidden until that stage is solved.
- For the Drive **preview grid** to show, the folder must be shared "Anyone with the link." The encryption keeps the link out of the repo, but anyone she shares her screen/device with can still open it — that's the intended audience.
- Spotify/Drive embeds require an internet connection (they won't appear when viewing the page fully offline).

## Deploying to GitHub Pages

The `.github/workflows/pages.yml` workflow auto-deploys on every push to `main`. **You must enable GitHub Pages in repo settings once before the first deploy will succeed** — otherwise the workflow fails with `Resource not accessible by integration` because the workflow's `GITHUB_TOKEN` can't create the Pages site on its own.

### One-time setup

1. **Create a new GitHub repo.** Public is recommended (private repos need a paid GitHub plan to use Pages). Don't initialize with a README, license, or .gitignore — we already have those.
2. **Enable Pages with GitHub Actions as the source.** This is the critical step:
   - Go to your new repo on GitHub
   - **Settings → Pages** (left sidebar, under "Code and automation")
   - Under **Build and deployment**, set **Source** to **GitHub Actions**
   - You don't need to pick a workflow — just changing the source is enough
3. **Push your code:**

```bash
cd "BVday Scavenger Hunt"
git init
git add .
git commit -m "Initial hunt"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

After ~30 seconds the workflow finishes and the site is live at `https://<your-user>.github.io/<your-repo>/`. Watch progress under the **Actions** tab.

Every subsequent `git push origin main` redeploys automatically.

### If the deploy fails

- **`Resource not accessible by integration`** → You haven't enabled Pages with GitHub Actions yet. Do step 2 above, then re-run the failed workflow from the Actions tab.
- **`Get Pages site failed`** → Same root cause. Pages isn't enabled. Go to Settings → Pages and pick **GitHub Actions** as the source.
- **404 after deploy** → Wait a minute and hard-refresh; first-time DNS for `.github.io` can lag.

## Security note

This is a static site — anyone with the URL can download the source, inspect the JS, and see the SHA-256 hashes. They can't read the plaintext passwords from those hashes (SHA-256 is one-way), but they could:

- Brute-force short or common passwords
- See the *list* of clue/reveal texts that aren't password-gated (everything in `content.js` is visible)

For a romantic scavenger hunt this is totally fine, but **don't put anything secret in the clues themselves** — only the *answers* are protected. If you want to fully hide future clues until earlier stages are solved, you'd want stage content encrypted with each stage's password as the key (let me know and we can swap to that model).

## File layout

```
.
├── index.html              # main page (gate + app + victory overlay)
├── assets/
│   ├── css/style.css       # midnight + rose pink theme
│   ├── js/
│   │   ├── content.js      # ← structural config (passwords, locations, vault)
│   │   ├── clues.js        # ← EDIT THIS for clue / hint / reveal text
│   │   └── app.js          # app logic (no need to edit)
│   └── media/
│       └── …               # optional local files (e.g. victory finale)
├── tools/
│   ├── hash.html           # SHA-256 password hash generator (master password)
│   └── secrets.html        # encrypt Spotify / Drive vault links
├── .github/workflows/
│   └── pages.yml           # auto-deploy to GitHub Pages
├── .nojekyll               # tell Pages not to run Jekyll
└── README.md
```

made with love ♡
