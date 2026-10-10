/* ========================================
   LA BELLE VIE — CART WIDGET
   Auto-injects cart UI + handles everything
   Include with 3 lines:
     <script src="../../js/cart-widget.js"></script>
   ======================================== */

(function () {
    'use strict';

    // ========================================
    // CSS — injected automatically
    // ========================================
    const CSS = `
        /* Add to Cart Button */
        .add-to-cart-btn {
            background: #722F37;
            color: white;
            border: none;
            padding: 8px 18px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .add-to-cart-btn:hover {
            background: #C9A96E;
            color: #1a1a1a;
        }
        .add-to-cart-btn.added {
            background: #27ae60;
        }

        /* Cart Sidebar */
        .cart-sidebar {
            position: fixed; top: 0; right: -450px;
            width: 430px; height: 100vh;
            background: #fff;
            box-shadow: -10px 0 40px rgba(0,0,0,.15);
            z-index: 9999;
            transition: right .4s cubic-bezier(.34,1.56,.64,1);
            display: flex; flex-direction: column;
        }
        .cart-sidebar.open { right: 0; }

        .cart-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.5);
            z-index: 9998;
            opacity: 0; pointer-events: none;
            transition: opacity .4s ease;
        }
        .cart-overlay.show { opacity: 1; pointer-events: all; }

        .cart-toggle {
            position: fixed; bottom: 30px; right: 30px;
            width: 65px; height: 65px; border-radius: 50%;
            background: #722F37; color: white; border: none;
            font-size: 1.8rem;
            box-shadow: 0 10px 40px rgba(114,47,55,.4);
            cursor: pointer;
            transition: all .4s cubic-bezier(.34,1.56,.64,1);
            z-index: 999;
            display: flex; align-items: center; justify-content: center;
        }
        .cart-toggle:hover { transform: scale(1.15); }
        .cart-toggle .badge-cart {
            position: absolute; top: -5px; right: -5px;
            background: #C9A96E; color: #1a1a1a;
            border-radius: 50%; width: 28px; height: 28px;
            font-size: .8rem; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            border: 2px solid white;
        }

        .cart-header {
            padding: 20px 25px;
            background: #722F37; color: white;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 2px solid #C9A96E;
        }
        .cart-header h3 {
            margin: 0; font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
        }
        .cart-header h3 i { color: #C9A96E; margin-right: 10px; }
        .cart-close {
            background: none; border: none; color: white;
            font-size: 1.8rem; cursor: pointer;
            transition: transform .3s ease;
        }
        .cart-close:hover { transform: rotate(90deg); }

        .cart-items { flex: 1; overflow-y: auto; padding: 15px 20px; }
        .cart-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 0; border-bottom: 1px solid #eee;
        }
        .cart-item-info { flex: 1; }
        .cart-item-name { font-weight: 600; color: #2D2D2D; font-size: .95rem; }
        .cart-item-price { color: #722F37; font-weight: 700; font-size: .9rem; }
        .cart-item-controls { display: flex; align-items: center; gap: 8px; }
        .cart-item-controls button {
            width: 30px; height: 30px; border-radius: 50%;
            border: 1px solid #C9A96E; background: transparent;
            color: #722F37; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .cart-item-controls button:hover { background: #C9A96E; color: white; }
        .cart-item-qty { font-weight: 700; min-width: 24px; text-align: center; color: #2D2D2D; }
        .cart-item-remove {
            color: #e74c3c; background: none; border: none;
            cursor: pointer; font-size: .9rem; padding: 0 5px;
        }

        .empty-cart { text-align: center; padding: 50px 20px; color: #999; }
        .empty-cart i { font-size: 4rem; color: #ddd; margin-bottom: 15px; }

        .cart-footer {
            padding: 20px 25px; border-top: 2px solid #eee;
            background: #f8f9fa;
        }
        .cart-total {
            display: flex; justify-content: space-between;
            font-size: 1.2rem; font-weight: 700; color: #2D2D2D;
            margin-bottom: 10px;
        }
        .cart-total span:last-child { color: #722F37; }
        .btn-checkout {
            width: 100%; padding: 14px;
            background: #722F37; color: white;
            border: none; border-radius: 50px;
            font-weight: 700; font-size: 1.1rem;
            cursor: pointer;
        }
        .btn-checkout:hover { background: #C9A96E; color: #1a1a1a; }
        .btn-checkout:disabled { background: #ccc; cursor: not-allowed; }

        .toast-notification {
            position: fixed; bottom: 100px; right: 30px;
            background: #27ae60; color: white;
            padding: 15px 25px; border-radius: 12px;
            box-shadow: 0 10px 30px rgba(39,174,96,.3);
            z-index: 9997;
            transform: translateY(100px); opacity: 0;
            transition: all .5s cubic-bezier(.34,1.56,.64,1);
            font-weight: 600;
        }
        .toast-notification.show { transform: translateY(0); opacity: 1; }
        .toast-notification.error { background: #e74c3c; }

        .bill-modal .modal-content {
            border-radius: 20px; border: none;
            box-shadow: 0 30px 80px rgba(0,0,0,.3);
            overflow: hidden;
        }
        .bill-modal .modal-header {
            background: linear-gradient(135deg,#722F37,#2d3436);
            color: white; border: none; padding: 25px 30px;
        }
        .bill-body { padding: 30px; background: #f8f5f2; }
        .bill-header {
            text-align: center; padding-bottom: 20px;
            border-bottom: 2px dashed #C9A96E; margin-bottom: 20px;
        }
        .bill-header h2 {
            font-family: 'Playfair Display', serif;
            color: #722F37; font-weight: 900;
        }
        .bill-item-row {
            display: flex; justify-content: space-between;
            padding: 8px 0; border-bottom: 1px solid #eee;
            font-size: .95rem;
        }
        .bill-totals { padding-top: 15px; border-top: 2px solid #C9A96E; }
        .bill-totals .total-row {
            display: flex; justify-content: space-between;
            padding: 5px 0; font-size: .95rem;
        }
        .bill-totals .total-row.grand-total {
            font-size: 1.3rem; font-weight: 700;
            color: #722F37;
            padding-top: 10px; border-top: 2px solid #722F37; margin-top: 5px;
        }
        .bill-footer {
            text-align: center; padding-top: 20px;
            border-top: 2px dashed #C9A96E;
            margin-top: 20px; color: #888; font-size: .85rem;
        }
        .bill-actions {
            display: flex; gap: 10px; justify-content: center;
            margin-top: 20px; flex-wrap: wrap;
        }

        .qr-wrap {
            text-align: center; padding: 20px 0;
            border-top: 2px dashed #C9A96E; margin-top: 20px;
        }
        .qr-wrap img {
            width: 220px; height: 220px;
            border: 4px solid #fff; border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,.15);
        }
        .qr-wrap .amt {
            font-size: 1.4rem; color: #722F37;
            font-weight: 700; margin: 10px 0 4px;
        }
        .qr-wrap .hint {
            font-size: .85rem; color: #777; margin-bottom: 12px;
        }

        /* Uniform images */
        .card-img-top {
            width: 100%; height: 220px;
            object-fit: cover; object-position: center; display: block;
        }

        @media (max-width: 768px) {
            .cart-sidebar { width: 100%; right: -100%; }
            .cart-toggle { width: 55px; height: 55px; font-size: 1.4rem; bottom: 20px; right: 20px; }
            .add-to-cart-btn { padding: 7px 14px; font-size: .78rem; }
        }
    `;

    // ========================================
    // HTML — injected automatically
    // ========================================
    const HTML = `
        <div class="cart-overlay" id="cartOverlay"></div>

        <div class="toast-notification" id="toastNotification">
            <i class="fas fa-check-circle"></i> <span id="toastMessage">Item added to cart!</span>
        </div>

        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Order</h3>
                <button class="cart-close" id="closeCart"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-items" id="cartItems">
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size:0.9rem; color:#bbb;">Start adding items from our menu!</p>
                </div>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cartTotal">$0.00</span>
                </div>
                <button class="btn-checkout" id="checkoutBtn" disabled>
                    <i class="fas fa-credit-card"></i> View Bill & Checkout
                </button>
            </div>
        </div>

        <button class="cart-toggle" id="cartToggle">
            <i class="fas fa-shopping-cart"></i>
            <span class="badge-cart" id="cartCount">0</span>
        </button>

        <div class="modal fade bill-modal" id="billModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title"><i class="fas fa-receipt"></i> Invoice / Bill</h4>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body bill-body" id="billBody"></div>
                </div>
            </div>
        </div>
    `;

    // ========================================
    // AUTO-DETECT API PATH
    // ========================================
    function detectApi() {
        if (window.API_BASE) return window.API_BASE;
        const p = window.location.pathname;
        if (p.includes('/country-menus/') || p.includes('/friends-menu/') || p.includes('/italian-menu/')) {
            return '../../api';
        }
        return 'api';
    }
    const API = detectApi();

    // ========================================
    // DETECT SUCCESS PAGE PATH (relative to root)
    // ========================================
    function getSuccessPath() {
        const p = window.location.pathname;
        if (p.includes('/country-menus/') || p.includes('/friends-menu/') || p.includes('/italian-menu/')) {
            return '../../success.html';
        }
        return 'success.html';
    }

    // ========================================
    // INJECT STYLES + HTML
    // ========================================
    function injectCSS() {
        if (document.getElementById('lbvCartCSS')) return;
        const s = document.createElement('style');
        s.id = 'lbvCartCSS';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    function injectHTML() {
        if (document.getElementById('cartSidebar')) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = HTML;
        while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    }

    // ========================================
    // CART STATE
    // ========================================
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function showToast(msg, type) {
        const el = document.getElementById('toastNotification');
        const m = document.getElementById('toastMessage');
        if (!el || !m) return;
        m.textContent = msg;
        el.className = 'toast-notification';
        if (type === 'error') el.classList.add('error');
        el.classList.add('show');
        clearTimeout(window._lbvToast);
        window._lbvToast = setTimeout(function () { el.classList.remove('show'); }, 2500);
    }

    function renderCart() {
        const items = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const countEl = document.getElementById('cartCount');
        const btn = document.getElementById('checkoutBtn');
        if (!items) return;

        if (cart.length === 0) {
            items.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i>' +
                '<p>Your cart is empty</p>' +
                '<p style="font-size:.9rem;color:#bbb;">Start adding items from our menu!</p></div>';
            if (totalEl) totalEl.textContent = '$0.00';
            if (countEl) countEl.textContent = '0';
            if (btn) btn.disabled = true;
            saveCart();
            return;
        }

        let html = '', total = 0, count = 0;
        cart.forEach(function (item, i) {
            total += item.price * item.quantity;
            count += item.quantity;
            html += '<div class="cart-item">' +
                '<div class="cart-item-info">' +
                    '<div class="cart-item-name">' + item.name + '</div>' +
                    '<div class="cart-item-price">$' + item.price.toFixed(2) + ' each</div>' +
                '</div>' +
                '<div class="cart-item-controls">' +
                    '<button data-act="dec" data-i="' + i + '">−</button>' +
                    '<span class="cart-item-qty">' + item.quantity + '</span>' +
                    '<button data-act="inc" data-i="' + i + '">+</button>' +
                    '<button class="cart-item-remove" data-act="rm" data-i="' + i + '"><i class="fas fa-trash-alt"></i></button>' +
                '</div>' +
            '</div>';
        });

        items.innerHTML = html;
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
        if (countEl) countEl.textContent = count;
        if (btn) btn.disabled = false;
        saveCart();
    }

    function addToCart(id, name, price, image) {
        const existing = cart.find(function (i) { return i.id === id; });
        if (existing) existing.quantity += 1;
        else cart.push({ id: id, name: name, price: price, image: image, quantity: 1 });
        renderCart();
        showToast(name + ' added to cart!');
    }

    function toggleCart() {
        const sb = document.getElementById('cartSidebar');
        const ov = document.getElementById('cartOverlay');
        if (!sb || !ov) return;
        sb.classList.toggle('open');
        ov.classList.toggle('show');
        document.body.style.overflow = sb.classList.contains('open') ? 'hidden' : '';
    }

    // ========================================
    // SHOW BILL
    // ========================================
    function showBill() {
        if (cart.length === 0) return;

        const subtotal = cart.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
        const tax = subtotal * 0.08;
        const service = subtotal * 0.05;
        const grand = subtotal + tax + service;
        const orderNo = 'LBV-' + String(Date.now()).slice(-8);
        const date = new Date().toLocaleString();

        const rows = cart.map(function (i) {
            return '<div class="bill-item-row"><span>' + i.name + ' × ' + i.quantity + '</span>' +
                   '<span>$' + (i.price * i.quantity).toFixed(2) + '</span></div>';
        }).join('');

        document.getElementById('billBody').innerHTML =
            '<div class="bill-header">' +
                '<h2>🧾 La Belle Vie</h2>' +
                '<p>Fine Dining Restaurant</p>' +
                '<p style="font-size:.85rem;color:#999;">Order #' + orderNo + '</p>' +
                '<p style="font-size:.85rem;color:#999;">' + date + '</p>' +
            '</div>' +
            '<div class="bill-items">' + rows + '</div>' +
            '<div class="bill-totals">' +
                '<div class="total-row"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>' +
                '<div class="total-row"><span>Tax (8%)</span><span>$' + tax.toFixed(2) + '</span></div>' +
                '<div class="total-row"><span>Service Charge (5%)</span><span>$' + service.toFixed(2) + '</span></div>' +
                '<div class="total-row grand-total"><span>Grand Total</span><span>$' + grand.toFixed(2) + '</span></div>' +
            '</div>' +
            '<div class="bill-footer">' +
                '<p><i class="fas fa-heart" style="color:#C9A96E;"></i> Thank you for dining with us!</p>' +
                '<p style="font-size:.75rem;">Scan the QR to pay.</p>' +
            '</div>' +
            '<div class="bill-actions">' +
                '<button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print Bill</button>' +
                '<button class="btn btn-success" id="payNowBtn"><i class="fas fa-qrcode"></i> Pay Now</button>' +
            '</div>' +
            '<div id="qrArea"></div>';

        window._orderData = { orderNo: orderNo, grand: grand };

        const modal = new bootstrap.Modal(document.getElementById('billModal'));
        modal.show();

        setTimeout(function () {
            const p = document.getElementById('payNowBtn');
            if (!p) return;
            p.addEventListener('click', function () {
                p.disabled = true;
                p.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating…';

                const upi = 'upi://pay?pa=label@ybl&pn=La%20Belle%20Vie&am=' + grand.toFixed(2) +
                            '&cu=INR&tn=' + encodeURIComponent('Order ' + orderNo);

                const qrUrl = 'https://quickchart.io/qr?text=' + encodeURIComponent(upi) + '&size=250&margin=2';

                document.getElementById('qrArea').innerHTML =
                    '<div class="qr-wrap">' +
                        '<div class="amt">Amount: $' + grand.toFixed(2) + '</div>' +
                        '<img src="' + qrUrl + '" alt="Payment QR">' +
                        '<p class="hint">Scan with any UPI / wallet app, then click "I\'ve Paid".</p>' +
                        '<button class="btn btn-success" id="ivePaidBtn"><i class="fas fa-check-circle"></i> I\'ve Paid</button>' +
                    '</div>';

                document.getElementById('ivePaidBtn').addEventListener('click', function () {
                    // Clear cart
                    cart = [];
                    renderCart();
                    saveCart();

                    // Close modal
                    const m = bootstrap.Modal.getInstance(document.getElementById('billModal'));
                    if (m) m.hide();

                    // Redirect to correct success.html location
                    const successPath = getSuccessPath();
                    const params = new URLSearchParams({
                        order: orderNo,
                        amount: grand.toFixed(2)
                    });
                    window.location.href = successPath + '?' + params.toString();
                });

                p.innerHTML = '<i class="fas fa-check"></i> QR Ready';
            });
        }, 100);
    }

    // ========================================
    // BIND EVERYTHING (delegated)
    // ========================================
    document.addEventListener('click', function (e) {

        // Add to Cart buttons
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(addBtn.dataset.id, 10);
            const name = addBtn.dataset.name || 'Item';
            const price = parseFloat(addBtn.dataset.price) || 0;
            const image = addBtn.dataset.image || '';

            if (!id) return;
            addToCart(id, name, price, image);

            const orig = addBtn.innerHTML;
            addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            addBtn.classList.add('added');
            setTimeout(function () {
                addBtn.innerHTML = orig;
                addBtn.classList.remove('added');
            }, 1200);
            return;
        }

        // Cart item controls
        const ctrl = e.target.closest('[data-act]');
        if (ctrl) {
            const i = parseInt(ctrl.dataset.i, 10);
            const act = ctrl.dataset.act;
            if (isNaN(i) || !cart[i]) return;
            if (act === 'inc') cart[i].quantity += 1;
            else if (act === 'dec') { cart[i].quantity -= 1; if (cart[i].quantity <= 0) cart.splice(i, 1); }
            else if (act === 'rm') { showToast(cart[i].name + ' removed'); cart.splice(i, 1); }
            renderCart();
            return;
        }

        // Cart toggle
        if (e.target.closest('#cartToggle')) { toggleCart(); return; }
        if (e.target.closest('#closeCart')) { toggleCart(); return; }
        if (e.target.closest('#cartOverlay')) { toggleCart(); return; }

        // Checkout
        if (e.target.closest('#checkoutBtn')) {
            if (cart.length === 0) return;
            toggleCart();
            setTimeout(showBill, 400);
            return;
        }
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const sb = document.getElementById('cartSidebar');
            if (sb && sb.classList.contains('open')) toggleCart();
        }
    });

    // ========================================
    // BOOT
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            injectCSS();
            injectHTML();
            renderCart();
        });
    } else {
        injectCSS();
        injectHTML();
        renderCart();
    }

})();