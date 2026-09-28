// Crawl internal links from nav/footer + page bodies (server HTML) and report non-200
const base = 'http://localhost:3000';
const seeds = ['/', '/tools', '/blog', '/compress', '/merge', '/vs/adobe-acrobat', '/pdf-tools-for-students', '/qa', '/premium', '/about', '/sitemap', '/es', '/blog/how-to-compress-pdf', '/ultimate-guide-to-pdf-editing', '/best-free-pdf-editor', '/recipes', '/studio'];
const seen = new Set();
const queue = [...seeds];
const linkSource = {};
function extract(html, from) {
  const re = /href="(\/[^"#?]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].replace(/\/$/, '') || '/';
    if (href.startsWith('//')) continue;
    if (!seen.has(href)) { queue.push(href); linkSource[href] = from; }
  }
}
const statuses = {};
while (queue.length) {
  const p = queue.shift();
  if (seen.has(p)) continue;
  seen.add(p);
  try {
    const res = await fetch(base + p, { redirect: 'manual' });
    const st = res.status;
    statuses[p] = st;
    if (st === 200) {
      const html = await res.text();
      extract(html, p);
    }
  } catch (e) { statuses[p] = 'ERR ' + e.message; }
}
const bad = Object.entries(statuses).filter(([, s]) => s !== 200);
console.log('crawled URLs:', Object.keys(statuses).length);
console.log('non-200:', bad.length);
for (const [p, s] of bad) console.log(' ', s, p, '(first linked from', linkSource[p] + ')');
