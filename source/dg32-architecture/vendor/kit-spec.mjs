// kit-spec.mjs — deck-kit helpers re-cut at the design system's REAL pixel sizes.
//
// WHY THIS EXISTS. `assets/deck-kit.mjs` sets its type in artifact-tool pixels but uses the
// design system's POINT numbers as those pixel values — title 30, body 13, card heading 15,
// kicker 10, footer 9. artifact-tool is 1px = 0.75pt, so those render at 22.5 / 9.75 / 11.25 /
// 7.5 / 6.75 pt against a spec of 24-30 / 12-14 / 12-16 / 8-10 / 7-8 pt. Every one is under
// floor; the whole deck comes out about a quarter too small, which reads as bland and thin.
// The build reference names this exact trap ("Reading those numbers as pixels shrinks the
// whole deck by a third") — the kit then falls into it.
//
// These helpers keep the kit's geometry and primitives and only correct the type scale.
// Verified against `references/client-ready-pptx-design-system.md`, "Typography".

import { K, SERIF, tx, rect, roundRect, ellipse, sh, textH } from
  '/home/sheke/.claude/skills/vault-presales-pptx-pipeline/assets/deck-kit.mjs';

// pt -> px at artifact-tool's 1px = 0.75pt
export const PX = (pt) => Math.round(pt / 0.75);

export const T = {
  title:   PX(28),   // spec 24-30pt
  cover:   PX(44),
  sub:     PX(13),   // spec body 12-14pt
  kicker:  PX(9.5),  // spec 8-10pt
  foot:    PX(8),    // spec 7-8pt
  cardH:   PX(15),   // spec card heading 12-16pt
  body:    PX(13),   // spec body 12-14pt
  kpiNum:  PX(38),   // spec KPI 28-40pt
  kpiLab:  PX(10),
  kpiNote: PX(9),
  thead:   PX(9.5),
  tcell:   PX(11.5),
};

const FOOT = process.env.DECK_FOOTER || 'CLIENT · INITIATIVE · DATE';

export function footer(page, dark = false) {
  const color = dark ? '#8FA2B7' : K.gray;
  const line = dark ? '#23364C' : K.line;
  return [
    rect(48, 681, 1184, 1, line),
    tx(FOOT, 48, 690, 800, 20, { size: T.foot, bold: true, color }),
    tx(String(page).padStart(2, '0'), 1160, 690, 72, 20, { size: T.foot, bold: true, color, align: 'right' }),
  ];
}

export function header(kicker, title, subtitle, page, dark = false) {
  // ~62 chars fit on one line at T.title across 1160px. Past that the title wraps into
  // the subtitle band, so step the size down rather than let the two collide.
  const size = String(title).length > 60 ? T.title - 6 : T.title;
  return [
    tx(kicker.toUpperCase(), 48, 24, 800, 22, { size: T.kicker, bold: true, color: K.cyan }),
    tx(title, 48, 48, 1160, 56, { size, face: SERIF, bold: true, color: dark ? K.white : K.slate }),
    subtitle ? tx(subtitle, 48, 108, 1140, 30, { size: T.sub, color: dark ? '#A9BACD' : K.gray })
             : rect(0, 0, 1, 1, dark ? K.midnight : K.white),
    rect(48, 146, 1184, 2, dark ? K.cyan : K.slate),
    ...footer(page, dark),
  ];
}
export const headerDark = (k, t, s, p) => header(k, t, s, p, true);

export function card(x, y, w, h, title, body, accent = K.cyan, fill = K.white) {
  const bodyH = textH(body, w - 48, T.body, 1.5);
  const auto = 20 + 26 + 12 + bodyH + 22;
  const H = (h === 'auto' || h == null) ? auto : Math.max(h, auto);
  return [
    roundRect(x, y, w, H, fill, K.line, 1),
    rect(x, y, 6, H, accent),
    tx(title, x + 24, y + 20, w - 44, 28, { size: T.cardH, bold: true, color: K.slate }),
    tx(body, x + 24, y + 58, w - 48, bodyH + 8, { size: T.body, color: K.gray }),
  ];
}

