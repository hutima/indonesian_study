// PWA "Install to Home Screen" nudge.
//
// Self-contained: main.js calls initPwaInstall() once and wires
// maybeScheduleInstallPrompt() to consent acceptance (so it's new-users-only);
// the user-guide footer button calls triggerInstall(). Everything else —
// capturing beforeinstallprompt, the persistent top banner, the platform-aware
// how-to modal, and the "don't show again" flag — lives here.
//
// The banner is modelled on the achievement toast (.level-toast) but it never
// auto-hides: only Install or ✕ clears it. Phone-only and new-users-only, so it
// lands right after the first-run consent/selector flow closes.

import { getStorage, isLikelyIOS } from '../utils/storage.js';

// ⚠️ Module-local string literal on purpose — NOT a store.js export. A brand-new
// cross-module export risks the "frozen on update" SW failure mode (an old
// cached importer paired with a new module that lacks the export → SyntaxError;
// see CLAUDE.md). Keep duff's own namespace distinct from Mounce's so the two
// apps (shared username.github.io origin) never read each other's flag.
const INSTALL_PROMPT_DISMISSED_KEY = 'greekFlashcardsInstallPromptDismissed';

// The captured beforeinstallprompt event (Android/Chromium). Stashed so we can
// fire .prompt() later from a user gesture. Null on iOS Safari and anywhere the
// browser never offers the native prompt.
let deferredPrompt = null;
let scheduleTimer = null;
let listenersBound = false;

// ── Environment predicates ───────────────────────────────────────────────

function isStandalone() {
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  } catch (_) {}
  return !!window.navigator.standalone;
}

function isLikelyPhone() {
  const ua = window.navigator.userAgent || '';
  if (/iPhone|iPod/.test(ua)) return true;
  if (/Android/.test(ua) && /Mobile/.test(ua)) return true;
  try {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const minDim = Math.min(window.screen?.width || Infinity, window.screen?.height || Infinity);
    if (coarse && minDim <= 480) return true;
  } catch (_) {}
  return false;
}

function isDismissed() {
  const storage = getStorage();
  return !!storage && storage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === 'true';
}

function markDismissed() {
  const storage = getStorage();
  if (storage) {
    try { storage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true'); } catch (_) {}
  }
}

// ── Init: capture the native prompt + watch for install ──────────────────

export function initPwaInstall() {
  if (listenersBound) return;
  listenersBound = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Stop Chrome's mini-infobar; we surface our own banner instead and fire
    // the stashed event from triggerInstall() on a user gesture.
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    // Installed for real — never nudge again, drop the banner, hide the
    // user-guide button, and forget the captured prompt.
    markDismissed();
    deferredPrompt = null;
    hideInstallBanner();
    hideUserGuideInstallButton();
  });

  // Already running as an installed app: the "Install app" guide button is
  // pointless, so hide it up front.
  if (isStandalone()) hideUserGuideInstallButton();
}

// ── Scheduling (phone-only, new-users-only) ───────────────────────────────

export function maybeScheduleInstallPrompt() {
  if (isStandalone() || isDismissed() || !isLikelyPhone()) return;
  if (scheduleTimer) return;
  // ~2s delay so the banner lands after the consent/selector flow settles.
  scheduleTimer = window.setTimeout(tryShowScheduled, 2000);
}

function tryShowScheduled() {
  scheduleTimer = null;
  if (isStandalone() || isDismissed() || !isLikelyPhone()) return;
  // Re-arm while any consent overlay is still open, so the banner lands right
  // after the consent gate / study selector closes rather than behind them.
  const overlayOpen = !!document.querySelector('.consent-overlay.show');
  if (overlayOpen) {
    scheduleTimer = window.setTimeout(tryShowScheduled, 2000);
    return;
  }
  showInstallPrompt();
}

// ── Persistent top banner ─────────────────────────────────────────────────

const DOWNLOAD_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';

function ensureInstallBanner() {
  let host = document.getElementById('pwaInstallHost');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'pwaInstallHost';
  host.className = 'pwa-install-host';
  document.body.appendChild(host);
  return host;
}

