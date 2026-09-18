// Browser gate for the DG32 site. Run it on a local build or the live URL after every deploy.
//
//   PLAYWRIGHT=/path/to/playwright/index.mjs node scripts/verify-site.mjs [url] [screenshot dir]
//
// PLAYWRIGHT falls back to the bare 'playwright' import. Exit 1 on any failure.
//
// What it proves, and why each check exists:
// - Every view and architecture tab fits at 1440 and 390 px, with no broken image, failed request,
//   console error, visible em dash, board-design guidance or internal core name.
// - Every reveal target finished: revealed class present and computed opacity at 1 after a
//   scroll-through. A screenshot cannot tell a block that faded in from one that was never hidden,
//   and an observer-based reveal once left three cards invisible on one view only.
// - Each of the five packages loads its film at 1920 wide with a captions track, chapters, slide
//   thumbnails and a slide image, and its deck and captions download.
// - The fault trace pins under the navigation and steps 0,0,1,2,3,4 at six positions; the rail
//   jumps; phones and reduced motion get the unpinned final state with every step visible.
// - Architecture tabs stick under the navigation and a switch returns to the section top; both
//   diagrams render at native width; the right-edge hint clears at the end of the scroll.
// Scripted scrolls use behavior 'instant': the site sets scroll-behavior: smooth, and an animated
// scrollTo makes every position measured after it wrong.
import {mkdirSync} from 'node:fs';
const pw = await import(process.env.PLAYWRIGHT || 'playwright');
const {chromium} = pw.chromium ? pw : pw.default;
const BASE = process.argv[2] || 'http://127.0.0.1:8768/deepgrid-dr-silicon/';
const OUT = process.argv[3] || 'verify-shots'; mkdirSync(OUT, {recursive: true});
const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const fails = [], errors = [], failed = [];
const fail = m => { fails.push(m); console.log('  FAIL', m); };
const watch = (p, tag) => {
  p.on('pageerror', e => errors.push(`${tag} ${e}`));
  p.on('console', m => { if (m.type() === 'error') errors.push(`${tag} ${m.text()}`); });
  p.on('response', r => { if (r.status() >= 400) failed.push(`${tag} ${r.status()} ${r.url()}`); });
};
const settleFrames = p => p.evaluate(() => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(res)))));
const instant = (p, y) => p.evaluate(v => scrollTo({top: v, behavior: 'instant'}), y);
const navH = p => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0);

// 1. views
const routes = ['overview', 'library', 'family', 'architecture', 'architecture?chip=2dom', 'architecture?chip=tapein', 'control', 'pinout', 'roadmap'];
for (const [tag, viewport] of [['desktop', {width: 1440, height: 900}], ['phone', {width: 390, height: 844}]]) {
  const p = await b.newPage({viewport}); watch(p, tag);
  for (const r of routes) {
    await p.goto(BASE + '#' + r, {waitUntil: 'networkidle'}); await p.waitForTimeout(600);
    // A hash change applies its scroll reset two frames later. Under a starved renderer those frames
    // can arrive after the walk has started, snapping the page back to the top so the walk measured
    // the previous position. Wait for three frames to have actually run before walking.
    await settleFrames(p);
    await p.evaluate(async () => { for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) { scrollTo({top: y, behavior: 'instant'}); await new Promise(res => setTimeout(res, 70)); } await new Promise(res => setTimeout(res, 1200)); });
    const m = await p.evaluate(() => {
      const text = document.querySelector('main').innerText, targets = [...document.querySelectorAll('[data-rv]')];
      return {fits: document.documentElement.scrollWidth === document.documentElement.clientWidth, targets: targets.length,
        unrevealed: targets.filter(e => !e.classList.contains('rv-in') || parseFloat(getComputedStyle(e).opacity) < 0.99).length,
        broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
        emdash: text.includes('—'), board: /board must respect|shunt amplifier|Route it to the gate-driver/i.test(text), coreName: /DgridRiscv/i.test(text),
        diagrams: [...document.querySelectorAll('.dr-diagram-body img')].map(i => [i.naturalWidth, i.getAttribute('width')])};
    });
    console.log(tag.padEnd(8), r.padEnd(26), m.fits ? 'fits' : 'OVERFLOW', `revealed ${m.targets - m.unrevealed}/${m.targets}`);
    if (!m.fits) fail(`${tag} ${r}: page scrolls sideways`);
    if (m.unrevealed) fail(`${tag} ${r}: ${m.unrevealed} block(s) never finished revealing`);
    if (m.broken.length) fail(`${tag} ${r}: broken images ${m.broken}`);
    if (m.emdash) fail(`${tag} ${r}: visible em dash`);
    if (m.board) fail(`${tag} ${r}: board-design guidance present`);
    if (m.coreName) fail(`${tag} ${r}: internal core name present`);
    for (const [nat, attr] of m.diagrams) if (String(nat) !== attr) fail(`${tag} ${r}: diagram renders ${nat}px, expected ${attr}px`);
  }
  await p.close();
}

