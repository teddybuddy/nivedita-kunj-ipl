# Shared Backend Setup — Nivedita Kunj IPL 2026

This connects your website to a **Google Sheet** so every registration is
collected in **one place** (that you own) and the live "Teams Registered"
board shows the same data to everyone.

- ✅ Free, no credit card, no software to install
- ✅ All entries land in a Google Sheet you can view / sort / export
- 🔒 Email & mobile stay **private** in the Sheet — only team name,
  category, flat, and players appear on the public board

You only need a **Google account**. Takes about 5–10 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to https://sheets.google.com and create a **Blank** spreadsheet.
2. Rename it (top-left) to something like **Nivedita Kunj IPL 2026**.
   - You don't need to add any columns — the script creates them automatically.

## Step 2 — Open the script editor

1. In the Sheet, click **Extensions → Apps Script**.
2. A new tab opens with a file called `Code.gs` containing `function myFunction() {}`.
3. **Delete everything** in that editor.
4. Open the file **`backend/Code.gs`** from your project folder, copy **all**
   of its contents, and **paste** it into the Apps Script editor.
5. Click the **💾 Save** icon (or Ctrl+S).

## Step 3 — Deploy as a Web App

1. Click **Deploy → New deployment** (top-right).
2. Click the ⚙️ gear next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description:** `IPL backend` (anything)
   - **Execute as:** **Me (your email)**
   - **Who has access:** **Anyone**  ← important, so residents can register
4. Click **Deploy**.
5. Click **Authorize access** → pick your Google account.
   - You may see "Google hasn't verified this app". Click
     **Advanced → Go to (your project name) (unsafe)** → **Allow**.
     (It's *your own* script — this warning is normal for personal scripts.)
6. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfy............/exec`

## Step 4 — Paste the URL into the website

1. Open **`script.js`** in your project folder.
2. Near the top, find:
   ```js
   const CONFIG = {
     WEB_APP_URL: "PASTE_YOUR_WEB_APP_URL_HERE",
   };
   ```
3. Replace `PASTE_YOUR_WEB_APP_URL_HERE` with your copied URL (keep the quotes):
   ```js
   const CONFIG = {
     WEB_APP_URL: "https://script.google.com/macros/s/AKfy............/exec",
   };
   ```
4. Save the file.

## Step 5 — Re-upload to GitHub Pages

Upload the updated **`script.js`** to your GitHub repo (Add file → Upload files →
commit), the same way you uploaded the site. Your live site will use the
backend within a minute.

---

## ✅ Test it

1. Open your live site (or `index.html`).
2. Register a test team.
3. Check the Google Sheet — a new row should appear with all details
   (including the private email & mobile).
4. The "Teams Registered" board should show the new team and counts.

## Updating the code later

If you ever change `backend/Code.gs`, you must **re-deploy**:
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
(The Web app URL stays the same.)

## Notes & tips

- **Viewing entries:** just open the Google Sheet anytime.
- **Export:** File → Download → CSV / Excel.
- **Privacy:** the public board never exposes email or mobile. If you also
  don't want flat numbers or player names shown publicly, tell me and I'll
  trim the public feed further.
- **Before the URL is set**, the site runs in *local mode* (data saved only in
  the current browser) so you can still demo it.
