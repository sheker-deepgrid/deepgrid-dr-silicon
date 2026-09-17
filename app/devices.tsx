'use client';
import {useEffect} from 'react';

// Three scroll devices beyond the site's entrance reveal, so a section is not just the previous
// section shown again. Each is selector-driven off the existing markup: no view changes its DOM,
// its copy or its order to get one. All three honour reduced motion by rendering the final state.
//
//   count  numbers climb to their value when their block arrives (headline metrics, loop budget,
//          fetch-bound facts, package facts). Only values already printed in the markup are ever
//          shown, so nothing here can invent a figure.
//   draw   the Fmax bars and the loop-budget stack grow from their own baseline instead of being
//          present at full length, which is what makes a chart read as measured rather than drawn.
//   rail   the roadmap travels sideways under a held heading. Chronology reads as lateral travel;
//          stacking it vertically reads as an argument, which a roadmap is not.

const idle = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Watch a set of elements and call back once each has crossed the reveal line. A scroll sweep, not
// an IntersectionObserver, for the reason given in motion.tsx: a fast fling can carry a block past
// between two observer updates and leave it in its pre-state for good.
function sweep(nodes: HTMLElement[], hit: (el: HTMLElement) => void, line = 0.9) {
  let pending = nodes, frame = 0;
  const run = () => {
    frame = 0;
    pending = pending.filter(el => {
      if (!el.isConnected) return false;
      if (el.getBoundingClientRect().top > innerHeight * line) return true;
      hit(el); return false;
    });
    if (!pending.length) removeEventListener('scroll', on);
  };
  const on = () => { if (!frame) frame = requestAnimationFrame(run); };
  addEventListener('scroll', on, {passive: true});
  addEventListener('resize', on);
  run();
  return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(frame); };
}

// --- count -------------------------------------------------------------------------------------
// Values are read back out of the DOM, so the number that lands is the number the page already
// stated. A value with no digits, or one already counted, is left alone.
const COUNT = ['.metrics-strip strong', '.dr-stats strong', '.dr-factcards>div>strong', '.dr-stats-grid strong']
  .map(s => 'main ' + s).join(',');
const NUM = /^(\D*?)([\d,]+(?:\.\d+)?)([\s\S]*)$/;

export function useCount(key: string) {
  useEffect(() => {
    const soft = reduced();
    const targets: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(COUNT)) {
      const m = NUM.exec(el.textContent || '');
      if (!m || el.dataset.ct !== undefined) continue;
      const to = Number(m[2].replace(/,/g, ''));
      const grouped = m[2].includes(',');
      // a bare four-digit value with no separator is a year or an identifier, never a quantity
      if (!isFinite(to) || to <= 0 || (!grouped && to >= 1000)) continue;
      el.dataset.ct = ''; el.dataset.ctPre = m[1]; el.dataset.ctPost = m[3];
      el.dataset.ctTo = String(to); el.dataset.ctDp = String((m[2].split('.')[1] || '').length);
      el.dataset.ctGrp = grouped ? '1' : '';
      // hold the final width so the row cannot reflow while the digits change
      el.style.setProperty('font-variant-numeric', 'tabular-nums');
      if (!soft) el.textContent = m[1] + (0).toFixed(Number(el.dataset.ctDp)) + m[3];
      targets.push(el);
    }
    if (soft || !targets.length) return;
    const stop = sweep(targets, el => {
      const to = Number(el.dataset.ctTo), dp = Number(el.dataset.ctDp);
      const pre = el.dataset.ctPre || '', post = el.dataset.ctPost || '';
      const grouped = el.dataset.ctGrp === '1';
      const t0 = performance.now(), ms = 900;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
        const v = to * e;
        el.textContent = pre + (grouped ? Math.round(v).toLocaleString('en-US') : v.toFixed(dp)) + post;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    return stop;
  }, [key]);
}

// --- draw --------------------------------------------------------------------------------------
// A class on the container, the growth in CSS, so the inline widths the charts already carry stay
// the single source of each bar's length.
const DRAW = ['.dr-chart-plot', '.dr-stack'].map(s => 'main ' + s).join(',');

export function useDraw(key: string) {
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>(DRAW)].filter(el => !el.classList.contains('is-drawn'));
    if (!nodes.length) return;
    if (reduced()) { nodes.forEach(el => el.classList.add('is-drawn')); return; }
    nodes.forEach(el => el.classList.add('will-draw'));
    return sweep(nodes, el => el.classList.add('is-drawn'), 0.86);
  }, [key]);
}

// --- rail --------------------------------------------------------------------------------------
// The roadmap held under its heading and travelled sideways, on viewports with the width to make
// lateral travel legible. Everywhere else, and under reduced motion, it stays the grid it already
// is: the same four items, same order, fully readable without scrolling.
const RAIL = '(min-width: 1100px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)';

export function useRail(key: string) {
  useEffect(() => {
    const wraps = Array.from(document.querySelectorAll<HTMLElement>('main .dr-rail'));
    if (!wraps.length) return;
    const mq = matchMedia(RAIL);
    let raf = 0;
    const tick = () => {
      raf = 0;
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 59;
      wraps.forEach(wrap => {
        const track = wrap.querySelector<HTMLElement>('.dr-rail-content, .dr-roadmap');
        if (!track) return;
        const r = wrap.getBoundingClientRect();
        const travel = Math.max(1, wrap.offsetHeight - (innerHeight - navH));
        const p = Math.min(1, Math.max(0, (navH - r.top) / travel));
        const clip = wrap.querySelector<HTMLElement>('.dr-rail-track') || track;
        const over = Math.max(0, track.scrollWidth - clip.clientWidth);
        track.style.setProperty('--rail-x', (-over * p) + 'px');
        wrap.style.setProperty('--rail-p', String(p));
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const apply = () => {
      removeEventListener('scroll', onScroll);
      const on = mq.matches;
      wraps.forEach(wrap => {
        wrap.classList.toggle('is-railed', on);
        const track = wrap.querySelector<HTMLElement>('.dr-rail-content, .dr-roadmap');
        if (!on && track) {
          track.style.removeProperty('--rail-x');
          wrap.style.removeProperty('--rail-p');
        }
      });
      if (on) {
        addEventListener('scroll', onScroll, {passive: true});
        requestAnimationFrame(tick);
      }
    };
    idle(apply);
    mq.addEventListener('change', apply);
    addEventListener('resize', onScroll);
    return () => {
      mq.removeEventListener('change', apply);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [key]);
}
