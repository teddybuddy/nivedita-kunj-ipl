/**
 * Nivedita Kunj IPL 2026 — backend (Google Apps Script)
 * --------------------------------------------------------
 * Stores every team registration in a Google Sheet and serves
 * the public "Teams Registered" board to the website.
 *
 * Setup steps are in SETUP-BACKEND.md.
 *
 * - doPost : receives a registration (from the website) and adds a row.
 * - doGet  : returns the public team list (JSONP) for the live board.
 *
 * Privacy: the public feed (doGet) only returns team name, category,
 * flat and player names. Email & mobile stay PRIVATE inside the Sheet
 * for the organiser — they are never sent to the public board.
 */

var SHEET_NAME = 'Registrations';
var HEADERS = [
  'Timestamp', 'Team Name', 'Category', 'Email', 'Mobile', 'Flat',
  'Captain', 'Player 2', 'Player 3', 'Player 4'
];

/** Public read — used by the website's live board (via JSONP). */
function doGet(e) {
  var callback = e && e.parameter && e.parameter.callback;
  var payload = JSON.stringify({ ok: true, teams: getPublicTeams() });
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + payload + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

/** Write — receives a new registration from the website. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // avoid two registrations writing at once
    var t = JSON.parse(e.postData.contents);

    if (!t.teamName || !t.category) {
      return jsonOut_({ ok: false, error: 'Missing team name or category.' });
    }

    // Server-side duplicate guard: same flat + same category.
    if (isDuplicate_(t.flat, t.category)) {
      return jsonOut_({ ok: false, error: 'A team from this flat is already registered in this category.' });
    }

    var players = t.players || [];
    sheet_().appendRow([
      new Date(),
      t.teamName,
      t.category,
      t.email || '',
      "'" + (t.mobile || ''), // leading quote keeps mobile as text
      t.flat || '',
      players[0] || '',
      players[1] || '',
      players[2] || '',
      players[3] || ''
    ]);

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- helpers ---------------- */

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function isDuplicate_(flat, category) {
  if (!flat) return false;
  var rows = sheet_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var f = String(rows[i][5] || '').trim().toLowerCase();
    var c = String(rows[i][2] || '').trim();
    if (f && f === String(flat).trim().toLowerCase() && c === category) {
      return true;
    }
  }
  return false;
}

/** Returns ONLY public-safe fields (no email, no mobile). */
function getPublicTeams() {
  var rows = sheet_().getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue; // skip blank rows
    var players = [r[6], r[7], r[8], r[9]].filter(function (x) { return x !== '' && x != null; });
    out.push({
      teamName: r[1],
      category: r[2],
      flat: r[5],
      players: players
    });
  }
  return out;
}
