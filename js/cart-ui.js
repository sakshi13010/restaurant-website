/* ========================================
   LA BELLE VIE — CART UI INJECTOR
   Auto-injects sidebar + bill modal + CSS
   ======================================== */

(function () {
    'use strict';

    // ---------- 1. INJECT CSS ----------
    if (!document.getElementById('lbv-cart-styles')) {
        const style = document.createElement('style');
        style.id = 'lbv-cart-styles';
        style.textContent = `
            /* Cart sidebar */
            .lbv-cart-sidebar {
                position:fixed;top:0;right:-450px;
                width:430px;max-width:100%;height:100vh;
                background:#fff;
                box-shadow:-10px 0 40px rgba(0,0,0,.15);
                z-index:9999;
                transition:right .4s cubic-bezier(.34,1.56,.64,1);
                display:flex;flex-direction:column;
            }
            .lbv-cart-sidebar.open { right:0; }

            .lbv-cart-overlay {
                position:fixed;inset:0;
                background:rgba(0,0,0,.5);
                z-index:9998;opacity:0;pointer-events:none;
                transition:opacity .4s ease;
            }
            .lbv-cart-overlay.show { opacity:1;pointer-events:all; }

            .lbv-cart-toggle {
                position:fixed;bottom:30px;right:30px;
                width:65px;height:65px;border-radius:50%;
                background:#722F37;color:#fff;border:none;
                font-size:1.8rem;cursor:pointer;
                box-shadow:0 10px 40px rgba(114,47,55,.4);
                transition:transform .4s cubic-bezier(.34,1.56,.64,1);
                z-index:999;
                display:flex;align-items:center;justify-content:center;
            }
            .lbv-cart-toggle:hover { transform:scale(1.15); }
            .lbv-cart-badge {
                position:absolute;top:-5px;right:-5px;
                background:#C9A96E;color:#1a1a1a;
                border-radius:50%;width:28px;height:28px;
                font-size:.8rem;font-weight:700;
                display:flex;align-items:center;justify-content:center;
                border:2px solid #fff;
            }

            .lbv-cart-header {
                padding:20px 25px;
                background:#722F37;color:#fff;
                display:flex;justify-content:space-between;align-items:center;
                border-bottom:2px solid #C9A96E;
            }
            .lbv-cart-header h3 {
                margin:0;font-family:'Playfair Display',serif;
                font-size:1.5rem;
            }
            .lbv-cart-header h3 i { color:#C9A96E;margin-right:10px; }
            .lbv-cart-close {
                background:none;border:none;color:#fff;
                font-size:1.8rem;cursor:pointer;
                transition:transform .3s ease;
            }
            .lbv-cart-close:hover { transform:rotate(90deg); }

            .lbv-cart-items {
                flex:1;overflow-y:auto;padding:15px 20px;
            }
            .lbv-cart-item {
                display:flex;justify-content:space-between;align-items:center;
                padding:12px 0;border-bottom:1px solid #eee;
            }
            .lbv-cart-item-info { flex:1; }
            .lbv-cart-item-name { font-weight:600;color:#2D2D2D;font-size:.95rem; }
            .lbv-cart-item-price { color:#722F37;font-weight:700;font-size:.9rem; }
            .lbv-cart-item-controls {
                display:flex;align-items:center;gap:8px;
            }
            .lbv-cart-item-controls button {
                width:30px;height:30px;border-radius:50%;
                border:1px solid #C9A96E;background:transparent;
                color:#722F37;font-weight:700;cursor:pointer;
                transition:all .3s ease;
                display:flex;align-items:center;justify-content:center;
            }
            .lbv-cart-item-controls button:hover {
                background:#C9A96E;color:#fff;
            }
            .lbv-cart-item-qty {
                font-weight:700;min-width:24px;text-align:center;
                color:#2D2D2D;
            }
            .lbv-cart-item-remove {
                color:#e74c3c !important;
                background:none !important;
                border:none !important;
                width:auto !important;height:auto !important;
                font-size:.9rem;padding:0 5px !important;
            }
            .lbv-cart-item-remove:hover { color:#c0392b !important; }

            .lbv-empty-cart {
                text-align:center;padding:50px 20px;color:#999;
            }
            .lbv-empty-cart i {
                font-size:4rem;color:#ddd;margin-bottom:15px;
            }

            .lbv-cart-footer {
                padding:20px 25px;border-top:2px solid #eee;
                background:#f8f9fa;
            }
            .lbv-cart-total {
                display:flex;justify-content:space-between;
                font-size:1.2rem;font-weight:700;color:#2D2D2D;
                margin-bottom:10px;
            }
            .lbv-cart-total span:last-child { color:#722F37; }
            .lbv-cart-checkout {
                width:100%;padding:14px;
                background:#722F37;color:#fff;
                border:none;border-radius:50px;
                font-weight:700;font-size:1.1rem;
                transition:all .3s ease;cursor:pointer;
            }
            .lbv-cart-checkout:hover:not(:disabled) {
                background:#C9A96E;color:#1a1a1a;transform:scale(1.02);
            }
            .lbv-cart-checkout:disabled {
                background:#ccc;cursor:not-allowed;
            }

            /* Bill modal */
            .lbv-bill-modal .modal-content {
                border-radius:20px;border:none;
                box-shadow:0 30px 80px rgba(0,0,0,.3);
                overflow:hidden;
            }
            .lbv-bill-modal .modal-header {
                background:linear-gradient(135deg,#722F37,#2d3436);
                color:#fff;border:none;padding:22px 28px;
            }
            .lbv-bill-body { padding:30px;background:#f8f5f2; }
            .lbv-bill-header {
                text-align:center;padding-bottom:20px;
                border-bottom:2px dashed #C9A96E;margin-bottom:20px;
            }
            .lbv-bill-header h2 {
                font-family:'Playfair Display',serif;
                color:#722F37;font-weight:900;
            }
            .lbv-bill-item-row {
                display:flex;justify-content:space-between;
                padding:8px 0;border-bottom:1px solid #eee;
                font-size:.95rem;
            }
            .lbv-bill-totals {
                padding-top:15px;border-top:2px solid #C9A96E;
            }
            .lbv-total-row {
                display:flex;justify-content:space-between;
                padding:5px 0;font-size:.95rem;
            }
            .lbv-total-row.lbv-grand {
                font-size:1.3rem;font-weight:700;color:#722F37;
                padding-top:10px;border-top:2px solid #722F37;margin-top:5px;
            }
            .lbv-bill-footer {
                text-align:center;padding-top:20px;
                border-top:2px dashed #C9A96E;
                margin-top:20px;color:#888;font-size:.85rem;
            }
            .lbv-bill-actions {
                display:flex;gap:10px;justify-content:center;
                margin-top:20px;flex-wrap:wrap;
            }

            /* QR area */
            .lbv-qr-wrap {
                text-align:center;padding:20px 0;
                border-top:2px dashed #C9A96E;margin-top:20px;
            }
            .lbv-qr-wrap img {
                width:230px;height:230px;
                border:4px solid #fff;border-radius:12px;
                box-shadow:0 10px 30px rgba(0,0,0,.15);
                margin:12px auto;display:block;
            }
            .lbv-qr-amount {
                font-size:1.4rem;color:#722F37;font-weight:700;
                margin:10px 0 4px;
            }
            .lbv-qr-hint {
                font-size:.85rem;color:#777;margin-bottom:12px;
            }

            /* Add to cart button (if not styled by page) */
            .add-to-cart-btn {
                background:#722F37;color:#fff;border:none;
                padding:6px 16px;border-radius:50px;
                font-size:.8rem;font-weight:600;
                transition:all .3s ease;cursor:pointer;
                margin-top:8px;width:100%;
            }
            .add-to-cart-btn:hover {
                background:#C9A96E;color:#1a1a1a;transform:scale(1.05);
            }
            .add-to-cart-btn.added { background:#27ae60; }

            /* Uniform images */
            .card .card-img-top {
                width:100%;height:220px;
                object-fit:cover;object-position:center;display:block;
            }

            @media (max-width:768px) {
                .lbv-cart-sidebar { width:100%;right:-100%; }
                .lbv-cart-toggle { width:55px;height:55px;font-size:1.4rem;bottom:20px;right:20px; }
                .card .card-img-top { height:180px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ---------- 2. INJECT HTML ----------
    function injectCartHTML() {
        if (document.getElementById('lbvCartSidebar')) return;

        // OVERLAY
        const overlay = document.createElement('div');
        overlay.className = 'lbv-cart-overlay';
        overlay.id = 'lbvCartOverlay';
        document.body.appendChild(overlay);

        // SIDEBAR
        const sidebar = document.createElement('div');
        sidebar.className = 'lbv-cart-sidebar';
        sidebar.id = 'lbvCartSidebar';
        sidebar.innerHTML = `
            <div class="lbv-cart-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Order</h3>
                <button class="lbv-cart-close" id="lbvCloseCart"><i class="fas fa-times"></i></button>
            </div>
            <div class="lbv-cart-items" id="lbvCartItems">
                <div class="lbv-empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size:.9rem;color:#bbb;">Start adding items from our menu!</p>
                </div>
            </div>
            <div class="lbv-cart-footer">
                <div class="lbv-cart-total">
                    <span>Total:</span>
                    <span id="lbvCartTotal">$0.00</span>
                </div>
                <button class="lbv-cart-checkout" id="lbvCheckoutBtn" disabled>
                    <i class="fas fa-credit-card"></i> View Bill & Checkout
                </button>
            </div>`;
        document.body.appendChild(sidebar);

        // TOGGLE BUTTON
        const toggle = document.createElement('button');
        toggle.className = 'lbv-cart-toggle';
        toggle.id = 'lbvCartToggle';
        toggle.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="lbv-cart-badge" id="lbvCartCount">0</span>`;
        document.body.appendChild(toggle);

        // BILL MODAL
        const modal = document.createElement('div');
        modal.className = 'modal fade lbv-bill-modal';
        modal.id = 'lbvBillModal';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title"><i class="fas fa-receipt"></i> Invoice / Bill</h4>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body lbv-bill-body" id="lbvBillBody"></div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    // ---------- 3. BOOT ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCartHTML);
    } else {
        injectCartHTML();
    }
})();