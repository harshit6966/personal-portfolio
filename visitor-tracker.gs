// Google Apps Script — Visitor Tracker
// ─────────────────────────────────────
// 1. Open https://script.google.com → New project
// 2. Paste this entire file, replacing Code.gs content
// 3. Update SHEET_ID below with your Google Sheet's ID
//    (the long string in the sheet URL between /d/ and /edit)
// 4. Click Deploy → New deployment → Web app
//    • Execute as: Me
//    • Who has access: Anyone
// 5. Copy the deployment URL into index.html → TRACKER_URL

const SHEET_ID   = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Visits';

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Page', 'Referrer', 'User Agent']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'count') {
    const sheet = getSheet();
    const total = Math.max(0, sheet.getLastRow() - 1);
    return jsonResponse({ totalVisits: total });
  }
  return jsonResponse({ error: 'Unknown action' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet();

    if (body.action === 'log') {
      sheet.appendRow([
        body.ts || new Date().toISOString(),
        body.page || '',
        body.referrer || '',
        body.ua || ''
      ]);
      const total = Math.max(0, sheet.getLastRow() - 1);
      return jsonResponse({ totalVisits: total });
    }

    return jsonResponse({ error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
