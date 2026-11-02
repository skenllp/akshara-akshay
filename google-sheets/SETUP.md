# Connect the RSVP form to Google Sheets (5 minutes)

1. Create a new Google Sheet (e.g. "Akshara & Akshay RSVPs"). Keep it private.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste all of `Code.gs`. Save.
3. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, approve the permissions, and copy the **Web app URL** (ends in `/exec`).
4. Open `config.js` and paste it into `rsvp.sheetsUrl`.
5. Re-deploy the site. Submit a test RSVP — a row appears in the **RSVPs** tab.

Notes
- The sheet is only visible to you; the public link can only *add* a row (it cannot read the sheet).
- Duplicate phone numbers (same last 10 digits) are rejected with a friendly message.
- If you edit `Code.gs` later: **Deploy → Manage deployments → Edit → New version**, so the same URL keeps working.
- Rows are stored as plain text so phone numbers like +91… are never altered.
