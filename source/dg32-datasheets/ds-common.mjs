// Shared pieces for the DG32 datasheet and tape-in decks: notes loader, cover, close, card grid,
// KPI row and thesis band. Built on the vault deck-kit primitives, kit-spec type sizes and the
// DG32 architecture deck components.
import { readFile } from 'node:fs/promises';
import { K, SERIF, tx, rect, roundRect, ellipse, addSlide } from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, footer } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';
import { MUTED_DARK, card2, cardHeight, stack, kpiS, closeFooter } from '/home/sheke/content-ideas/runs/2026-09-13-dg32-architecture-package/dg32-deck-kit.mjs';

export async function loadNotes(run) {
  const pack = await readFile(`${run}/story-architect-pack.md`, 'utf8');
  const narration = {};
  for (const m of pack.split('## 9. Narration')[1].matchAll(/^(\d+)\. (.+)$/gm)) narration[Number(m[1])] = m[2].trim();
  return (n) => narration[n] || '';
}

// QFN-64 package with a die; variant 'two' splits the die into control and compute domains.
export function packageMotif(variant = 'lite', px0 = 850, py0 = 118, S = 320) {
  const e = [rect(px0, py0, S, S, '#12243A', K.cyan, 2)];
  for (let i = 0; i < 16; i++) {
    const t = py0 + 24 + i * ((S - 48) / 15) - 5, l = px0 + 24 + i * ((S - 48) / 15) - 5;
    e.push(rect(px0 - 16, t, 14, 10, '#8DB4D4'), rect(px0 + S + 2, t, 14, 10, '#8DB4D4'), rect(l, py0 - 16, 10, 14, '#8DB4D4'), rect(l, py0 + S + 2, 10, 14, '#8DB4D4'));
  }
  e.push(ellipse(px0 + 20, py0 + 20, 14, 14, K.cyan));
  if (variant === 'two') {
    const dx = px0 + 52, dy = py0 + 70, dw = 216, dh = 180;
    e.push(rect(dx, dy, dw, dh, '#1E3A55', K.paleBlue, 1), rect(dx + 10, dy + 10, 88, dh - 20, '#244A6B', K.cyan, 1), rect(dx + 118, dy + 10, 88, dh - 20, '#1F4F52', K.teal, 1));
    for (let r = 0; r < 3; r++) e.push(rect(dx + 102, dy + 40 + r * 40, 12, 18, K.paleBlue));
    e.push(rect(dx + 22, dy + 24, 64, 36, '#2B5277'), rect(dx + 22, dy + 70, 64, 10, K.cyan));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) e.push(rect(dx + 130 + c * 34, dy + 24 + r * 30, 28, 22, '#2E6B6D'));
  } else {
    const dw = 132, dh = 205, dx = px0 + (S - dw) / 2, dy = py0 + (S - dh) / 2;
    e.push(rect(dx, dy, dw, dh, '#1E3A55', K.paleBlue, 1), rect(dx + 12, dy + 14, 50, 62, '#2B5277'), rect(dx + 70, dy + 14, 50, 62, '#2B5277'), rect(dx + 12, dy + 84, 108, 10, K.cyan));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) e.push(rect(dx + 12 + c * 28, dy + 104 + r * 22, 22, 16, '#35607F'));
    e.push(rect(dx + 12, dy + 174, 50, 20, K.teal), rect(dx + 70, dy + 174, 50, 20, '#2B5277'));
  }
  return e;
}

export function coverSlide({ kicker, title, subtitle, strip, motif = 'lite', motifLabel, note, notes }) {
  const sw = 1184 / strip.length;
  addSlide([
    tx(kicker, 48, 70, 760, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx(title, 48, 112, 760, 170, { size: PX(40), face: SERIF, bold: true, color: K.white }),
    rect(48, 292, 120, 4, K.cyan),
    tx(subtitle, 48, 314, 700, 64, { size: T.sub, color: MUTED_DARK }),
    ...packageMotif(motif),
    tx(motifLabel, 830, 468, 360, 20, { size: PX(9), bold: true, color: MUTED_DARK, align: 'center' }),
    ...strip.flatMap(([n, l], i) => [
      i ? rect(48 + i * sw, 520, 1, 92, '#23364C') : rect(0, 0, 1, 1, K.midnight),
      tx(n, 48 + i * sw + (i ? 24 : 0), 520, sw - 32, 52, { size: PX(25), face: SERIF, bold: true, color: K.cyan }),
      tx(l.toUpperCase(), 48 + i * sw + (i ? 24 : 0), 578, sw - 32, 22, { size: PX(10), bold: true, color: K.white }),
    ]),
    tx(note, 48, 640, 1100, 20, { size: T.foot, color: MUTED_DARK, italic: true }),
    ...footer(1, true),
  ], { background: K.midnight, notes });
}

export function closeSlide({ kicker, title, body, takeaways, label, page, notes }) {
  const [cards] = stack(560, 108, 672, takeaways, 16);
  addSlide([
    rect(0, 0, 512, 720, K.midnight),
    tx(kicker, 48, 64, 400, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx(title, 48, 104, 420, 200, { size: PX(34), face: SERIF, bold: true, color: K.white }),
    rect(48, 318, 120, 4, K.cyan),
    tx(body, 48, 344, 420, 150, { size: T.body, color: MUTED_DARK }),
    tx('THREE THINGS TO REMEMBER', 560, 64, 672, 22, { size: T.kicker, bold: true, color: K.slate }),
    ...cards,
    ...closeFooter(label, page),
  ], { notes });
}

// cards laid out in columns with equal row heights; items: [title, body, accent]
export function cardGrid(x, y, w, cols, items, { gapX = 28, gapY = 14 } = {}) {
  const cw = (w - (cols - 1) * gapX) / cols, e = [];
  let cy = y;
  for (let r = 0; r < items.length; r += cols) {
    const row = items.slice(r, r + cols);
    const h = Math.max(...row.map(([, body]) => cardHeight(cw, body)));
    row.forEach(([title, body, accent], i) => {
      const cx = x + i * (cw + gapX);
      e.push(roundRect(cx, cy, cw, h, K.white, K.line, 1), ...card2(cx, cy, cw, title, body, accent).slice(1));
    });
    cy += h + gapY;
  }
  return [e, cy];
}

// items: [num, label, note, opts]
export function kpiRow(x, y, w, h, items, gap = 24) {
  const iw = (w - (items.length - 1) * gap) / items.length;
  return items.flatMap(([num, label, note, opts = {}], i) => kpiS(x + i * (iw + gap), y, iw, h, num, label, note, opts));
}

export function band(x, y, w, h, text) {
  return [rect(x, y, w, h, K.midnight), rect(x, y, 6, h, K.cyan),
    tx(text, x + 32, y + 22, w - 64, h - 40, { size: PX(15), face: SERIF, bold: true, color: K.white, anchor: 'middle' })];
}
