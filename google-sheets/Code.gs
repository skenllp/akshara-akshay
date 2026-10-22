/**
 * RSVP receiver for the Akshara & Akshay wedding site.
 * Bound to a Google Sheet: Extensions > Apps Script > paste this file.
 * Deploy as Web app: Execute as "Me", access "Anyone". Setup steps: SETUP.md
 */
var SHEET_NAME = 'RSVPs';
var HEADERS = ['Received (IST)', 'Event', 'Full name', 'Phone / WhatsApp', 'Attending', 'Guests', 'Message', 'phone_key'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    var scope = String(d.event_scope || 'wedding');
    var name = clean_(d.full_name, 100);
    var phone = clean_(d.phone, 20);
    var digits = phone.replace(/\D/g, '');
    var attending = d.attending === true;
    var guests = attending ? parseInt(d.guests, 10) : '';
    var message = clean_(d.message, 500);

    if (['wedding', 'reception', 'both'].indexOf(scope) < 0) return out_({ ok: false, error: 'invalid' });
    if (name.length < 2 || digits.length < 8 || digits.length > 15) return out_({ ok: false, error: 'invalid' });
    if (attending && !(guests >= 1 && guests <= 20)) return out_({ ok: false, error: 'invalid' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
      sh.setFrozenRows(1);
      sh.hideColumns(HEADERS.length);            // phone_key helper column
    }

    // one response per phone number per event (last 10 digits)
    var key = scope + ':' + digits.slice(-10);
    var last = sh.getLastRow();
    if (last > 1) {
      var keys = sh.getRange(2, HEADERS.length, last - 1, 1).getValues();
      for (var i = 0; i < keys.length; i++) if (keys[i][0] === key) return out_({ ok: false, error: 'duplicate' });
    }

    var row = last + 1;
    var when = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    var range = sh.getRange(row, 1, 1, HEADERS.length);
    range.setNumberFormat('@');                  // store everything as plain text (safe from formulas)
    range.setValues([[when, scope, name, phone, attending ? 'Joyfully accepts' : 'Regretfully declines', guests, message, key]]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return out_({ ok: true, service: 'rsvp' }); }

function clean_(v, max) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
