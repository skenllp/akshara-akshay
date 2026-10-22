/* ------------------------------------------------------------------
   Akshara & Akshay — site configuration
   Edit this file only; no other code needs to change.
------------------------------------------------------------------- */
window.WEDDING_CONFIG = {
  // Countdown target — 18 Nov 2026, 10:00 AM India Standard Time (UTC+05:30)
  eventDateISO: "2026-11-18T10:00:00+05:30",

  rsvp: {
    // Paste the Google Apps Script "Web app" URL here (see google-sheets/SETUP.md).
    // Until it is set the form is shown as "not configured" and cannot submit.
    sheetsUrl: "https://script.google.com/macros/s/AKfycbxIeQkgmjvZ8GEYGTmmDFBMs8wY4ZBIH753Ui1czkqlXD2qxPkw1l5zz0CyZXStT0YhRA/exec",

    // Which celebration the RSVP refers to: "wedding" | "reception" | "both"
    scope: "wedding",
  },

  // The separate reception on 22 Nov 2026 (Eden Convention Centre).
  // Disabled until the client confirms the final schedule and guest audience.
  reception: {
    enabled: false,
  },

  // Optional background music. Leave `src` empty to keep the toggle hidden.
  // Only add a track you have the rights to use, e.g. "assets/audio/music.mp3".
  music: {
    src: "music.webm",
  },
};
