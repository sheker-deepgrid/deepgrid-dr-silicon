// Shared DG32 deck components, built from vault deck-kit primitives with kit-spec type sizes.
// The DG32-LITE builder carries the same helpers inline; this module serves the DG32-2DOM builder.
import { K, SERIF, tx, rect, roundRect, ellipse, textH } from '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';
import { PX, T, footer } from '/home/sheke/content-ideas/runs/2026-08-22-design-video-brief/kit-spec.mjs';

export const MUTED_DARK = '#A9BACD';
// Cyan and teal fail 4.5:1 as small text on white, so text and filled labels use darker steps.
export const CYAN_TXT = '#0077A3', TEAL_DARK = '#07686A';

export const srcLine = (t, dark = false) => tx(t, 48, 656, 1100, 18, { size: T.foot, color: dark ? MUTED_DARK : K.gray, italic: true });

export function hdr(kicker, title, subtitle, page, dark = false) {
  return [
    tx(kicker.toUpperCase(), 48, 24, 800, 22, { size: T.kicker, bold: true, color: dark ? K.cyan : CYAN_TXT }),
    tx(title, 48, 48, 1160, 56, { size: T.title, face: SERIF, bold: true, color: dark ? K.white : K.slate }),
    tx(subtitle, 48, 108, 1140, 30, { size: T.sub, color: dark ? MUTED_DARK : K.gray }),
    rect(48, 146, 1184, 2, dark ? K.cyan : K.slate),
    ...footer(page, dark),
  ];
}

// card body measured at 85% of the box width: the estimator under-counts wraps near a line boundary
const bodyH = (w, body) => textH(body, Math.floor((w - 48) * 0.85), T.body, 1.5);
export const cardHeight = (w, body) => 20 + 26 + 12 + bodyH(w, body) + 22;

export function card2(x, y, w, title, body, accent = K.cyan, fill = K.white) {
  const H = cardHeight(w, body);
  return [
    roundRect(x, y, w, H, fill, K.line, 1),
    rect(x, y, 6, H, accent),
    tx(title, x + 24, y + 20, w - 44, 28, { size: T.cardH, bold: true, color: K.slate }),
    tx(body, x + 24, y + 58, w - 48, bodyH(w, body) + 8, { size: T.body, color: K.gray }),
  ];
}

// stack auto-height cards vertically; returns [elements, nextY]
export function stack(x, y, w, items, gap = 14) {
  const e = []; let cy = y;
  for (const [title, body, accent, fill] of items) {
    e.push(...card2(x, cy, w, title, body, accent, fill));
    cy += cardHeight(w, body) + gap;
  }
  return [e, cy];
}

export function kpiS(x, y, w, h, num, label, note, { color = K.cyan, numPt = 30, dark = false } = {}) {
  const n = PX(numPt);
  if (!dark && color === K.cyan) color = CYAN_TXT;
  return [
    roundRect(x, y, w, h, dark ? '#12243A' : K.surface, dark ? '#23364C' : K.line, 1),
    tx(num, x + 12, y + 16, w - 24, n + 14, { size: n, face: SERIF, bold: true, color, align: 'center' }),
    tx(label.toUpperCase(), x + 12, y + 20 + n + 12, w - 24, 22, { size: PX(10), bold: true, color: dark ? K.white : K.slate, align: 'center' }),
    tx(note, x + 14, y + 20 + n + 38, w - 28, Math.max(24, h - (n + 64)), { size: PX(9.5), color: dark ? MUTED_DARK : K.gray, align: 'center' }),
  ];
}

export function fact(x, y, w, n, title, body, color = TEAL_DARK) {
  return [
    ellipse(x, y, 34, 34, color),
    tx(String(n), x, y + 6, 34, 22, { size: PX(12), bold: true, color: K.white, align: 'center' }),
    tx(title, x + 48, y + 2, w - 48, 26, { size: PX(13), bold: true, color: K.slate }),
    tx(body, x + 48, y + 32, w - 48, 62, { size: PX(11.5), color: K.gray }),
  ];
}

export function proportionBar(x, y, w, h, segs) {
  const total = segs.reduce((a, s) => a + s[1], 0);
  let cx = x; const e = [];
  for (const [label, val, color] of segs) {
    const sw = (val / total) * w;
    e.push(rect(cx, y, sw, h, color));
    if (label) e.push(tx(label, cx + 12, y + h / 2 - 12, Math.max(10, sw - 20), 24, { size: PX(12), bold: true, color: K.white }));
    cx += sw;
  }
  return e;
}

export function tableCols(x, y, w, cols, rows, { rowH = 52, headH = 40, hotCol = -1 } = {}) {
  const e = [rect(x, y, w, headH, K.midnight)];
  let hx = x;
  cols.forEach((c, ci) => {
    if (ci === hotCol) e.push(rect(hx, y, c.w, headH, K.cyan));
    e.push(tx(c.t.toUpperCase(), hx + 14, y + 11, c.w - 20, 22, { size: PX(9.5), bold: true, color: ci === hotCol ? K.midnight : K.white }));
    hx += c.w;
  });
  rows.forEach((r, ri) => {
    const ry = y + headH + ri * rowH;
    e.push(rect(x, ry, w, rowH, ri % 2 ? K.surface : K.white, K.line, 1));
    let rx = x;
    r.forEach((cell, ci) => {
      const col = cols[ci];
      if (ci === hotCol) e.push(rect(rx, ry, col.w, rowH, K.softCyan, K.line, 1));
      e.push(tx(String(cell), rx + 14, ry + 8, col.w - 22, rowH - 12,
        { size: PX(11), bold: ci === 0 || ci === hotCol, color: ci === 0 || ci === hotCol ? K.slate : K.gray, anchor: 'middle' }));
      rx += col.w;
    });
  });
  return e;
}

// block pill inside a zone
export const block = (x, y, w, h, t, c) => [roundRect(x, y, w, h, K.white, c, 1), tx(t, x + 14, y + (h - 26) / 2, w - 28, 26, { size: PX(11.5), bold: true, color: K.slate, anchor: 'middle' })];

// two-line close slide footer (dark panel left, light right)
export function closeFooter(label, page) {
  return [
    rect(48, 681, 420, 1, '#23364C'), rect(560, 681, 672, 1, K.line),
    tx(label, 48, 690, 440, 20, { size: T.foot, bold: true, color: '#8FA2B7' }),
    tx(String(page).padStart(2, '0'), 1160, 690, 72, 20, { size: T.foot, bold: true, color: K.gray, align: 'right' }),
  ];
}
