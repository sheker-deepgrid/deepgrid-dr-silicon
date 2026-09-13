'use client';
import {useEffect} from 'react';

// Scroll behaviour for the whole site, kept out of the views so the markup stays content.
// useScrollVars publishes the navigation height (for anything that sticks under it) and the
// page progress (for the hairline on the navigation bar). useReveal gives existing blocks one
// restrained entrance: a 14px rise and fade, staggered 60ms among siblings, once, when the block
// is actually in view. Under reduced motion it is a short fade with no movement.

const REVEAL = ['.section-head', '.thesis-heading', '.dr-sec-head', '.dr-arch-intro', '.spec-grid', '.dr-explained>article',
  '.dr-steps>li', '.dr-flow', '.dr-callout', '.dr-diagram', '.dr-costbars', '.dr-padplan', '.dr-ladder>div', '.dr-notclaimed',
  '.dr-cards>*', '.dr-apps>div', '.dr-part', '.dr-pkg-card', '.dr-pkg-mini-card', '.dr-roadmap>li', '.dr-factcards>div',
  '.dr-package', '.dr-pinout>.table-scroll', '.dr-two-tables>*', '.dr-fixed>div', '.dr-leadgap>div', '.dr-loop>li',
  '.dr-budget>*', '.dr-fmax>*', '.dr-compare', '.dr-lib-group', '.dr-lib-film', '.dr-lib-deck', '.table-scroll'].map(s => 'main ' + s).join(',');

export function useScrollVars() {
  useEffect(() => {
    const root = document.documentElement, nav = document.querySelector<HTMLElement>('.main-nav');
    let raf = 0;
    const progress = () => { raf = 0; const max = root.scrollHeight - innerHeight; nav?.style.setProperty('--page-p', String(max > 0 ? Math.min(1, scrollY / max) : 0)); };
    const measure = () => { if (nav) root.style.setProperty('--nav-h', nav.offsetHeight + 'px'); progress(); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(progress); };
    measure();
    const ro = new ResizeObserver(measure); if (nav) ro.observe(nav); ro.observe(document.body);
    addEventListener('scroll', onScroll, {passive: true});
    return () => { removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);
}

// A sweep on scroll rather than an IntersectionObserver: a fast fling on a slow device can carry a
// block through the viewport between two observer updates and leave it hidden for good. The sweep
// reveals every pending block whose top has crossed 88% of the viewport, including any already
// scrolled past, so nothing can be skipped.
export function useReveal(key: string) {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('rv-on');
    let pending: HTMLElement[] = [], frame = 0;
    const timers: number[] = [];
    const sweep = () => {
      frame = 0;
      const line = innerHeight * 0.88, counts = new Map<Element, number>();
      pending = pending.filter(el => {
        if (!el.isConnected) return false;
        const r = el.getBoundingClientRect();
        if (r.top > line) return true;
        if (r.bottom < 0) { el.classList.add('rv-in', 'rv-done'); return false; }
        const parent = el.parentElement!, i = counts.get(parent) || 0;
        counts.set(parent, i + 1);
        const delay = reduce ? 0 : Math.min(i, 6) * 60;
        el.style.setProperty('--rv-d', delay + 'ms');
        el.classList.add('rv-in');
        // hand transitions back to the element once the entrance is over, so hover and press stay fast
        timers.push(window.setTimeout(() => el.classList.add('rv-done'), delay + 700));
        return false;
      });
      if (!pending.length) removeEventListener('scroll', onScroll);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(sweep); };
    const start = requestAnimationFrame(() => {
      for (const el of document.querySelectorAll<HTMLElement>(REVEAL)) {
        if (el.dataset.rv !== undefined || el.closest('[data-rv-skip]') || el.parentElement?.closest('[data-rv]')) continue;
        el.dataset.rv = ''; pending.push(el);
      }
      addEventListener('scroll', onScroll, {passive: true});
      addEventListener('resize', onScroll);
      sweep();
    });
    return () => { cancelAnimationFrame(start); cancelAnimationFrame(frame); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); timers.forEach(clearTimeout); };
  }, [key]);
}
