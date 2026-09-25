/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'panificio-brianti', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['07:00', '19:30']],
      2: [['07:00', '19:30']],
      3: [['07:00', '19:30']],
      4: [['07:00', '19:30']],
      5: [['07:00', '19:30']],
      6: [['07:00', '19:30']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.cosa": "Bakery · Pastry shop · Café · Deli",
      "i.skip": "Skip",
      "m.top": "Brianti, back to the top",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.menu": "Open the menu",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.banco": "The counter",
      "n.qui": "Find us here",
      "n.dove": "Hours",
      "n.chiama": "Call",
      "n.rec": "Reviews",
      "n.chiama2": "Call +39&nbsp;333&nbsp;832&nbsp;6753",
      "h.eti": "Via dei Fiordalisi 1 · Milan",
      "h.t": "Every little <span class=\"corsivo\">craving.</span>",
      "h.p": "Bakery, pastry shop, café and deli: bread and focaccia, breakfast at the counter, lunch with the dishes of the day, cakes and pastries, festive specialities and aperitivo. Monday to Saturday, 7am to 7:30pm.",
      "h.chiama": "Call +39&nbsp;333&nbsp;832&nbsp;6753",
      "h.strada": "Directions",
      "h.fz": "Enlarge the photo of the counter",
      "h.fa": "The Brianti glass counter with trays of pizza and focaccia, and the coffee machine behind",
      "h.boll": "the counter",
      "h.ff": "The counter, on Via dei Fiordalisi",
      "b.t": "The counter",
      "b.sotto": "From morning bread to an evening glass: everything you'll find here, one parcel at a time.",
      "p1.z": "Enlarge the photo of the bread and focaccia",
      "p1.a": "The counter full of focaccia, pizza by the tray, filled rolls and olive bread",
      "p1.b": "bread",
      "p1.t": "Bread and focaccia",
      "p1.l1": "bread in many shapes and flours",
      "p1.l2": "focaccia and pizza by the tray",
      "p1.l3": "mini pizzas and savoury bites",
      "p1.l4": "filled rolls and olive bread",
      "p2.z": "Enlarge the photo of breakfast",
      "p2.a": "A cappuccino with a swirl of foam and a croissant with sugar crumbs on a tray",
      "p2.b": "7am",
      "p2.t": "Breakfast",
      "p2.l1": "from 7am, at the counter or sitting down",
      "p2.l2": "brioches and pasticciotto",
      "p2.l3": "cappuccino and caffè marocchino",
      "p2.l4": "hot chocolate",
      "p3.z": "Enlarge the photo of lunch",
      "p3.a": "Stuffed courgettes and aubergines, baked golden in a tray",
      "p3.b": "lunch",
      "p3.t": "Lunch",
      "p3.l1": "the dishes of the day, made by us",
      "p3.l2": "parmigiana",
      "p3.l3": "stuffed courgettes and aubergines",
      "p3.l4": "at the tables or to take away",
      "p4.z": "Enlarge the photo of the fruit tart",
      "p4.a": "A fruit tart with strawberries, kiwi and blackberries arranged in circles",
      "p4.b": "sweets",
      "p4.t": "Cakes and pastries",
      "p4.l1": "cakes and small cakes, for a birthday too",
      "p4.l2": "fruit tarts",
      "p4.l3": "baci di dama",
      "p4.l4": "petits fours",
      "p5.z": "Enlarge the photo of the struffoli",
      "p5.a": "Trays of struffoli with coloured sprinkles",
      "p5.b": "festive",
      "p5.t": "Festive specialities",
      "p5.l1": "casatiello and pastiera",
      "p5.l2": "struffoli",
      "p5.l3": "trays of marrons glacés and chocolate-dipped candied orange",
      "p5.l4": "book them by phone",
      "p6.z": "Enlarge the photo of the aperitivo",
      "p6.a": "A flute, two jam puff pastries on a small plate and a bowl of peanuts on the wooden table",
      "p6.b": "evening",
      "p6.t": "Aperitivo",
      "p6.l1": "a glass of wine or a spritz",
      "p6.l2": "with focaccia from the counter",
      "p6.l3": "or with a board",
      "p6.l4": "until 7:30pm",
      "q0.t": "Find us here",
      "q0.p1": "At Via dei Fiordalisi 1, near the Gelsomini stop on the M4. If you were still looking for us on Via Inganni: we're here now.",
      "q0.p2": "There are tables inside: you can have breakfast, lunch and an aperitivo sitting down, or take it away. The entrance is wheelchair accessible.",
      "q0.fz": "Enlarge the photo of the shop front",
      "q0.fa": "The white sign with the Brianti logo and the word Panificio above the shop window, on the grey stone front",
      "q0.b": "outside",
      "q0.ff": "Look for the sign with the circle and the B",
      "q0.iz": "Enlarge the photo of the inside",
      "q0.ia": "The room with the black marble column, light wood tables, metal chairs and the wall with the Brianti lettering",
      "q0.ib": "inside",
      "q0.if": "Inside: light wood, black marble and the tables",
      "r.t": "In our customers' words",
      "rc.1": "Whenever I'm in Milan, I always try to drop by. Exceptional bread. Exceptional sweets. And if you stop by, ask the young man for a caffè marocchino: delicious! Well done!",
      "rc.f1": "Davide Delle Fave · 5 months ago · 5 stars",
      "rc.2": "Excellent place: in Milan it has become hard to find quality like in this bakery. Highly recommended for a short lunch break too ❤️ you really feel at home. Highly recommended",
      "rc.f2": "Alessandra Modesto · 5 months ago · 5 stars",
      "rc.3": "Great experience, very good pasticciotto, baci di dama to die for and truly tempting, tasty mixed small cakes... always kind and friendly, they create a pleasant, warm atmosphere to share with special people",
      "rc.f3": "D S · 5 months ago · 5 stars",
      "rc.4": "Excellent service. I discovered it by chance this morning and had to come back for lunch too. The quality is truly outstanding, the best pastry shop and bakery within at least 5 km. Not a given. Very kind staff",
      "rc.f4": "Aisha Sanogo · a year ago · 5 stars",
      "rc.5": "I stopped by this bakery by chance because I needed a small birthday cake, and on Mondays all the pastry shops are closed. I took a small chocolate and pear cake that was still available... An incredible surprise, one of the best cakes I've ever eaten, like homemade by expert hands! Truly the best, congratulations, I'll definitely be back!",
      "rc.f5": "Daniele Mazzocchi · a year ago · 5 stars",
      "r.piede": "Public reviews on Google, copied word for word.",
      "o.t": "Hours",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso": "closed",
      "o.ind": "Address",
      "o.indv": "Via dei Fiordalisi 1, 20146 Milan",
      "o.tel": "Phone",
      "o.pren": "Bookings",
      "o.prenv": "Cakes and festive specialities: by phone",
      "o.pag": "Payments",
      "o.pagv": "Credit and debit cards, contactless",
      "o.chiama": "Call",
      "o.btn": "Directions",
      "o.mappa": "Map: Brianti, Via dei Fiordalisi 1, Milan",
      "d.t": "Questions",
      "d.1t": "Are you open on Mondays?",
      "d.1p": "Yes: Monday to Saturday, 7am to 7:30pm. We're closed on Sundays.",
      "d.2t": "Can I order a cake?",
      "d.2p": "Yes, by phone: +39&nbsp;333&nbsp;832&nbsp;6753. Festive specialities too.",
      "d.3t": "Can I have lunch sitting down?",
      "d.3p": "Yes: the dishes of the day can be eaten at the tables or taken away.",
      "d.4t": "Do you do aperitivo?",
      "d.4p": "Yes, until 7:30pm: a glass of wine or a spritz with focaccia from the counter.",
      "d.5t": "Can I pay by card?",
      "d.5p": "Yes, credit and debit cards, contactless too.",
      "d.6t": "Is the shop accessible?",
      "d.6p": "Yes, the entrance is wheelchair accessible.",
      "d.7t": "Weren't you on Via Inganni before?",
      "d.7p": "Yes: now you'll find us at Via dei Fiordalisi 1.",
      "f.orari": "Monday to Saturday, 7am to 7:30pm · closed on Sunday",
      "f.cred": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their Google listing and their Instagram profile; public reviews on Google (September 2026); photographs by the owner and from the Google listing.",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.mappa": "Map",
      "x.banco": "Counter",
      "x.orari": "Hours"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «il pacchetto che si apre» (#205 Brianti) ──
  // Ogni foto è incartata: due lembi di carta con le piccole B, lo spago e il bollino tondo col logo. Stato finale in HTML/CSS:
  // aperto (lembi ruotati e trasparenti, spago sparito, bollino nell'angolo). Con GSAP e senza reduced-motion il JS li richiude
  // (lembi piatti sulla foto, spago teso, bollino al centro sul nodo) e li apre quando entrano in vista: il bollino si stacca e
  // va nell'angolo, lo spago si ritira verso il nodo, i due lembi si aprono di lato. Il pacco grande dell'apertura si apre dopo
  // l'intro; nel banco si aprono da sinistra a destra. Lo stato è in data-pacco: chiuso → apre → aperto.
  var pacchi = Array.prototype.slice.call(document.querySelectorAll('[data-pacco]'));
  var apertura = document.getElementById('apertura');
  var parti = function (p) {
    return { sx: p.querySelector('.pacco__lembo--sx'), dx: p.querySelector('.pacco__lembo--dx'), spago: p.querySelector('.pacco__spago'),
      fili: p.querySelectorAll('.pacco__spago i'), boll: p.querySelector('.bollino') };
  };
  // il bollino chiuso sta sul nodo, al centro della foto: si misura dal suo posto finale nell'angolo
  var sulNodo = function (p, boll) {
    gsap.set(boll, { x: 0, y: 0 });
    var r = p.getBoundingClientRect(), b = boll.getBoundingClientRect();
    gsap.set(boll, { x: (r.left + r.width / 2) - (b.left + b.width / 2), y: (r.top + r.height / 2) - (b.top + b.height / 2), rotation: 6, scale: 1.1 });
  };
  var chiudi = function (p) {
    var q = parti(p);
    if (!q.sx || !q.dx || !q.boll || !q.spago || q.fili.length < 2) return false;
    p.setAttribute('data-pacco', 'chiuso');
    gsap.set([q.sx, q.dx], { rotationY: 0, opacity: 1 });
    gsap.set(q.spago, { opacity: 1 });
    gsap.set(q.fili, { scaleX: 1, scaleY: 1 });
    sulNodo(p, q.boll);
    return true;
  };
  var apri = function (p, ritardo) {
    if (p.getAttribute('data-pacco') !== 'chiuso') return;
    p.setAttribute('data-pacco', 'apre');
    var q = parti(p);
    gsap.timeline({ delay: ritardo || 0, onComplete: function () { p.setAttribute('data-pacco', 'aperto'); } })
      .to(q.boll, { x: 0, y: 0, rotation: -8, scale: 1, duration: 0.75, ease: 'back.out(1.5)' }, 0)
      .to(q.fili[0], { scaleX: 0, duration: 0.45, ease: 'power2.in' }, 0.15)
      .to(q.fili[1], { scaleY: 0, duration: 0.45, ease: 'power2.in' }, 0.15)
      .to(q.spago, { opacity: 0, duration: 0.2 }, 0.52)
      .to(q.sx, { rotationY: -100, duration: 1.05, ease: 'power3.inOut' }, 0.5)
      .to(q.dx, { rotationY: 100, duration: 1.05, ease: 'power3.inOut' }, 0.62)
      .to([q.sx, q.dx], { opacity: 0, duration: 0.35, ease: 'power1.in' }, 1.3);
  };
  if (hasGsap && !reducedMotion && pacchi.length) {
    pacchi.forEach(function (p) {
      if (!chiudi(p)) return;
      if (apertura && apertura.contains(p)) return; // si apre dopo l'intro (bespokeHeroEntrance)
      if (hasST) {
        ScrollTrigger.create({
          trigger: p, start: 'top 82%', once: true,
          onEnter: function () { apri(p, Math.max(0, Math.min(0.5, (p.getBoundingClientRect().left / window.innerWidth) * 0.6))); }
        });
      } else {
        apri(p, 0);
      }
    });
    // se la finestra cambia prima che un pacco si apra, il bollino torna sul nodo
    window.addEventListener('resize', function () {
      pacchi.forEach(function (p) { if (p.getAttribute('data-pacco') === 'chiuso') sulNodo(p, parti(p).boll); });
    });
    // rete di sicurezza: un pacco già in vista che per qualunque motivo è ancora chiuso dopo 5 s si apre
    setTimeout(function () {
      pacchi.forEach(function (p) {
        var r = p.getBoundingClientRect();
        if (p.getAttribute('data-pacco') === 'chiuso' && r.top < window.innerHeight && r.bottom > 0 && !document.getElementById('intro')) apri(p, 0);
      });
    }, 5000);
  }
  // lo stato degli orari compare due volte (apertura e «Orari»): il secondo copia il primo, anche al cambio lingua
  var stato1 = document.getElementById('orarioStato'), stato2 = document.getElementById('orarioStato2');
  if (stato1 && stato2) {
    var copiaStato = function () { stato2.textContent = stato1.textContent; };
    copiaStato();
    if ('MutationObserver' in window) new MutationObserver(copiaStato).observe(stato1, { childList: true, characterData: true, subtree: true });
  }
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    pacchi.filter(function (p) { return apertura && apertura.contains(p); }).forEach(function (p) { apri(p, 0.35); });
    gsap.from('.apertura__t', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' });
    gsap.from('.apertura__p, .apertura .stato, .apertura .azioni', { y: 16, opacity: 0, duration: 0.7, delay: 0.2, stagger: 0.08, ease: 'power2.out', clearProps: 'all' });
  };
})();