// 2. packages
{
  const p = await b.newPage({viewport: {width: 1440, height: 900}}); watch(p, 'packages');
  for (const id of ['lite', '2dom', 'lite-datasheet', '2dom-datasheet', 'lite-tapein']) {
    await p.goto(BASE + '#library?pkg=' + id + '&slide=2', {waitUntil: 'networkidle'}); await p.waitForTimeout(800);
    const r = await p.evaluate(async () => {
      const v = document.querySelector('video');
      await new Promise(res => v.readyState >= 1 ? res() : v.addEventListener('loadedmetadata', res, {once: true}));
      const img = document.querySelector('.dr-deck-stage img');
      const heads = await Promise.all([...document.querySelectorAll('a[download]')].map(a => fetch(a.href, {method: 'HEAD'}).then(x => x.status)));
      return {width: v.videoWidth, duration: Math.round(v.duration), tracks: v.textTracks.length, chapters: document.querySelectorAll('.dr-chapters li').length,
        thumbs: document.querySelectorAll('.dr-thumbs button').length, slide: img.complete && img.naturalWidth > 0, downloads: heads};
    });
    console.log('package ', id.padEnd(16), JSON.stringify(r));
    if (r.width !== 1920 || r.tracks < 1 || !r.chapters || !r.thumbs || !r.slide) fail(`package ${id}: film, captions, chapters or slides missing`);
    if (!r.downloads.length || r.downloads.some(s => s !== 200)) fail(`package ${id}: downloads ${r.downloads}`);
  }
  await p.close();
}

// 3. fault trace
{
  const p = await b.newPage({viewport: {width: 1440, height: 900}}); watch(p, 'fault');
  await p.goto(BASE + '#overview', {waitUntil: 'networkidle'}); await p.waitForTimeout(900);
  const nh = await navH(p);
  const g = await p.evaluate(() => { const w = document.querySelector('.dr-fault'), r = w.getBoundingClientRect(); return {pinned: w.classList.contains('is-pinned'), top: r.top + scrollY, height: r.height}; });
  if (!g.pinned) fail('fault trace is not pinned at 1440x900');
  const travel = g.height - (900 - nh), steps = [];
  for (const [i, f] of [0, 0.19, 0.39, 0.59, 0.79, 1].entries()) {
    await instant(p, g.top - nh + travel * f); await p.waitForTimeout(600);
    const s = await p.evaluate(() => { const w = document.querySelector('.dr-fault'), st = w.querySelector('.dr-fault-stage').getBoundingClientRect(); return {step: w.dataset.step, top: Math.round(st.top), bottom: Math.round(st.bottom)}; });
    steps.push(s.step);
    if (Math.abs(s.top - nh) > 2) fail(`fault stage not stuck at position ${f} (top ${s.top})`);
    if (s.bottom > 900) fail(`fault stage taller than the viewport at position ${f}`);
    await p.screenshot({path: `${OUT}/fault-${i}.png`});
  }
  console.log('fault    steps', steps.join(''));
  if (steps.join('') !== '001234') fail('fault steps over the pin: ' + steps.join(''));
  await instant(p, g.top - nh + 5); await p.waitForTimeout(400);
  await p.locator('.dr-fault-jump').nth(3).click(); await p.waitForTimeout(1500);
  const jumped = await p.evaluate(() => document.querySelector('.dr-fault').dataset.step);
  if (jumped !== '3') fail('fault rail jump landed on step ' + jumped);
  await p.close();
  for (const [tag, opts] of [['phone', {viewport: {width: 390, height: 844}}], ['reduced', {viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'}]]) {
    const ctx = await b.newContext(opts), q = await ctx.newPage(); watch(q, tag);
    await q.goto(BASE + '#overview', {waitUntil: 'networkidle'}); await q.waitForTimeout(700);
    await q.locator('.dr-fault').scrollIntoViewIfNeeded(); await q.waitForTimeout(800);
    const s = await q.evaluate(() => { const w = document.querySelector('.dr-fault'); return {pinned: w.classList.contains('is-pinned'), step: w.dataset.step, hidden: [...w.querySelectorAll('li p')].filter(x => getComputedStyle(x).opacity !== '1').length}; });
    console.log('fault   ', tag, JSON.stringify(s));
    if (s.pinned || s.step !== '4' || s.hidden) fail(`${tag}: fault section should be unpinned, final, with every step visible`);
    await ctx.close();
  }
}

// 4. architecture
{
  const p = await b.newPage({viewport: {width: 1440, height: 900}}); watch(p, 'architecture');
  await p.goto(BASE + '#architecture', {waitUntil: 'networkidle'}); await p.waitForTimeout(900);
  const nh = await navH(p);
  await instant(p, 4200); await p.waitForTimeout(500);
  const tabsTop = await p.evaluate(() => Math.round(document.querySelector('.dr-arch-tabs').getBoundingClientRect().top));
  if (Math.abs(tabsTop - nh) > 2) fail(`architecture tabs not sticky (top ${tabsTop})`);
  await p.getByRole('tab', {name: /DG32-2DOM/}).click(); await p.waitForTimeout(700);
  const after = await p.evaluate(() => ({hash: location.hash, markTop: Math.round(document.querySelector('.dr-arch-mark').getBoundingClientRect().top)}));
  if (!after.hash.includes('chip=2dom') || after.markTop < 0 || after.markTop > 140) fail('architecture tab switch did not return to the section top');
  const d = p.locator('.dr-diagram-body'); await d.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  const before = await d.evaluate(e => ({hint: e.hasAttribute('data-more'), scrollable: e.scrollWidth > e.clientWidth}));
  await d.evaluate(e => { e.scrollLeft = e.scrollWidth; }); await p.waitForTimeout(300);
  const atEnd = await d.evaluate(e => e.hasAttribute('data-more'));
  console.log('architecture tabsTop', tabsTop, 'switch', JSON.stringify(after), 'diagram hint', JSON.stringify(before), 'at end', atEnd);
  if (before.scrollable && (!before.hint || atEnd)) fail('diagram edge hint does not track horizontal scroll');
  await p.close();
}

await b.close();
if (failed.length) fail('failed requests: ' + failed.join(' | '));
if (errors.length) fail('console errors: ' + errors.join(' | '));
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nALL CHECKS PASS');
process.exit(fails.length ? 1 : 0);
