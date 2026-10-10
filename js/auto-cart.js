/* ========================================
   LA BELLE VIE — AUTO CART BINDER
   Automatically wires existing "Add to Cart"
   buttons on all 150+ menu pages.
   ======================================== */

(function () {
    'use strict';

    // ---------- Detect API base + category from URL ----------
    const path = window.location.pathname.toLowerCase();

    // Where is the api folder?
    let apiBase = 'api';
    if (path.includes('/country-menus/') || path.includes('/friends-menu/') || path.includes('/italian-menu/')) {
        apiBase = '../../api';
    }

    // What category is this page? (based on folder)
    let category = null;
    if (path.includes('/country-menus/china/'))         category = 'chinese';
    if (path.includes('/country-menus/italy/'))         category = 'italian';
    if (path.includes('/country-menus/france/'))        category = 'french';
    if (path.includes('/country-menus/japan/'))         category = 'japanese';
    if (path.includes('/country-menus/india/'))         category = 'indian';
    if (path.includes('/country-menus/moscow/'))        category = 'russian';
    if (path.includes('/country-menus/thailand/'))      category = 'thai';
    if (path.includes('/country-menus/greece/'))        category = 'greek';
    if (path.includes('/country-menus/spain/'))         category = 'spanish';
    if (path.includes('/country-menus/turkey/'))        category = 'turkish';
    if (path.includes('/italian-menu/'))                category = 'italian';
    if (path.includes('/friends-menu/'))                category = 'friends';

    // ---------- Fetch menu items from DB once ----------
    let menuItems = [];

    async function loadMenuItems() {
        try {
            const url = apiBase + '/menu_items.php' + (category ? '?category=' + category : '');
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && Array.isArray(data.items)) {
                menuItems = data.items;
                console.log('[AutoCart] Loaded', menuItems.length, 'items for category:', category);
            }
        } catch (err) {
            console.warn('[AutoCart] Failed to load menu items:', err);
        }
    }

    // ---------- Match a card (name/image) to a DB item ----------
    function findItemMatch(name, imgSrc) {
        if (!menuItems.length) return null;

        // Normalize
        const cleanName = (name || '').toLowerCase().trim();
        const cleanImg  = (imgSrc || '').split('?')[0].toLowerCase();

        // 1. Try by image filename match
        for (const item of menuItems) {
            if (!item.image) continue;
            const itemImg = item.image.split('?')[0].toLowerCase();
            // Match by last segment of URL (filename)
            const a = itemImg.split('/').pop();
            const b = cleanImg.split('/').pop();
            if (a && b && a === b) return item;
        }

        // 2. Try by name match (exact or partial)
        for (const item of menuItems) {
            const itemName = (item.name || '').toLowerCase().trim();
            if (!itemName || !cleanName) continue;
            if (itemName === cleanName) return item;
            if (itemName.includes(cleanName) || cleanName.includes(itemName)) return item;
        }

        return null;
    }

    // ---------- Find the "card" container for a button ----------
    function findCard(btn) {
        let el = btn;
        // Walk up max 6 levels looking for a card-like container
        for (let i = 0; i < 6 && el; i++) {
            el = el.parentElement;
            if (!el) break;
            // Heuristic: card has an <img> inside and text
            if (el.querySelector('img') && el.textContent.trim().length > 5) {
                return el;
            }
        }
        return btn.parentElement;
    }

    // ---------- Extract name + image from a card ----------
    function extractCardInfo(card) {
        const img = card.querySelector('img');
        const imgSrc = img ? (img.src || img.getAttribute('data-src') || '') : '';

        // Name: try h1-h6, then .title, .card-title, .item-name
        let name = '';
        const nameEl = card.querySelector('h1, h2, h3, h4, h5, h6, .card-title, .item-name, .menu-title, .title');
        if (nameEl) {
            name = nameEl.textContent.trim();
        } else {
            // Fallback: longest text node that isn't a price
            const texts = Array.from(card.querySelectorAll('p, span, div'))
                .map(el => el.textContent.trim())
                .filter(t => t.length > 2 && !/^\$/.test(t) && t.length < 80);
            name = texts[0] || '';
        }

        // Clean up name (remove emoji prefixes, prices)
        name = name.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*/u, '')
                   .replace(/\$\s*\d+.*$/, '')
                   .replace(/\s+/g, ' ')
                   .trim();

        return { name, imgSrc };
    }

    // ---------- Wire up all Add-to-Cart buttons ----------
    function wireButtons() {
        // Find all buttons whose text contains "add" + "cart" (case-insensitive)
        const buttons = document.querySelectorAll('button, a.btn, .add-to-cart-btn, .add-to-cart, .btn-add');

        buttons.forEach(btn => {
            // Skip if already wired
            if (btn.dataset.autoCartWired === '1') return;

            // Skip if this is already a proper data-item-id button (cart.js handles it)
            if (btn.dataset.itemId) return;

            const txt = (btn.textContent || '').toLowerCase();
            const matchesAddToCart =
                txt.includes('add to cart') ||
                txt.includes('add to bag') ||
                txt.includes('add to order') ||
                (txt.includes('add') && txt.includes('cart'));

            if (!matchesAddToCart) return;

            // Mark it
            btn.dataset.autoCartWired = '1';

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Find the card + name + image
                const card = findCard(btn);
                const { name, imgSrc } = extractCardInfo(card);

                console.log('[AutoCart] Clicked:', name, '| img:', imgSrc);

                // Match to DB item
                const matched = findItemMatch(name, imgSrc);

                if (matched) {
                    // Call Cart.add from cart.js
                    if (window.Cart && typeof window.Cart.add === 'function') {
                        window.Cart.add(matched.id);
                    } else {
                        console.warn('[AutoCart] window.Cart not loaded');
                    }
                } else {
                    // No match found
                    if (window.Cart && window.Cart.toast) {
                        window.Cart.toast('⚠️ Item not found in menu database', 'error');
                    } else {
                        alert('Item not found in menu database');
                    }
                    console.warn('[AutoCart] No match for:', name);
                }
            });
        });

        console.log('[AutoCart] Wired', document.querySelectorAll('[data-auto-cart-wired="1"]').length, 'buttons');
    }

    // ---------- Boot ----------
    async function boot() {
        await loadMenuItems();
        wireButtons();

        // Re-wire if content changes (some pages load cards dynamically)
        const observer = new MutationObserver(() => wireButtons());
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();