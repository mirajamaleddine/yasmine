# Rami &amp; Yasmeen — Wedding RSVP Site

A single-page, hand-illustrated wedding site with a per-invitation RSVP, song
requests, location, and gift details. Plain HTML/CSS/JS — **no build step, no
backend, free to host**. RSVPs are collected by **Netlify Forms**.

---

## What's in here

```
wedding-site/
├── index.html          ← the page
├── css/styles.css      ← all styling + animations
├── js/script.js        ← RSVP logic, Netlify submit, petals/critters
├── data/guests.json    ← YOUR GUEST LIST (edit this)
├── images/             ← illustrations (placeholders for now — see images/IMAGES.md)
├── netlify.toml        ← Netlify config
└── README.md           ← this file
```

---

## 1. Add the real illustrations

Open `images/IMAGES.md` and drop each real PNG in, keeping the same filenames.
No code changes needed.

---

## 2. Edit your guest list (`data/guests.json`)

Each entry is **one invitation**. A family/group is one entry with several
members; a single guest is one entry with one member.

```json
{
  "diba": {
    "title": "The Diba Family",
    "members": ["Ghassan Diba", "Nadia Naji", "Ahmad Diba", "Ayman Diba", "Lana Diba"]
  },
  "amal": {
    "title": "Amal Sidani",
    "members": ["Amal Sidani"]
  }
}
```

- The **key** (`"diba"`) is the invite code. Keep it short & lowercase.
- `title` is the greeting shown at the top of their RSVP card.
- `members` is everyone on that invitation — each gets their own Accept/Decline.

### How guests reach their own list
Send each invitation a personal link:

```
https://YOUR-SITE.netlify.app/?c=diba
https://YOUR-SITE.netlify.app/?c=amal
```

The page reads the code, greets them, and shows only **their** people.
If someone opens the site with no code (or a wrong one), they get a friendly
box to type their code in. (Tip: put the code on the paper/physical invite.)

---

## 3. Deploy to Netlify (free, ~5 minutes)

**Easiest — drag & drop:**
1. Go to https://app.netlify.com/drop
2. Drag the **`wedding-site` folder** onto the page.
3. Done — you get a live URL like `random-name-123.netlify.app`.
4. Rename it: **Site configuration → Change site name** →
   e.g. `rami-and-yasmeen` → `rami-and-yasmeen.netlify.app`.

**Or connect GitHub (auto-updates when you push):**
1. Push this folder to a GitHub repo (see section 5).
2. Netlify → **Add new site → Import from GitHub** → pick the repo.
3. Build command: *(leave blank)*  ·  Publish directory: `.`
4. Deploy.

---

## 4. Where the RSVPs land

After deploying, every confirmed RSVP appears in:
**Netlify dashboard → your site → Forms → `rsvp`.**

Each submission shows: invite code, party title, each person's reply, and the
song request. You can:
- Turn on **email notifications**: Forms → Settings → Form notifications.
- **Export to CSV** any time from the Forms page.

Free tier = **100 submissions/month**, plenty for a wedding. (One invitation =
one submission, even for a big family.)

> ⚠️ Forms only work on the **live Netlify site**, not when you open
> `index.html` from your computer. Locally the form shows a "preview mode"
> confirmation so you can still test the flow.

---

## 5. Put it on GitHub

```bash
cd wedding-site
git init
git add .
git commit -m "Wedding RSVP site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wedding-site.git
git push -u origin main
```

(Create the empty repo first at https://github.com/new.)

---

## 6. Things you'll likely want to tweak

| Want to change… | Where |
|---|---|
| Names, date, venue, time | `index.html` — the hero section |
| RSVP deadline (July 10th) | `index.html` — "Kindly reserve your place" |
| Bank / gift details | `index.html` — the `.gift-card` block |
| Map destination | `index.html` — the `.map-link` href |
| Colors / fonts | `css/styles.css` — the `:root` variables at the top |
| Animation on/off | They auto-disable for visitors who prefer reduced motion |

---

## 7. Optional: also mirror RSVPs to a Google Sheet
Netlify can forward each submission to a webhook. If you later want responses in
a live Google Sheet too, you can add a Netlify **outgoing form notification →
Zapier/Make → Google Sheets**, or a small Google Apps Script endpoint. Ask and
this can be wired in — the current setup already captures everything safely in
Netlify regardless.
