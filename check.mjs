#!/usr/bin/env node
/** Static release gates. Run `npm run build && npm run check`.
 * No network, server, browser, or dependencies. This checks generated output,
 * source-data parity and DOM contracts; it is not a visual/browser test.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {SITE_ORIGIN} from './source/site-origin.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const distArg = process.argv.indexOf('--dist');
const dist = path.resolve(distArg < 0 ? path.join(root, 'dist') : process.argv[distArg + 1]);
const errors = [], warnings = [], references = new Set(), fragments = new Set();
const BASE = SITE_ORIGIN;
const expectedSlugs = ['sab234','np-f970-fast-smart-charger','ap475','ap336','ap3150','ap3250','ap620','ap1000','300w'];
const retiredAssets = ['hero-rgb.webp','hero-studio.webp','story-studio.webp','styles.css'];
const fail = message => errors.push(message);
const warn = message => warnings.push(message);
const rel = file => path.relative(dist, file);
const read = file => fs.readFileSync(file, 'utf8');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
function nonempty(file, label) {
  try { if (fs.statSync(file).isFile() && fs.statSync(file).size > 0) return true; } catch {}
  fail(`${label}: missing or empty ${rel(file)}`); return false;
}
function decode(text) {
  const names = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',times:'×',deg:'°',ge:'≥',le:'≤',ndash:'–',mdash:'—'};
  return String(text).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(m,e) => {
    if (e[0] !== '#') return names[e.toLowerCase()] ?? m;
    const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2),16) : Number(e.slice(1));
    return n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
  });
}
const norm = text => decode(text).normalize('NFKC').replace(/\s+/g,' ').trim();
const textOf = n => norm((n.parts || []).map(p => typeof p === 'string' ? p : textOf(p)).join(' '));
const hasClass = (n,c) => (n.attrs.class || '').split(/\s+/).includes(c);
const hidden = n => n && ('hidden' in n.attrs || 'inert' in n.attrs || hidden(n.parent));
const descendants = n => (n.children || []).flatMap(c => [c,...descendants(c)]);
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));

// A strict scanner for the fully closed tags emitted by these templates. It is
// deliberately not presented as a complete HTML5 conformance validator.
function parseHTML(html, owner) {
  const doc = {tag:'#document',attrs:{},children:[],parts:[],parent:null};
  const stack = [doc], nodes = [], ids = new Map();
  const token = /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][A-Za-z0-9:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/g;
  let last = 0, match;
  while ((match = token.exec(html))) {
    stack.at(-1).parts.push(decode(html.slice(last,match.index))); last = token.lastIndex;
    const raw = match[0]; if (raw.startsWith('<!')) continue;
    const closing = /^<\//.test(raw);
    const tag = raw.match(/^<\/?([\w:-]+)/)[1].toLowerCase();
    if (closing) {
      if (stack.at(-1).tag !== tag) { fail(`${owner}: unbalanced </${tag}> (inside <${stack.at(-1).tag}>)`); continue; }
      stack.pop(); continue;
    }
    const attrs = {}, attrText = raw.slice(raw.match(/^<[\w:-]+/)[0].length).replace(/\/?\s*>$/,'');
    const attrRx = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let a;
    while ((a = attrRx.exec(attrText))) {
      const name = a[1].toLowerCase();
      if (name in attrs) fail(`${owner}: duplicate ${name} attribute on <${tag}>`);
      attrs[name] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    }
    const parent = stack.at(-1), node = {tag,attrs,parent,children:[],parts:[]};
    parent.children.push(node); parent.parts.push(node); nodes.push(node);
    if (attrs.id) {
      if (ids.has(attrs.id)) fail(`${owner}: duplicate id ${attrs.id}`);
      ids.set(attrs.id,node);
    }
    if (tag === 'a' && stack.some(p => p.tag === 'a')) fail(`${owner}: nested anchors`);
    if (tag === 'button' && stack.some(p => ['button','a'].includes(p.tag))) fail(`${owner}: nested interactive button`);
    if (!VOID.has(tag) && !/\/\s*>$/.test(raw)) stack.push(node);
  }
  stack.at(-1).parts.push(decode(html.slice(last)));
  if (stack.length > 1) fail(`${owner}: unclosed tags ${stack.slice(1).map(n => n.tag).join(', ')}`);
  return {html,doc,nodes,ids};
}

if (!fs.existsSync(dist)) { console.error('Missing dist. Run npm run build first.'); process.exit(1); }
const files = walk(dist), htmlFiles = files.filter(f => f.endsWith('.html'));
const pages = new Map(htmlFiles.map(f => [f,parseHTML(read(f),rel(f))]));
function routePath(file) { return '/' + rel(file).replace(/index\.html$/,''); }
function checkRef(value, owner, context) {
  if (!value || /^(data:|mailto:|tel:)/i.test(value)) return;
  if (/^javascript:/i.test(value)) { fail(`${owner}: javascript URL in ${context}`); return; }
  let url;
  try { url = new URL(value,BASE + routePath(path.join(dist,owner))); }
  catch { fail(`${owner}: malformed URL ${value}`); return; }
  if (url.origin !== BASE) return;
  references.add(`${owner}|${value}`);
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { fail(`${owner}: invalid encoded URL ${value}`); return; }
  if (retiredAssets.includes(path.basename(pathname)) || pathname.startsWith('/enquiry/')) fail(`${owner}: retired reference ${value}`);
  if (/\/(?:cart|checkout|basket|payment|buy)(?:\/|$)/i.test(pathname)) fail(`${owner}: ecommerce route ${value}`);
  let target = path.resolve(dist,'.' + pathname);
  if (!target.startsWith(dist + path.sep) && target !== dist) { fail(`${owner}: URL escapes dist: ${value}`); return; }
  if (pathname.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target,'index.html');
  else if (!path.extname(pathname) && fs.existsSync(path.join(target,'index.html'))) target = path.join(target,'index.html');
  if (!nonempty(target,`${owner} (${context}) → ${value}`)) return;
  if (url.hash && pages.has(target)) {
    let id; try { id = decodeURIComponent(url.hash.slice(1)); } catch { fail(`${owner}: malformed fragment ${value}`); return; }
    fragments.add(`${rel(target)}#${id}`);
    if (id && !pages.get(target).ids.has(id)) fail(`${owner}: missing fragment target ${value}`);
  }
  if (url.pathname === '/products/' && url.searchParams.has('category')) {
    if (!source.categories.some(c => c.slug === url.searchParams.get('category'))) fail(`${owner}: unknown category ${value}`);
  }
  if (url.pathname === '/compare/' && url.searchParams.has('products')) {
    for (const slug of url.searchParams.get('products').split(',')) if (!expectedSlugs.includes(slug)) fail(`${owner}: unknown comparison product ${slug}`);
  }
}

let source, published;
try { source = JSON.parse(read(path.join(root,'catalog-source.json'))); published = JSON.parse(read(path.join(dist,'assets/products.json'))); }
catch (e) { console.error(`Cannot read catalog: ${e.message}`); process.exit(1); }
for (const [label,products] of [['source',source.products],['published',published]]) {
  if (!Array.isArray(products) || products.length !== 9) fail(`${label}: expected nine products`);
  const slugs = products.map(p => p.slug);
  if (new Set(slugs).size !== slugs.length || expectedSlugs.some(s => !slugs.includes(s))) fail(`${label}: product set does not match the nine source models`);
}

for (const [file,page] of pages) {
  const owner = rel(file), {html,nodes,ids} = page;
  if (!/^\s*<!doctype html>/i.test(html)) fail(`${owner}: missing HTML doctype`);
  for (const tag of ['html','head','body','title','main']) if (nodes.filter(n => n.tag === tag).length !== 1) fail(`${owner}: expected exactly one <${tag}>`);
  if (!nodes.some(n => n.tag === 'html' && n.attrs.lang)) fail(`${owner}: missing document language`);
  if (!nodes.some(n => n.tag === 'meta' && n.attrs.charset)) fail(`${owner}: missing charset`);
  if (!nodes.some(n => n.tag === 'meta' && n.attrs.name === 'viewport')) fail(`${owner}: missing viewport`);
  if (!ids.has('main')) fail(`${owner}: missing #main skip-link target`);
  const visibleH1 = nodes.filter(n => n.tag === 'h1' && !hidden(n));
  if (visibleH1.length !== 1) fail(`${owner}: expected one initially visible h1; got ${visibleH1.length}`);
  if (/\b(?:undefined|NaN)\b|\[object Object\]|\$\{/.test(textOf(page.doc))) fail(`${owner}: unresolved template/data output`);
  for (const node of nodes) {
    for (const a of ['href','src','poster','data-zoom','action']) if (node.attrs[a]) checkRef(node.attrs[a],owner,`${node.tag}[${a}]`);
    if (node.attrs.srcset) for (const item of node.attrs.srcset.split(',')) checkRef(item.trim().split(/\s+/)[0],owner,'srcset');
    for (const a of ['aria-labelledby','aria-describedby','aria-controls','for']) if (node.attrs[a]) for (const id of node.attrs[a].split(/\s+/)) if (!ids.has(id)) fail(`${owner}: ${a} refers to missing #${id}`);
    if (node.tag === 'img' && !('alt' in node.attrs)) fail(`${owner}: image lacks alt attribute`);
    if (node.tag === 'img' && !node.attrs.src && node.parent.attrs.id !== 'zoom-dialog') fail(`${owner}: image has no source`);
    if (['button','a'].includes(node.tag)) {
      const name = node.attrs['aria-label'] || node.attrs['aria-labelledby'] || textOf(node) || descendants(node).find(n => n.tag === 'img' && n.attrs.alt)?.attrs.alt;
      if (!name) fail(`${owner}: unnamed <${node.tag}> control`);
      if (/\b(?:add to (?:cart|basket)|buy now|checkout|pay now)\b/i.test(name || '')) fail(`${owner}: ecommerce control ${name}`);
    }
    if (Object.keys(node.attrs).some(a => /^data-(?:cart|checkout|payment|buy)/i.test(a))) fail(`${owner}: ecommerce data action`);
    if (node.tag === 'dialog' && !node.attrs['aria-label'] && !node.attrs['aria-labelledby']) warn(`${owner}: #${node.attrs.id} dialog lacks an explicit accessible name`);
  }
}

let specCount = 0, packagingCount = 0;
for (const p of source.products) {
  const owner = `products/${p.slug}/index.html`, page = pages.get(path.join(dist,owner));
  if (!page) { fail(`Missing product page ${owner}`); continue; }
  const data = published.find(q => q.slug === p.slug);
  const rows = page.nodes.filter(n => hasClass(n,'technical-row')).map(n => ({
    label:textOf(n.children.find(c => c.tag === 'dt') || {}), value:textOf(n.children.find(c => c.tag === 'dd') || {})
  }));
  const downloadPath = path.join(dist,'assets/specs',p.slug + '.txt');
  const download = nonempty(downloadPath,`${p.slug} downloadable specs`) ? read(downloadPath) : '';
  for (const key of ['specs','packaging_specs']) {
    const expected = p[key] || [];
    if (JSON.stringify(data?.[key]) !== JSON.stringify(expected)) fail(`${p.slug}: ${key} differs between source and published JSON`);
    for (const spec of expected) {
      if (key === 'specs') specCount++; else packagingCount++;
      if (!rows.some(r => r.label === norm(spec.label) && r.value === norm(spec.value))) fail(`${owner}: missing/changed ${spec.label}: ${spec.value}`);
      if (!norm(download).includes(norm(`${spec.label}: ${spec.value}`))) fail(`${p.slug}: download missing/changed ${spec.label}`);
    }
  }
  if (rows.length !== p.specs.length + p.packaging_specs.length) fail(`${p.slug}: unexpected technical specification rows`);
  for (const feature of p.features) if (!textOf(page.doc).includes(norm(feature))) fail(`${p.slug}: missing source feature ${feature}`);
  for (const key of ['source_text','source_blocks','reference_images','notes']) if (key in (data || {})) fail(`${p.slug}: source-only ${key} leaked into public JSON`);
  if (!data?.image || !/^[a-z0-9-]+$/.test(data.image)) fail(`${p.slug}: invalid image asset key`);
  else checkRef(`/assets/${data.image}.webp`,'assets/products.json',`${p.slug} image`);
  const productImages = page.nodes.filter(n => n.tag === 'img' && ['product-hero-photo','highlight-product','product-gallery-photo','product-feature-scene'].some(c => hasClass(n.parent,c)));
  if (!productImages.length || productImages.some(n => n.attrs.src !== `/assets/${data.image}.webp`)) fail(`${p.slug}: primary product view uses wrong or missing image`);
  const sceneImages = page.nodes.filter(n => n.tag === 'img' && hasClass(n.parent,'product-lifestyle-photo'));
  if (sceneImages.length !== 1 || sceneImages[0].attrs.src !== `/assets/${data.scene?.image}.webp`) fail(`${p.slug}: missing or mismatched product-in-use scene`);
  for (const id of ['overview','features','gallery','specifications']) if (!page.ids.has(id)) fail(`${p.slug}: missing product section #${id}`);
  if (p.slug === 'sab234' && !/depending on the variant/.test(textOf(page.doc))) fail('SAB234: lost uncertain-height qualification');
  if (p.slug === 'np-f970-fast-smart-charger' && /\bdual(?:\s+(?:battery|slot|charger))?\b/i.test(textOf(page.doc))) fail('Charger: contradicted one-slot reference with dual-slot claim');
}

const catalog = pages.get(path.join(dist,'products/index.html'));
const cards = catalog?.nodes.filter(n => n.attrs['data-product']) || [];
if (cards.length !== 9 || expectedSlugs.some(s => !cards.some(n => n.attrs['data-product'] === s))) fail('Collection does not contain exactly the nine product cards');
const requiredHooks = ['mobile-menu','search-dialog','site-search','search-results','zoom-dialog','toast'];
for (const [f,p] of pages) for (const id of requiredHooks) if (!p.ids.has(id)) fail(`${rel(f)}: shared JS target #${id} missing`);
for (const [f,p] of pages) for (const carousel of p.nodes.filter(n => 'data-carousel' in n.attrs)) {
  const children = descendants(carousel), slides = children.filter(n => 'data-slide' in n.attrs);
  if (slides.length < 2) fail(`${rel(f)}: carousel requires at least two slides`);
  if (slides.filter(n => !hidden(n)).length !== 1) fail(`${rel(f)}: carousel initial visible-slide count is not one`);
  for (const dot of children.filter(n => 'data-slide-index' in n.attrs)) if (!Number.isInteger(Number(dot.attrs['data-slide-index'])) || Number(dot.attrs['data-slide-index']) >= slides.length) fail(`${rel(f)}: invalid carousel dot index`);
  if (Number(carousel.attrs['data-autoplay']) > 0 && !children.some(n => 'data-pause' in n.attrs)) fail(`${rel(f)}: auto-playing carousel lacks pause control`);
}
for (const f of files.filter(f => f.endsWith('.css'))) {
  const css = read(f);
  for (const m of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) checkRef(m[2],rel(f),'CSS url');
  for (const old of retiredAssets) if (css.includes(old)) fail(`${rel(f)}: retired asset ${old}`);
}
const app = read(path.join(dist,'assets/app.js'));
try { new vm.Script(app,{filename:'app.js'}); } catch(e) { fail(`app.js syntax: ${e.message}`); }
for (const m of app.matchAll(/fetch\(\s*['"]([^'"]+)['"]/g)) checkRef(m[1],'assets/app.js','fetch');
if (/stripe|paypal|shopify|snipcart|add-to-cart/i.test(app)) fail('app.js contains ecommerce integration');
const siteCSS = read(path.join(dist,'assets/site.css'));
if (!/#toast\.show\s*\{[^}]*pointer-events\s*:\s*auto/.test(siteCSS)) fail('Toast comparison link is unclickable: #toast.show must restore pointer-events:auto');
if (!/\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/.test(siteCSS)) fail('The hidden attribute can be overridden by component display rules');
if (!siteCSS.includes('prefers-reduced-motion')) warn('Missing reduced-motion CSS treatment');
for (const old of retiredAssets) if (fs.existsSync(path.join(dist,'assets',old))) fail(`Retired file remains in dist/assets/${old}`);
for (const f of files.filter(f => f.endsWith('.webp'))) {
  const head = fs.readFileSync(f).subarray(0,12);
  if (head.toString('ascii',0,4) !== 'RIFF' || head.toString('ascii',8,12) !== 'WEBP') fail(`${rel(f)} is not a WebP image`);
}
const sitemap = read(path.join(dist,'sitemap.xml'));
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
for (const u of urls) checkRef(u,'sitemap.xml','sitemap route');
for (const f of htmlFiles.filter(f => !f.endsWith('/404.html'))) if (!urls.includes(BASE + routePath(f))) fail(`${rel(f)} absent from sitemap.xml`);

console.log(`Static audit: ${htmlFiles.length} pages, 9 products, ${specCount} product specs, ${packagingCount} packaging specs.`);
console.log(`Checked ${references.size} local references and ${fragments.size} fragment targets; WebP signatures, JS syntax, carousel/DOM contracts and source parity.`);
const uniqueWarnings = [...new Set(warnings.map(w => w.replace(/^[^:]+\.html: /,'')))];
for (const w of uniqueWarnings) console.warn(`WARNING: ${w}`);
if (errors.length) {
  for (const e of [...new Set(errors)]) console.error(`FAIL: ${e}`);
  console.error(`${errors.length} gate failure(s).`); process.exitCode = 1;
} else console.log('PASS: all static release gates passed. Browser interactions and visual rendering remain untested.');
