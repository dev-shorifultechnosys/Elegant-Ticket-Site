/* ======================================================================
   OPEN TICKETS / SECTION 01 — HEADER & FEATURED CAROUSEL
   Pure vanilla JavaScript, no jQuery or carousel plugin.
   Keeps original Isotope/checkout out of scope and untouched.
   Event metadata supplied from the existing public event listing.
   Replace this demo data with CMS/endpoint data during theme integration.
====================================================================== */
(() => {
  'use strict';

  /* ---- 01 / Tiny DOM utilities ---- */
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  /* ---- 02 / Event data: only approved public event information ---- */
  const slides = [
    {
      name: 'Appel in PE', subtitle: 'Soos Net Hy Kan', category: 'LIVE MUSIC',
      date: 'Fri, 06 Nov 2026 · 21:00', day: '06', month: 'NOV',
      venue: 'Boardwalk Hotel and Casino, Port Elizabeth',
      image: 'assets/images/events/appel-pe.webp',
      officialImage: 'https://d3fchakcenee6k.cloudfront.net/storage/463/AOT-OPEN-TICKETS-BANNER-%281210-x-450-px%29.png',
      url: 'https://opentickets.co.za/event/01ktvcz2dxv10rs7cvq0q9tc0v'
    },
    {
      name: 'Mamelodi Sundowns', subtitle: 'vs Durban City', category: 'FOOTBALL',
      date: 'Sat, 31 Oct 2026 · 20:15', day: '31', month: 'OCT',
      venue: 'Royal Bafokeng Stadium',
      image: 'assets/images/events/sundowns-city.webp',
      officialImage: 'https://d3fchakcenee6k.cloudfront.net/storage/3725/MSFC-v-DCFC-31-Oct-2026-Banner.jpg',
      url: 'https://opentickets.co.za/event/01m5ena2smd0hden3vqrxdks07'
    },
    {
      name: 'Going Back West', subtitle: 'Tarlton Raceway', category: 'FESTIVAL',
      date: 'Sat, 07 Nov 2026 · 13:00', day: '07', month: 'NOV',
      venue: 'Tarlton International Raceway',
      image: 'assets/images/events/going-back-west.webp',
      officialImage: 'https://d3fchakcenee6k.cloudfront.net/storage/440/Ticket-Banner-2.png',
      url: 'https://opentickets.co.za/event/01kva9y2phdzcq6p7p12s0r5vy'
    },
    {
      name: 'ISR Sewes en Hoops', subtitle: 'Hoërskool Hartebeespoort', category: 'SPORTS',
      date: 'Sat, 31 Oct 2026 · 07:00', day: '31', month: 'OCT',
      venue: 'Hoërskool Hartebeespoor',
      image: 'assets/images/events/isr-sewes.webp',
      officialImage: 'https://d3fchakcenee6k.cloudfront.net/storage/3765/ISR-2026-TICKET-BANNER-Landloop-1370-x-550.png',
      url: 'https://opentickets.co.za/event/01m5h7c18yer4wrqhjsyxrneeg'
    },
    {
      name: 'Help24 Somer Fees', subtitle: 'Hoërskool Florida', category: 'LIVE FESTIVAL',
      date: 'Sat, 21 Nov 2026 · 12:00', day: '21', month: 'NOV',
      venue: 'Hoërskool Florida',
      image: 'assets/images/events/help24.webp',
      officialImage: 'https://d3fchakcenee6k.cloudfront.net/storage/1078/Help24-Banner.png',
      url: 'https://opentickets.co.za/event/01m3vvwks8fnsc3f7qv9fbxpxk'
    }
  ];

  /* ----- SCENIC BACKGROUND — five independent, uncropped stills ----- */
  const hero = $('#featuredEvents');
  if (!hero) return;
  const backgroundFrames = $$('.ot-hero__background-frame', hero);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let backgroundIndex = 0;
  let backgroundTimer = null;
  function showBackground(nextIndex) {
    backgroundIndex = (nextIndex + backgroundFrames.length) % backgroundFrames.length;
    backgroundFrames.forEach((frame,i) => frame.classList.toggle('is-active',i === backgroundIndex));
  }
  function stopBackground() { clearInterval(backgroundTimer); backgroundTimer = null; }
  function startBackground() {
    stopBackground();
    if (reducedMotion.matches || document.hidden || backgroundFrames.length < 2) return;
    backgroundTimer = window.setInterval(() => showBackground(backgroundIndex + 1), 10500);
  }
  showBackground(0);
  startBackground();

  /* ----- FEATURED EVENT — separate 5-event slider & own controls ----- */
  const refs = {
    image: $('#spotlightImage'), title: $('#spotlightTitle'), subtitle: $('#spotlightSubtitle'),
    category: $('#spotlightType'), date: $('#spotlightDate'), venue: $('#spotlightVenue'),
    link: $('#spotlightLink'), index: $('#spotlightIndex'), rail: $('#heroRail'),
    pager: $('#heroPager'), prev: $('#heroPrev'), next: $('#heroNext'),
    autoplay: $('#heroAutoplay'), announcer: $('#heroAnnouncement')
  };
  let currentIndex = 0;
  let featureTimer = null;
  let featurePaused = false;
  let railTimer = null;
  let hiddenRailIndex = null;
  let replaceSlot = 0;
  let railBusy = false;
  const FEATURE_INTERVAL = 18500; // long enough to read event metadata
  const RAIL_INTERVAL = 9600;   // only ONE of three cards changes each time

  function populateSpotlight(i) {
    const e = slides[i];
    refs.image.src = e.image;
    refs.image.parentElement.style.setProperty('--poster', `url("${e.image}")`);
    refs.image.alt = `${e.name} event promotional artwork`;
    refs.title.textContent = e.name;
    refs.subtitle.textContent = e.subtitle;
    refs.category.textContent = e.category;
    refs.date.textContent = e.date;
    refs.venue.textContent = e.venue;
    refs.link.href = e.url;
    refs.link.setAttribute('aria-label', `View ${e.name} event`);
    refs.index.textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function createRailCard(eventIndex) {
    const e = slides[eventIndex];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ot-mini-card';
    button.setAttribute('aria-label', `Feature event ${e.name}`);
    button.dataset.index = String(eventIndex);
    const img = document.createElement('img');
    img.src = e.image; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.width = 800; img.height = 300;
    const date = document.createElement('span');
    date.className = 'ot-mini-card__date'; date.textContent = e.day;
    const month = document.createElement('small'); month.textContent = e.month; date.append(month);
    const copy = document.createElement('span'); copy.className = 'ot-mini-card__copy';
    const info = document.createElement('span');
    const name = document.createElement('strong'); name.textContent = e.name;
    const venue = document.createElement('small'); venue.textContent = e.venue;
    info.append(name, venue);
    const arrow = document.createElement('span'); arrow.className = 'ot-mini-card__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg class="ot-icon"><use href="#ot-i-arrow"></use></svg>';
    copy.append(info, arrow);
    button.append(img,date,copy);
    button.addEventListener('click', () => {
      setFeature(eventIndex, true);
      // A person's selection never moves the background scenery.
    });
    return button;
  }

  function railOptions() { return slides.map((_,i) => i).filter(i => i !== currentIndex); }
  function resetRail() {
    railBusy = false; replaceSlot = 0;
    const options = railOptions();
    refs.rail.replaceChildren(...options.slice(0,3).map(createRailCard));
    hiddenRailIndex = options.length > 3 ? options[3] : null;
  }
  function rotateOneRailCard() {
    if (railBusy || hiddenRailIndex === null || reducedMotion.matches || document.hidden || refs.rail.matches(':hover') || refs.rail.contains(document.activeElement)) return;
    const cards = $$('.ot-mini-card',refs.rail);
    if (!cards.length) return;
    const slot = replaceSlot % cards.length;
    const leavingCard = cards[slot];
    const oldIndex = Number(leavingCard.dataset.index);
    const incomingIndex = hiddenRailIndex;
    railBusy = true;
    leavingCard.classList.add('is-changing');
    window.setTimeout(() => {
      // Ignore stale animation if user selects a new spotlight in the meantime.
      if (!leavingCard.isConnected || Number(leavingCard.dataset.index) !== oldIndex) { railBusy=false;return; }
      const arrivingCard = createRailCard(incomingIndex);
      arrivingCard.classList.add('is-arriving');
      leavingCard.replaceWith(arrivingCard);
      requestAnimationFrame(() => requestAnimationFrame(() => arrivingCard.classList.remove('is-arriving')));
      hiddenRailIndex = oldIndex;
      replaceSlot = (replaceSlot + 1) % cards.length;
      railBusy = false;
    }, 460);
  }
  function stopRail() { clearInterval(railTimer); railTimer = null; }
  function startRail() {
    stopRail();
    if (reducedMotion.matches || document.hidden) return;
    railTimer = window.setInterval(rotateOneRailCard, RAIL_INTERVAL);
  }

  function setFeature(index, userInitiated=false) {
    currentIndex = (index + slides.length) % slides.length;
    populateSpotlight(currentIndex);
    // Background carousel deliberately NOT touched here.
    resetRail();
    $$('button[data-slide]',refs.pager).forEach((button,i) => {
      const active = i === currentIndex;
      button.classList.toggle('is-active',active);
      if (active) button.setAttribute('aria-current','true');
      else button.removeAttribute('aria-current');
    });
    if (userInitiated) {
      refs.announcer.textContent = `Featured ${slides[currentIndex].name}, event ${currentIndex+1} of ${slides.length}`;
      restartFeature();
      startRail();
    }
  }
  function stopFeature() { clearInterval(featureTimer); featureTimer=null; }
  function startFeature() {
    stopFeature();
    if (featurePaused || reducedMotion.matches || document.hidden) return;
    featureTimer = window.setInterval(() => {
      if (refs.pager.contains(document.activeElement) || refs.rail.matches(':hover') || refs.rail.contains(document.activeElement)) return;
      setFeature(currentIndex+1);
    },FEATURE_INTERVAL);
  }
  function restartFeature() { stopFeature(); startFeature(); }
  refs.prev.addEventListener('click',() => setFeature(currentIndex-1,true));
  refs.next.addEventListener('click',() => setFeature(currentIndex+1,true));
  refs.pager.addEventListener('click',e => { const b=e.target.closest('[data-slide]');if(b)setFeature(Number(b.dataset.slide),true); });
  refs.autoplay.addEventListener('click',() => {
    featurePaused = !featurePaused;
    refs.autoplay.setAttribute('aria-pressed',String(featurePaused));
    refs.autoplay.setAttribute('aria-label',featurePaused?'Resume featured events':'Pause featured events');
    refs.autoplay.textContent = featurePaused?'Play':'Pause';
    restartFeature();
  });
  // Never skip a card while it is being read or explored with keyboard/mouse.
  refs.rail.addEventListener('mouseenter', stopRail);
  refs.rail.addEventListener('mouseleave', startRail);
  refs.rail.addEventListener('focusin', stopRail);
  refs.rail.addEventListener('focusout',() => {
    requestAnimationFrame(() => { if (!refs.rail.contains(document.activeElement)) startRail(); });
  });
  document.addEventListener('visibilitychange',() => {
    if (document.hidden) { stopFeature();stopRail();stopBackground(); }
    else { startFeature();startRail();startBackground(); }
  });
  reducedMotion.addEventListener?.('change',() => {
    if (reducedMotion.matches) {stopFeature();stopRail();stopBackground();}
    else {startFeature();startRail();startBackground();}
  });
  setFeature(0);
  startFeature();
  startRail();
  // Self-contained artwork: no network override to shift quality or crop mid-view.
  window.addEventListener('load', () => {
    slides.slice(1).forEach(e => { const img = new Image(); img.src = e.image; });
  },{once:true});

  /* ---- 03 / Shrinking header, passive scroll listener ---- */
  const header = $('#siteHeader');
  let scheduled = false;
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 28);
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateHeader); }
  }, {passive:true});
  updateHeader();

  /* ---- 04 / Accessible mobile navigation ---- */
  const mobileToggle = $('#mobileMenuToggle');
  const mobileMenu = $('#mobileMenu');
  function setMenu(open) {
    mobileMenu.hidden = !open;
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) $('#mobileSearch')?.focus({preventScroll:true});
  }
  mobileToggle.addEventListener('click', () => setMenu(mobileMenu.hidden));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) {
      setMenu(false); mobileToggle.focus();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!mobileMenu.hidden && !header.contains(event.target)) setMenu(false);
  });
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 992px)').addEventListener?.('change', event => { if (event.matches) setMenu(false); });

  /* ---- 05 / Language selector integration hook ----
     This standalone design does NOT claim to translate the full site.
     The production CMS/i18n module can subscribe to the custom event.
  ---------------------------------------------------------------- */
  $$('.ot-language__menu button[data-lang]').forEach(button => {
    button.addEventListener('click', () => {
      $$('.ot-language__menu button').forEach(item => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      $('#languageLabel').textContent = button.textContent;
      document.dispatchEvent(new CustomEvent('ot:language-selected', { detail: { language: button.dataset.lang } }));
    });
  });
})();
