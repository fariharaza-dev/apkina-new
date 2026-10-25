const CTA_SELECTOR = [
  '.cinematic-cta',
  '.editorial-cta',
  '.figma-outline-cta[href]',
  '.creator-primary',
  '.creator-secondary',
  '.red-pill',
  '.blue-link',
  '.compare-link',
  '.product-compare-cta',
  '.technical-download',
  '.related-product-link',
  '.related-heading > a',
  'a.resource',
].join(',');

const FILLED_SELECTOR = [
  '.cinematic-cta',
  '.editorial-cta',
  '.related-heading > a',
  '.creator-primary',
  '.red-pill',
  '.product-compare-cta',
  '.technical-download',
].join(',');

const segmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

function characters(text) {
  return segmenter
    ? Array.from(segmenter.segment(text), entry => entry.segment)
    : Array.from(text);
}

/** Enhance static CTA labels without changing link names, icons, or listeners. */
export function enhanceCTAs(root = globalThis.document) {
  if (!root?.querySelectorAll) return;

  const buttons = Array.from(root.querySelectorAll(CTA_SELECTOR));
  if (root.matches?.(CTA_SELECTOR)) buttons.unshift(root);

  for (const button of buttons) {
    if (button.querySelector('.cta-label')) continue;

    // These links include content that must remain outside the animated label.
    const target = button.matches('a.resource')
      ? Array.from(button.children).find(child => child.tagName === 'SPAN')
      : button;
    if (!target) continue;

    const textNodes = Array.from(target.childNodes)
      .filter(node => node.nodeType === 3 && node.textContent.trim());
    if (!textNodes.length) continue;

    const doc = button.ownerDocument;
    let index = 0;

    for (const node of textNodes) {
      const label = doc.createElement('span');
      label.className = 'cta-label';

      const readable = doc.createElement('span');
      readable.className = 'cta-readable';
      readable.textContent = node.textContent;

      const letters = doc.createElement('span');
      letters.className = 'cta-letters';
      letters.setAttribute('aria-hidden', 'true');

      for (const char of characters(node.textContent.trim())) {
        const letter = doc.createElement('span');
        letter.className = 'cta-letter';
        letter.textContent = char;
        letter.dataset.char = char;
        letter.style.setProperty('--char-index', String(index++));
        letters.appendChild(letter);
      }

      label.append(readable, letters);
      node.replaceWith(label);
    }

    button.classList.add('cta-stagger');
    if (button.matches(FILLED_SELECTOR)) button.classList.add('cta-filled');
  }
}

if (typeof document !== 'undefined') enhanceCTAs(document);