export function kpi(x, y, w, num, label, note, color = K.cyan, h = 172) {
  return [
    roundRect(x, y, w, h, K.surface, K.line, 1),
    tx(num, x, y + 26, w, 64, { size: T.kpiNum, face: SERIF, bold: true, color, align: 'center' }),
    tx(label.toUpperCase(), x + 12, y + 96, w - 24, 22, { size: T.kpiLab, bold: true, color: K.slate, align: 'center' }),
    tx(note, x + 14, y + 122, w - 28, 40, { size: T.kpiNote, color: K.gray, align: 'center' }),
  ];
}

export function table(x, y, w, colspec, rows, opts = {}) {
  const { rowH = 46, headH = 40, highlight = -1 } = opts;
  const e = [rect(x, y, w, headH, K.midnight)];
  let hx2 = x;
  colspec.forEach((c) => {
    e.push(tx(c.t.toUpperCase(), hx2 + 14, y + 12, c.w - 20, 22, { size: T.thead, bold: true, color: K.white, align: c.a || 'left' }));
    hx2 += c.w;
  });
  rows.forEach((r, ri) => {
    const ry = y + headH + ri * rowH;
    const hot = ri === highlight;
    e.push(rect(x, ry, w, rowH, hot ? K.softCyan : (ri % 2 ? K.surface : K.white), K.line, 1));
    if (hot) e.push(rect(x, ry, 5, rowH, K.cyan));
    let rx = x;
    r.forEach((cell, ci) => {
      const col = colspec[ci];
      const c = hot ? K.slate : (ci === 0 ? K.slate : K.gray);
      e.push(tx(String(cell), rx + 14, ry + 11, col.w - 22, rowH - 16,
        { size: T.tcell, bold: hot || ci === 0, color: c, align: col.a || 'left' }));
      rx += col.w;
    });
  });
  return e;
}

export function chain(x, y, w, nodes, opts = {}) {
  const { nodeW = null, nodeH = 104, geom = 'flowChartProcess' } = opts;
  const nw = nodeW ?? (w - (nodes.length - 1) * 56) / nodes.length;
  const gap = (w - nodes.length * nw) / Math.max(1, nodes.length - 1);
  const e = [];
  nodes.forEach(([title, body, color, g], i) => {
    const nx = x + i * (nw + gap);
    e.push(sh(g || geom, nx, y, nw, nodeH, K.white, color, 2));
    e.push(rect(nx, y, nw, 5, color));
    e.push(tx(title, nx + 14, y + 20, nw - 28, 26, { size: PX(13), bold: true, color: K.slate, align: 'center' }));
    e.push(tx(body, nx + 14, y + 50, nw - 28, 48, { size: PX(10.5), color: K.gray, align: 'center' }));
    if (i < nodes.length - 1) {
      e.push(sh('rightArrow', nx + nw + gap / 2 - 17, y + nodeH / 2 - 11, 34, 22, K.cyan, K.cyan, 1));
    }
  });
  return e;
}

export function rail(x, y, w, nodes, opts = {}) {
  const { dark = false } = opts;
  const titleC = dark ? K.white : K.slate;
  const subC = dark ? '#8FA2B7' : K.gray;
  const step = w / nodes.length;
  const e = [rect(x + 20, y + 52, w - 40, 2, dark ? '#23364C' : K.line)];
  nodes.forEach(([chip, title, sub, color, filled], i) => {
    const cx2 = x + i * step;
    e.push(rect(cx2, y, step - 20, 30, filled ? color : (dark ? '#12243A' : K.surface), color, 1));
    e.push(tx(chip.toUpperCase(), cx2, y + 7, step - 20, 20, { size: PX(9), bold: true, color: filled ? K.white : color, align: 'center' }));
    e.push(ellipse(cx2 + (step - 20) / 2 - 8, y + 45, 16, 16, filled ? color : (dark ? K.midnight : K.white), color, 2));
    e.push(tx(title, cx2 - 8, y + 74, step - 4, 26, { size: PX(13), bold: true, color: titleC, align: 'center' }));
    e.push(tx(sub, cx2 - 8, y + 102, step - 4, 44, { size: PX(10), color: subC, align: 'center' }));
  });
  return e;
}

export const SRC = (t, x = 48, y = 652) => tx(t, x, y, 1100, 18, { size: T.foot, color: K.gray, italic: true });
