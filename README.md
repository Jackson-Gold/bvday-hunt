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
- The master password
- Each of the six stages (title, clue, hint, password, reveal text)
- The victory page (title, message, signature, optional finale media)
- The entertainment vault (audio and video items)

### Generating password hashes

Passwords are stored as SHA-256 hashes so they aren't readable in your repo. To generate a hash:

1. Open **`tools/hash.html`** in any browser (locally, or after deploy at `https://<your-user>.github.io/<repo>/tools/hash.html`).
2. Type your password — the hash appears instantly.
3. Click "copy hash" and paste it into the matching `passwordHash` (or `masterPasswordHash`) in `assets/js/content.js`.

Passwords are normalized (trimmed and lowercased) before hashing on both ends, so the person solving doesn't have to worry about exact casing or stray spaces.

### Adding media

Drop files into:

- `assets/media/audio/` — for MP3 / M4A / WAV / OGG
- `assets/media/video/` — for MP4 / WebM (MP4/H.264 is most compatible)

Then add them in the `entertainment` section of `content.js`:

```js
audio: [
  { title: "Our song", artist: "the band", src: "assets/media/audio/our-song.mp3" }
],
videos: [
  { title: "A memory", src: "assets/media/video/memory.mp4", unlockAtStage: 3 }
]
```

The optional `unlockAtStage` field hides the item until that stage is solved.

> GitHub has a soft 100 MB per-file limit and a recommended 1 GB repo limit. For large videos, consider compressing them (handbrake, ffmpeg) or hosting on YouTube/Vimeo and embedding via a custom iframe.

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
│   │   ├── content.js      # ← EDIT THIS to customize the hunt
│   │   └── app.js          # app logic (no need to edit)
│   └── media/
│       ├── audio/          # drop audio files here
│       └── video/          # drop video files here
├── tools/
│   └── hash.html           # SHA-256 password hash generator
├── .github/workflows/
│   └── pages.yml           # auto-deploy to GitHub Pages
├── .nojekyll               # tell Pages not to run Jekyll
└── README.md
```

made with love ♡
