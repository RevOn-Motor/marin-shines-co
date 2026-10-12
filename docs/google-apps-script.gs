/**
 * Marin Shine Co. quote requests -> this Google Sheet.
 * Paste into Extensions > Apps Script of your leads Sheet. Setup: docs/lead-setup.md
 *
 * The website sends JSON with a shared secret. Apps Script always answers HTTP 200,
 * so the website treats only { ok: true } as success.
 */
const SHEET_NAME = "Leads";
const COLUMNS = ["submittedAt", "service", "town", "bedrooms", "bathrooms", "name", "phone", "email", "notes", "source"];
const HEADERS = ["Received", "Service", "Town", "Bedrooms", "Bathrooms", "Name", "Phone", "Email", "Notes", "Form"];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty("LEADS_SHEET_SECRET");
    if (!secret || body.secret !== secret) return reply({ ok: false, error: "unauthorized" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow(COLUMNS.map((key) => (body[key] == null ? "" : String(body[key]))));
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  }
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
