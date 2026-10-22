(function () {
  "use strict";

  var CFG = window.WEDDING_CONFIG || {};
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var main = $("#main");
  var opening = $("#opening");
  var hero = $("#home");
  var nav = $("#nav");

  /* ---------------------------------------------------------- reveal on scroll */
  var revealIO = null;
  function initReveal() {
    var els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { revealIO.observe(e); });
  }

  /* ---------------------------------------------------------- opening invitation */
  var opened = false;
  function finishOpening(skipFade) {
    if (opened) return;
    opened = true;
    hero.classList.add("revealed");
    main.removeAttribute("inert");
    main.removeAttribute("aria-hidden");
    doc.classList.remove("locked");
    
    if (skipFade) {
      opening.style.display = "none";
    } else {
      opening.classList.add("leaving");
      setTimeout(function () { opening.style.display = "none"; }, 1500);
    }
    var v = $("#openingVideo");
    if (v) { try { v.pause(); } catch (e) {} }
    window.scrollTo(0, 0);
  }

  function initOpening() {
    var skip = /[?&]skip(=|&|$)/.test(location.search);
    if (skip || !opening) {
      if (opening) opening.style.display = "none";
      finishOpening(true);
      return;
    }
    doc.classList.add("locked");
    main.setAttribute("inert", "");
    main.setAttribute("aria-hidden", "true");

    var btn = $("#openBtn");
    var video = $("#openingVideo");
    var started = false;
    btn.focus({ preventScroll: true });

    function start() {
      if (started) return;
      started = true;
      btn.disabled = true;
      
      // Start music on user interaction (mobile-friendly)
      tryStartMusic();

      if (reduced || !video) { finishOpening(false); return; }

      var done = false;
      function end() { if (done) return; done = true; finishOpening(false); }
      var dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 5;

      video.addEventListener("ended", end, { once: true });
      video.addEventListener("error", end, { once: true });
      // pre-empt the final frame so the crossfade begins as playback finishes
      video.addEventListener("timeupdate", function () {
        if (video.duration && video.currentTime >= video.duration - 0.35) end();
      });

      var stall = setTimeout(end, 4500);           // video never started playing
      video.addEventListener("playing", function () {
        clearTimeout(stall);
        opening.classList.add("playing");
        setTimeout(end, (dur + 2) * 1000);         // watchdog if "ended" never fires
      }, { once: true });

      var p;
      try { video.currentTime = 0; p = video.play(); } catch (e) { end(); return; }
      if (p && p.catch) p.catch(end);
    }
    btn.addEventListener("click", start);
  }

  /* ---------------------------------------------------------- navigation */
  function initNav() {
    if (!nav) return;
    var toggle = $("#navToggle"), menu = $("#mobileMenu");
    function setMenu(open) {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      doc.classList.toggle("locked", open);
    }
    toggle.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

    function onScroll() { nav.classList.toggle("solid", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // highlight the current section in the desktop nav
    var links = $$(".nav-links a");
    if ("IntersectionObserver" in window) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            links.forEach(function (a) { a.classList.remove("active"); });
            map[en.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------------------------------------------------------- countdown (IST) */
  function initCountdown() {
    var target = new Date(CFG.eventDateISO || "2026-11-18T10:00:00+05:30").getTime();
    var cd = $("#cd"), done = $("#cdDone");
    var d = $("#cdD"), h = $("#cdH"), m = $("#cdM"), s = $("#cdS");
    var timer;
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        cd.hidden = true; done.hidden = false;
        $("#cdTitle").textContent = "The day has arrived";
        clearInterval(timer); return;
      }
      var secs = Math.floor(diff / 1000);
      d.textContent = Math.floor(secs / 86400);
      h.textContent = pad(Math.floor(secs % 86400 / 3600));
      m.textContent = pad(Math.floor(secs % 3600 / 60));
      s.textContent = pad(secs % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------- optional reception */
  function initReception() {
    if (CFG.reception && CFG.reception.enabled) $("#reception").hidden = false;
  }

  /* ---------------------------------------------------------- RSVP */
  var SCOPE_TEXT = {
    wedding: "Responding for the wedding on 18 November 2026",
    reception: "Responding for the reception on 22 November 2026",
    both: "Responding for the wedding and the reception"
  };

  function initRSVP() {
    var R = CFG.rsvp || {};
    var scope = SCOPE_TEXT[R.scope] ? R.scope : "wedding";
    $("#rsvpScope").textContent = SCOPE_TEXT[scope];

    var form = $("#rsvpForm"), btn = $("#rsvpBtn"), status = $("#rsvpStatus");
    var configured = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec/.test(R.sheetsUrl || "");
    var openedAt = Date.now();
    var submitting = false;
    var STORE_KEY = "aa-rsvp-" + scope;

    if (!configured) {
      $("#rsvpConfigNotice").hidden = false;
      btn.disabled = true;
    }

    var attendRadios = $$("input[name=attending]", form);
    var guestsField = $("#guestsField"), guests = $("#fGuests");
    attendRadios.forEach(function (r) {
      r.addEventListener("change", function () {
        var yes = r.value === "yes" && r.checked;
        if (r.checked) {
          guestsField.hidden = !yes;
          if (!yes) { guests.value = ""; setErr("eGuests", ""); }
          setErr("eAttend", "");
        }
      });
    });

    function setErr(id, msg) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      var f = el.closest(".field");
      if (f) f.classList.toggle("invalid", !!msg);
    }

    function validate() {
      var ok = true, first = null;
      function bad(id, msg, focusEl) { setErr(id, msg); ok = false; if (!first) first = focusEl; }
      var name = $("#fName").value.trim().replace(/\s+/g, " ");
      var phone = $("#fPhone").value.trim();
      var digits = phone.replace(/\D/g, "");
      var att = (attendRadios.filter(function (r) { return r.checked; })[0] || {}).value;

      setErr("eName", ""); setErr("ePhone", ""); setErr("eAttend", ""); setErr("eGuests", "");
      if (name.length < 2) bad("eName", "Please enter your full name.", $("#fName"));
      if (!/^[+()\d\s.-]+$/.test(phone) || digits.length < 8 || digits.length > 15)
        bad("ePhone", "Please enter a valid phone or WhatsApp number.", $("#fPhone"));
      if (!att) bad("eAttend", "Please let us know if you will attend.", attendRadios[0]);
      if (att === "yes" && !guests.value) bad("eGuests", "Please select the number of guests.", guests);
      if (first) first.focus();
      return ok ? { name: name, phone: phone, attending: att === "yes", guests: att === "yes" ? parseInt(guests.value, 10) : null, message: $("#fMsg").value.trim() } : null;
    }

    function showThanks(attending) {
      form.hidden = true;
      var t = $("#rsvpThanks");
      $("#thanksTitle").textContent = attending ? "Thank you — we can’t wait to celebrate with you" : "Thank you for letting us know";
      $("#thanksText").textContent = attending ? "Your blessings and response have reached us." : "You will be in our hearts on the day. With love and gratitude.";
      t.hidden = false;
      t.focus({ preventScroll: true });
      t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }

    var already = null;
    try { already = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (already && configured) showThanks(already === "yes");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting || !configured) return;
      status.textContent = "";
      var hp = $("input[name=website]", form).value;
      var data = validate();
      if (!data) return;
      // bots: filled honeypot or impossibly fast submit — drop silently, never claim success
      if (hp || Date.now() - openedAt < 2500) { status.textContent = "Please take a moment and try again."; return; }

      submitting = true; form.classList.add("sending"); btn.disabled = true;
      $(".btn-label", btn).textContent = "Sending…";

      var ctrl = ("AbortController" in window) ? new AbortController() : null;
      var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);

      // text/plain keeps this a "simple" request (no CORS pre-flight) — Apps Script reads the JSON body as text
      fetch(R.sheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          event_scope: scope,
          full_name: data.name,
          phone: data.phone,
          attending: data.attending,
          guests: data.guests,
          message: data.message || ""
        }),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        clearTimeout(to);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }).then(function (out) {
        if (out && out.ok === true) {                                // really saved in the sheet
          try { localStorage.setItem(STORE_KEY, data.attending ? "yes" : "no"); } catch (e) {}
          showThanks(data.attending);
          return;
        }
        if (out && out.error === "duplicate") {
          setErr("ePhone", "We already have a response from this number. Please contact the family if you need to change it.");
          $("#fPhone").focus();
          return;
        }
        throw new Error((out && out.error) || "unknown");
      }).catch(function () {
        status.textContent = "Sorry, your response could not be saved. Please check your connection and try again.";
      }).then(function () {
        submitting = false; form.classList.remove("sending");
        if (!form.hidden) { btn.disabled = false; $(".btn-label", btn).textContent = "Send Blessings"; }
      });
    });
  }

  /* ---------------------------------------------------------- closing video */
  function initClosing() {
    var section = $("#closing"), video = $("#closingVideo"), finalImg = $("#closingFinal");
    var text = $("#closingText");
    $("#toTop").addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

    function showStatic() {
      section.classList.add("play");
      finalImg.hidden = false;
      video.style.display = "none";
    }
    if (reduced || !("IntersectionObserver" in window)) { showStatic(); return; }

    var loaded = false, played = false;
    function load() {
      if (loaded) return; loaded = true;
      video.src = video.getAttribute("data-src");
      video.load();
    }
    var near = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { load(); near.disconnect(); }
    }, { rootMargin: "100% 0px" });
    near.observe(section);

    video.addEventListener("error", showStatic);
    var vis = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || played) return;
      played = true; load();
      section.classList.add("play");
      var p = video.play();
      if (p && p.catch) p.catch(showStatic);
      vis.disconnect();
    }, { threshold: 0.45 });
    vis.observe(section);
    // the video ends on its own last frame and stays there (no loop)
  }

  /* ---------------------------------------------------------- optional music */
  var musicAudio = null;
  var musicStarted = false;
  
  function initMusic() {
    var src = CFG.music && CFG.music.src;
    var btn = $("#musicToggle");
    
    if (!src) return;                  // stays hidden until a track is supplied
    
    musicAudio = new Audio();
    musicAudio.src = src;
    musicAudio.loop = true;
    musicAudio.preload = "auto";
    musicAudio.volume = 0.7;
    
    btn.hidden = false;
    
    // Update UI state
    function updatePlayState(playing) {
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    }
    
    // Toggle play/pause
    btn.addEventListener("click", function () {
      var isPlaying = btn.getAttribute("aria-pressed") === "true";
      if (isPlaying) {
        musicAudio.pause();
      } else {
        musicAudio.play().catch(function () {});
      }
    });
    
    // Audio events
    musicAudio.addEventListener("play", function () { updatePlayState(true); musicStarted = true; });
    musicAudio.addEventListener("pause", function () { updatePlayState(false); });
    
    // Stop music when user leaves the page or switches tabs
    document.addEventListener("visibilitychange", function() {
      if (document.hidden && musicAudio && !musicAudio.paused) {
        musicAudio.pause();
      }
    });
    
    // Also handle page unload
    window.addEventListener("pagehide", function() {
      if (musicAudio && !musicAudio.paused) {
        musicAudio.pause();
      }
    });
    
    window.addEventListener("beforeunload", function() {
      if (musicAudio && !musicAudio.paused) {
        musicAudio.pause();
      }
    });
  }

  /* ---------------------------------------------------------- boot */
  initMusic();        // Initialize music first so it's ready when opening button is clicked
  initReveal();
  initOpening();
  initNav();
  initCountdown();
  initReception();
  initRSVP();
  initClosing();
})();
