/* ------------------------------------------------------------------
   Akshara & Akshay — site configuration
   Edit this file only; no other code needs to change.
------------------------------------------------------------------- */
window.WEDDING_CONFIG = {
  // Countdown target — the wedding muhurtham: 18 Nov 2026, 10:00 AM India Standard Time (UTC+05:30)
  eventDateISO: "2026-11-18T10:00:00+05:30",

  rsvp: {
    // Paste the Google Apps Script "Web app" URL here (see google-sheets/SETUP.md).
    // Until it is set the form is shown as "not configured" and cannot submit.
    sheetsUrl: "https://script.google.com/macros/s/AKfycbxIeQkgmjvZ8GEYGTmmDFBMs8wY4ZBIH753Ui1czkqlXD2qxPkw1l5zz0CyZXStT0YhRA/exec",

    // The RSVP refers to the wedding.
    scope: "wedding",
  },

  // John's Village section. Leave a field empty ("") until the family confirms it —
  // empty fields are simply not shown, and the directions button stays inactive
  // until `mapsUrl` is set (paste a Google Maps share link).
  johnsVillage: {
    eventName: "Lunch & Gathering",
    date: "",                          // not supplied yet — left blank on purpose
    time: "11:30 AM onwards",
    venueName: "John's Village",
    address: "Mulanthuruthy, Ernakulam",
    mapsUrl: "https://maps.app.goo.gl/8eFNhCftjgxNM4XY9?g_st=aw",   // Get Directions button
  },

  // Optional background music. Leave `src` empty to keep the toggle hidden.
  // Only add a track you have the rights to use, e.g. "assets/audio/music.mp3".
  music: {
    src: "assets/audio/music.mp3",
  },
};
