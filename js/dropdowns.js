// Smooth, accordion-style open/close animation for native <details> dropdowns (e.g. certifications).
//  - Opening a dropdown closes its already-open siblings (same parent) at the same time.
//  - Closing a dropdown also resets its nested dropdowns, so it re-opens in its initial state.
// Coupled with index.css: [data-closing] drives the chevron/summary state while the close
// animation runs, because [open] is only removed once the animation ends.
import { qs, qsa, on } from './dom-utils.js';

const DURATION_MS = 300; // keep in sync with the .cert-chevron transition in index.css
const EASING = 'ease';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new WeakMap(); // <details> -> active Animation

const summaryOf = (details) => qs(':scope > summary', details);
const heightOf = (el) => el.getBoundingClientRect().height;
const isExpanded = (details) => details.open && !details.hasAttribute('data-closing');

function siblingsOf(details, selector) {
  return Array.from(details.parentElement.children).filter(el => el !== details && el.matches(selector));
}

function ancestorsOf(details) {
  const ancestors = [];
  for (let el = details.parentElement.closest('details'); el; el = el.parentElement.closest('details')) {
    ancestors.push(el);
  }
  return ancestors;
}

// ---- Animation helpers ------------------------------------------------------

function release(details) {
  runningAnimations.delete(details);
  details.style.overflow = '';
}

function stopAnimation(details) {
  runningAnimations.get(details)?.cancel();
  release(details);
}

function animateHeight(details, fromPx, toPx, onFinish) {
  details.style.overflow = 'hidden'; // clip the content while the height animates
  const animation = details.animate(
    { height: [`${fromPx}px`, `${toPx}px`] },
    { duration: DURATION_MS, easing: EASING, fill: 'forwards' } // hold the end height until the final state is set
  );
  runningAnimations.set(details, animation);
  animation.onfinish = () => {
    onFinish?.();        // set the final state first...
    animation.cancel();  // ...then drop the held height, so the old height never flashes for a frame
    release(details);
  };
}

// ---- State changes ----------------------------------------------------------

function collapse(details) {
  details.open = false;
  details.removeAttribute('data-closing');
  // Nested dropdowns are hidden now: reset them so they start closed next time
  qsa('details[open]', details).forEach(nested => {
    stopAnimation(nested);
    nested.open = false;
    nested.removeAttribute('data-closing');
  });
}

function open(details) {
  const fromPx = heightOf(details); // measured first so a click mid-animation continues from here
  stopAnimation(details);
  details.removeAttribute('data-closing');
  details.open = true;
  if (!reducedMotion.matches) animateHeight(details, fromPx, heightOf(details));
}

function close(details) {
  const fromPx = heightOf(details);
  stopAnimation(details);
  if (reducedMotion.matches) return collapse(details);
  details.setAttribute('data-closing', '');
  animateHeight(details, fromPx, heightOf(summaryOf(details)), () => collapse(details));
}

// ---- Events -----------------------------------------------------------------

function handleClick(event, details, selector) {
  event.preventDefault();
  const ancestors = ancestorsOf(details);
  if (ancestors.some(a => a.hasAttribute('data-closing'))) return; // parent is collapsing
  ancestors.forEach(a => runningAnimations.get(a)?.finish());      // a parent still opening must not clip us

  if (isExpanded(details)) return close(details);
  siblingsOf(details, selector).filter(isExpanded).forEach(sibling => close(sibling));
  open(details);
}

export function initAnimatedDetails(selector) {
  qsa(selector).forEach(details => {
    on(summaryOf(details), 'click', (event) => handleClick(event, details, selector));
  });
}
