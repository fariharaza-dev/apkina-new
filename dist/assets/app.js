(() => {
  'use strict';

  const all = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const one = (selector, scope = document) => scope.querySelector(selector);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'apkina-compare-products';
  let products = [];
  let catalogState = 'loading';
  let selectedProducts = [];
  let toastTimer;

  const productURL = product => `/products/${encodeURIComponent(product.slug)}/`;
  const imageURL = product => `/assets/${encodeURIComponent(product.image || product.slug)}.webp`;
  const productBySlug = slug => products.find(product => product.slug === slug);
  const cleanSlugs = values => [...new Set(values.map(String).filter(value => /^[a-z0-9-]+$/i.test(value)))].slice(0, 3);

  function readSavedComparison() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) ? cleanSlugs(saved) : [];
    } catch (_) { return []; }
  }

  function comparisonURL() {
    return selectedProducts.length ? `/compare/?products=${selectedProducts.map(encodeURIComponent).join(',')}` : '/compare/';
  }

  function updateCompareLinks() {
    all('[data-compare-link]').forEach(link => { link.setAttribute('href', comparisonURL()); });
  }

  function saveComparison() {
    try { localStorage.setItem(storageKey, JSON.stringify(selectedProducts)); } catch (_) { /* Storage may be unavailable. */ }
    updateCompareLinks();
  }

  function toast(message, withLink = false) {
    const target = one('#toast');
    if (!target) return;
    clearTimeout(toastTimer);
    target.replaceChildren(document.createTextNode(message));
    if (withLink) {
      target.appendChild(document.createTextNode(' '));
      const link = document.createElement('a');
      link.href = comparisonURL();
      link.textContent = 'View comparison';
      target.appendChild(link);
    }
    target.setAttribute('role', 'status');
    target.setAttribute('aria-live', 'polite');
    target.hidden = false;
    target.classList.add('show');
    toastTimer = setTimeout(() => {
      if (target.contains(document.activeElement)) return;
      target.classList.remove('show');
      target.hidden = true;
    }, 7000);
  }

  function initMenu() {
    const menu = one('#mobile-menu');
    const toggles = all('[data-menu-toggle]');
    if (!menu || !toggles.length) return;
    let open = false;
    const setOpen = value => {
      open = value;
      menu.hidden = !open;
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('menu-open', open);
      toggles.forEach(button => {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-controls', 'mobile-menu');
      });
    };
    setOpen(false);
    toggles.forEach(button => button.addEventListener('click', () => setOpen(!open)));
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        toggles[0].focus();
      }
    });
    document.addEventListener('click', event => {
      if (open && !menu.contains(event.target) && !toggles.some(button => button.contains(event.target))) setOpen(false);
    });
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    all('dialog[open]').forEach(closeDialog);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function renderSearch() {
    const result = one('#search-results');
    const input = one('#site-search');
    if (!result || !input) return;
    if (catalogState === 'loading') {
      result.innerHTML = '<p class="search-empty" role="status">Loading products…</p>';
      return;
    }
    if (catalogState === 'error') {
      result.innerHTML = '<p class="search-empty" role="status">Product search is temporarily unavailable. <a href="/products/">Browse all products</a></p>';
      return;
    }
    const query = normalize(input.value);
    const matches = products.filter(product => normalize([product.name, product.model, product.category, product.type, product.description].join(' ')).includes(query));
    if (!matches.length) {
      result.innerHTML = '<p class="search-empty" role="status">No products found. Try a model name or product type.</p>';
      return;
    }
    result.innerHTML = matches.map(product => `<a class="search-result" href="${productURL(product)}"><img class="search-result-image" src="${imageURL(product)}" alt="" loading="lazy"><span class="search-result-copy"><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.type || product.category)}</span></span><span aria-hidden="true">↗</span></a>`).join('');
  }

  function initDialogs() {
    all('dialog').forEach(dialog => {
      all('[data-close]', dialog).forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
      });
    });
    const searchDialog = one('#search-dialog');
    const searchInput = one('#site-search');
    all('[data-open-search]').forEach(button => button.addEventListener('click', () => {
      openDialog(searchDialog);
      renderSearch();
      searchInput?.focus();
    }));
    searchInput?.addEventListener('input', renderSearch);
    searchInput?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const first = one('#search-results .search-result');
        if (first) { event.preventDefault(); first.click(); }
      }
    });
    all('[data-zoom]').forEach(button => button.addEventListener('click', () => {
      const dialog = one('#zoom-dialog');
      const image = dialog && one('img', dialog);
      if (!dialog || !image) return;
      const source = button.dataset.zoom;
      if (!source || !/^(?:\/[^/]|\.\.?\/|https?:\/\/)/i.test(source)) return;
      image.src = source;
      image.alt = button.dataset.alt || one('img', button)?.alt || 'Product photograph';
      openDialog(dialog);
    }));
  }

  function initCarousel(carousel) {
    const slides = all('[data-slide]', carousel).filter(slide => slide.closest('[data-carousel]') === carousel);
    if (!slides.length) return;
    const controls = all('[data-slide-index]', carousel);
    const pauseButtons = all('[data-pause]', carousel);
    const counter = one('[data-counter]', carousel);
    const autoplay = Number(carousel.dataset.autoplay) || 0;
    let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    let userPaused = false;
    let hovering = false;
    let focused = false;
    let timer;
    let touchStart = null;
    carousel.setAttribute('aria-roledescription', 'carousel');
    if (!carousel.hasAttribute('tabindex')) carousel.tabIndex = 0;

    const shouldPlay = () => autoplay > 0 && slides.length > 1 && !userPaused && !hovering && !focused && !document.hidden && !motion.matches;
    const updatePause = () => {
      pauseButtons.forEach(button => {
        const paused = userPaused || motion.matches;
        button.setAttribute('aria-pressed', String(paused));
        button.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
        button.classList.toggle('is-paused', paused);
        button.dataset.paused = String(paused);
        const label = one('[data-pause-label]', button);
        if (label) label.textContent = paused ? 'Play' : 'Pause';
        else if (button.children.length === 0) button.textContent = paused ? '▶' : 'Ⅱ';
      });
      carousel.setAttribute('aria-live', shouldPlay() ? 'off' : 'polite');
    };
    const schedule = () => {
      clearTimeout(timer);
      updatePause();
      if (shouldPlay()) timer = setTimeout(() => show(index + 1), autoplay);
    };
    const show = next => {
      index = ((next % slides.length) + slides.length) % slides.length;
      if (slides.some((slide, current) => current !== index && slide.contains(document.activeElement))) carousel.focus({ preventScroll: true });
      slides.forEach((slide, current) => {
        const active = current === index;
        slide.hidden = !active;
        slide.inert = !active;
        slide.toggleAttribute('inert', !active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-roledescription', 'slide');
        if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', `${current + 1} of ${slides.length}`);
      });
      controls.forEach(button => {
        const active = Number(button.dataset.slideIndex) === index;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
        if (active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
        if (button.getAttribute('role') === 'tab') button.setAttribute('aria-selected', String(active));
      });
      if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      carousel.dataset.activeSlide = String(index);
      schedule();
    };
    all('[data-prev]', carousel).forEach(button => button.addEventListener('click', () => show(index - 1)));
    all('[data-next]', carousel).forEach(button => button.addEventListener('click', () => show(index + 1)));
    controls.forEach(button => button.addEventListener('click', () => {
      const target = Number(button.dataset.slideIndex);
      if (Number.isInteger(target)) show(target);
    }));
    pauseButtons.forEach(button => button.addEventListener('click', () => {
      userPaused = !userPaused;
      schedule();
    }));
    carousel.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(index + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    carousel.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    carousel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    carousel.addEventListener('focusin', () => { focused = true; schedule(); });
    carousel.addEventListener('focusout', () => {
      queueMicrotask(() => { focused = carousel.contains(document.activeElement); schedule(); });
    });
    carousel.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) { touchStart = null; return; }
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    carousel.addEventListener('touchend', event => {
      if (!touchStart || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    if (motion.addEventListener) motion.addEventListener('change', schedule);
    else motion.addListener(schedule);
    show(index);
  }

  function initCatalog() {
    const container = one('#catalog-products');
    if (!container) return;
    const cards = all('[data-product]', container);
    const filters = all('[data-category-filter]');
    const search = one('#product-search');
    const count = one('#catalog-count');
    const empty = one('#catalog-empty');
    const params = new URLSearchParams(location.search);
    let category = params.get('category') || 'all';
    if (!filters.some(button => button.dataset.categoryFilter === category)) category = 'all';
    if (search) search.value = params.get('q') || '';
    const apply = (updateURL = true) => {
      const query = normalize(search?.value);
      let visible = 0;
      cards.forEach(card => {
        const matchesCategory = !category || category === 'all' || normalize(card.dataset.category) === normalize(category);
        const matchesSearch = normalize(card.dataset.search || card.textContent).includes(query);
        card.hidden = !(matchesCategory && matchesSearch);
        if (!card.hidden) visible += 1;
      });
      filters.forEach(button => {
        const active = button.dataset.categoryFilter === category || ((!category || category === 'all') && ['', 'all'].includes(button.dataset.categoryFilter));
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (count) { count.textContent = `${visible} ${visible === 1 ? 'product' : 'products'}`; count.setAttribute('aria-live', 'polite'); }
      if (empty) empty.hidden = visible !== 0;
      if (updateURL) {
        const url = new URL(location.href);
        if (category && category !== 'all') url.searchParams.set('category', category); else url.searchParams.delete('category');
        if (search?.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
        history.replaceState(null, '', url);
      }
    };
    filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter || 'all'; apply(); }));
    search?.addEventListener('input', () => apply());
    apply(false);
  }

  function renderComparison() {
    const container = one('#comparison');
    if (!container) return;
    const selected = selectedProducts.map(productBySlug).filter(Boolean);
    if (!selected.length) {
      container.innerHTML = '<p class="comparison-note">Choose up to three products above to compare their specifications.</p>';
      return;
    }
    const labels = [...new Set(selected.flatMap(product => (Array.isArray(product.specs) ? product.specs : []).map(spec => spec.label)))];
    const header = selected.map(product => `<th scope="col"><a class="comparison-product" href="${productURL(product)}"><img class="comparison-image" src="${imageURL(product)}" alt="" loading="lazy"><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.type || product.category)}</span></a></th>`).join('');
    const rows = labels.map(label => `<tr><th scope="row">${escapeHTML(label)}</th>${selected.map(product => {
      const match = (Array.isArray(product.specs) ? product.specs : []).find(spec => spec.label === label);
      return `<td>${match ? escapeHTML(match.value) : '<span class="comparison-unspecified">Not specified</span>'}</td>`;
    }).join('')}</tr>`).join('');
    container.innerHTML = `<table class="comparison-table"><caption class="sr-only">Product specification comparison</caption><thead><tr><th scope="col">Specification</th>${header}</tr></thead><tbody>${rows}</tbody></table><p class="comparison-note">Specifications from the supplied product details. “Not specified” means the detail was not provided.</p>`;
  }

  function initComparison() {
    const selects = all('#compare-selects [data-compare-select]');
    if (!selects.length) return;
    const syncOptions = () => {
      selects.forEach((select, index) => {
        const current = selectedProducts[index] || '';
        select.innerHTML = '<option value="">Choose a product</option>' + products.map(product => `<option value="${escapeHTML(product.slug)}">${escapeHTML(product.name)}</option>`).join('');
        select.value = current;
        all('option', select).forEach(option => { option.disabled = Boolean(option.value && option.value !== current && selectedProducts.includes(option.value)); });
      });
    };
    selects.forEach(select => select.addEventListener('change', () => {
      selectedProducts = cleanSlugs(selects.map(input => input.value).filter(Boolean));
      saveComparison();
      syncOptions();
      renderComparison();
      const url = new URL(location.href);
      if (selectedProducts.length) url.searchParams.set('products', selectedProducts.join(',')); else url.searchParams.delete('products');
      history.replaceState(null, '', url);
    }));
    syncOptions();
    renderComparison();
  }

  function initSupport() {
    const search = one('#support-search');
    if (!search) return;
    const resources = all('a[data-resource]');
    const filter = () => {
      const query = normalize(search.value);
      resources.forEach(resource => {
        const searchable = [resource.dataset.resource, resource.dataset.title, resource.getAttribute('aria-label'), resource.title, resource.textContent].join(' ');
        resource.hidden = !normalize(searchable).includes(query);
      });
      const empty = one('#support-empty');
      if (empty) empty.hidden = resources.some(resource => !resource.hidden);
    };
    search.addEventListener('input', filter);
    filter();
  }

  selectedProducts = readSavedComparison();
  updateCompareLinks();
  initMenu();
  initDialogs();
  all('[data-carousel]').forEach(initCarousel);
  initCatalog();
  initSupport();
  all('[data-back-top]').forEach(button => button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion.matches ? 'auto' : 'smooth' })));

  const catalogReady = fetch('/assets/products.json', { credentials: 'same-origin' })
    .then(response => { if (!response.ok) throw new Error('Product catalog unavailable'); return response.json(); })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid product catalog');
      products = data.filter(product => product && typeof product.slug === 'string' && /^[a-z0-9-]+$/i.test(product.slug));
      catalogState = 'ready';
      const params = new URLSearchParams(location.search);
      const requested = params.has('products') ? cleanSlugs((params.get('products') || '').split(',')) : selectedProducts;
      selectedProducts = requested.filter(slug => productBySlug(slug));
      saveComparison();
      renderSearch();
      initComparison();
      return true;
    })
    .catch(() => {
      catalogState = 'error';
      renderSearch();
      const comparison = one('#comparison');
      if (comparison) comparison.innerHTML = '<p class="comparison-note" role="status">The comparison could not load. Please refresh or <a href="/products/">browse the products</a>.</p>';
      all('#compare-selects [data-compare-select]').forEach(select => { select.disabled = true; });
      return false;
    });

  all('[data-add-compare]').forEach(button => button.addEventListener('click', async event => {
    event.preventDefault();
    if (!await catalogReady) { toast('Comparison is temporarily unavailable. Please try again.'); return; }
    const slug = button.dataset.addCompare;
    const product = productBySlug(slug);
    if (!product) return;
    if (selectedProducts.includes(slug)) { toast(`${product.name} is already in your comparison.`, true); return; }
    if (selectedProducts.length >= 3) { toast('You can compare up to three products. Change your selection on the comparison page.', true); return; }
    selectedProducts.push(slug);
    saveComparison();
    button.setAttribute('aria-pressed', 'true');
    toast(`${product.name} added to your comparison.`, true);
  }));
})();