export function showInstallPrompt() {
  if (isStandalone() || isDismissed()) return;
  const host = ensureInstallBanner();
  host.innerHTML = `
    <div class="pwa-install" role="dialog" aria-label="Install this app">
      <span class="pwa-install-icon">${DOWNLOAD_ICON_SVG}</span>
      <span class="pwa-install-copy">
        <span class="pwa-install-title">Get the best experience</span>
        <span class="pwa-install-sub">Install this app to your Home Screen for a full-screen, distraction-free view.</span>
      </span>
      <button type="button" class="pwa-install-btn">Install</button>
      <button type="button" class="pwa-install-close" aria-label="Dismiss">&#x2715;</button>
    </div>
  `;
  const installBtn = host.querySelector('.pwa-install-btn');
  if (installBtn) installBtn.addEventListener('click', triggerInstall);
  const closeBtn = host.querySelector('.pwa-install-close');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    // The ✕ is a permanent dismissal — never nudge again.
    markDismissed();
    hideInstallBanner();
  });
  requestAnimationFrame(() => host.classList.add('show'));
}

function hideInstallBanner() {
  const host = document.getElementById('pwaInstallHost');
  if (!host) return;
  host.classList.remove('show');
  host.innerHTML = '';
}

// ── Install trigger ────────────────────────────────────────────────────────

export function triggerInstall() {
  if (deferredPrompt) {
    // Android/Chromium: fire the captured native prompt. Only an accepted
    // outcome marks dismissed — a dismissed prompt may want to nudge again.
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    try {
      promptEvent.prompt();
      const choice = promptEvent.userChoice;
      if (choice && typeof choice.then === 'function') {
        choice.then((result) => {
          if (result && result.outcome === 'accepted') {
            markDismissed();
            hideInstallBanner();
            hideUserGuideInstallButton();
          }
        }).catch(() => {});
      }
    } catch (_) {
      openInstallInstructions();
    }
    return;
  }
  // No captured prompt (iOS Safari, or browsers that never offered it): show
  // platform-detected how-to steps instead.
  openInstallInstructions();
}

// ── How-to instructions modal ──────────────────────────────────────────────

function buildInstructionSteps() {
  const ua = window.navigator.userAgent || '';
  const isIOS = isLikelyIOS();
  const isAndroid = /Android/.test(ua);
  let steps;
  if (isIOS) {
    steps = [
      'Tap the <strong>Share</strong> button in Safari’s toolbar (the square with an up arrow).',
      'Scroll down and tap <strong>Add to Home Screen</strong>.',
      'Keep <strong>Open as Web App</strong> switched on.',
      'Tap <strong>Add</strong> in the top-right corner.'
    ];
  } else if (isAndroid) {
    steps = [
      'Tap the <strong>⋮</strong> menu in Chrome’s toolbar.',
      'Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).',
      'Confirm by tapping <strong>Install</strong>.'
    ];
  } else {
    steps = [
      'Open your browser’s menu.',
      'Look for <strong>Install app</strong> or <strong>Add to Home Screen</strong>.',
      'Confirm to add it to your device.'
    ];
  }
  return steps
    .map((text, i) => `
      <li class="install-step">
        <span class="install-step-num">${i + 1}</span>
        <span class="install-step-text">${text}</span>
      </li>`)
    .join('');
}

export function openInstallInstructions() {
  // Opening the how-to auto-hides the banner so the modal backdrop isn't
  // showing through to it.
  hideInstallBanner();
  const overlay = document.getElementById('installInstructionsOverlay');
  if (!overlay) return;
  const body = document.getElementById('installInstructionsBody');
  if (body) body.innerHTML = `<ol class="install-steps">${buildInstructionSteps()}</ol>`;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeInstallInstructions() {
  const overlay = document.getElementById('installInstructionsOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.consent-overlay.show')) document.body.classList.remove('modal-open');
}

export function isInstallInstructionsOpen() {
  return !!document.getElementById('installInstructionsOverlay')?.classList.contains('show');
}

export function dontShowInstallAgain() {
  markDismissed();
  hideInstallBanner();
  hideUserGuideInstallButton();
  closeInstallInstructions();
}

// ── User-guide "Install app" button ────────────────────────────────────────
// Hidden once the app is installed (or the user has dismissed for good).

function hideUserGuideInstallButton() {
  const btn = document.getElementById('userGuideInstallBtn');
  if (btn) btn.style.display = 'none';
}
