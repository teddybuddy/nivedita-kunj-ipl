# Nivedita Kunj IPL 2026 🏏

A registration website for the **Nivedita Kunj IPL** society cricket tournament.

🔗 **Live site:** _(GitHub Pages URL will appear here after you enable Pages)_

## Features
- 📝 Team registration (email, mobile, flat number)
- 👥 Up to 4 players per team, including a captain
- 📊 Live "Teams Registered" board with per-category counts
- 🏷️ Three age categories: **Under 12**, **12 to 40**, **40 Plus**
- ⏳ Registration deadline: **June 20, 2026** (with live countdown)
- 📜 Match rules: 4 overs a side, max 2 overs per bowler
- 🏆 Prize money: ₹500 per category

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `styles.css` | Styling (responsive, IPL theme) |
| `script.js` | Registration logic + live board |
| `backend/Code.gs` | Google Apps Script backend (paste into Apps Script) |
| `SETUP-BACKEND.md` | How to connect the shared Google Sheet backend |

## Hosting (GitHub Pages)
1. Push this repo to GitHub.
2. Repo **Settings → Pages → Source: Deploy from a branch → `main` / root**.
3. Site goes live at `https://<username>.github.io/<repo>/`.

## Shared backend
By default the site stores data in the browser only. To collect all
registrations centrally in a Google Sheet, follow **`SETUP-BACKEND.md`**.
