/* ========================================
   LA BELLE VIE — SHARED CART SYSTEM
   CART + PERMANENT ADD HISTORY

   Cart:
   - Current items only

   History:
   - Every time an item is added
   - Never deleted when cart is cleared
   - Survives refresh/browser closing
   ======================================== */

(function () {

    'use strict';


    /* ========================================
       API PATH
    ======================================== */

    function detectApiBase() {

        if (window.API_BASE) {
            return window.API_BASE;
        }

        const path =
            window.location.pathname;

        if (
            path.includes('/country-menus/') ||
            path.includes('/friends-menu/') ||
            path.includes('/italian-menu/')
        ) {
            return '../../api';
        }

        return 'api';

    }


    const API_BASE =
        detectApiBase();


    /* ========================================
       SESSION
    ======================================== */

    let SESSION_ID =
        sessionStorage.getItem('lbv_session');


    if (!SESSION_ID) {

        SESSION_ID =
            'SESS-' +
            Math.random()
                .toString(36)
                .slice(2, 10);

        sessionStorage.setItem(
            'lbv_session',
            SESSION_ID
        );

    }


    /* ========================================
       STORAGE KEYS
    ======================================== */

    const CART_STORAGE_KEY =
        'lbv_cart';


    /*
     * THIS IS THE IMPORTANT NEW STORAGE.
     *
     * It is completely separate from the cart.
     *
     * Clearing the cart DOES NOT clear this.
     */

    const HISTORY_STORAGE_KEY =
        'lbv_history';


    /* ========================================
       TOAST
    ======================================== */

    function toast(
        msg,
        type = 'success'
    ) {

        let el =
            document.getElementById(
                'lbv-toast'
            );


        if (!el) {

            el =
                document.createElement(
                    'div'
                );

            el.id =
                'lbv-toast';


            el.style.cssText = `
                position:fixed;
                bottom:100px;
                right:30px;
                background:#27ae60;
                color:#fff;
                padding:14px 22px;
                border-radius:14px;
                font-weight:600;
                font-size:.92rem;
                z-index:100000;
                box-shadow:0 10px 30px rgba(0,0,0,.2);
                transform:translateY(120px);
                opacity:0;
                transition:all .4s cubic-bezier(.34,1.56,.64,1);
                max-width:340px;
                font-family:'Inter',sans-serif;
                display:flex;
                align-items:center;
                gap:10px;
            `;


            document.body.appendChild(
                el
            );

        }


        el.textContent =
            msg;


        el.style.background =
            type === 'error'
                ? '#e74c3c'
                : '#27ae60';


        void el.offsetWidth;


        el.style.transform =
            'translateY(0)';


        el.style.opacity =
            '1';


        clearTimeout(
            window._lbvToastTimer
        );


        window._lbvToastTimer =
            setTimeout(
                () => {

                    el.style.transform =
                        'translateY(120px)';

                    el.style.opacity =
                        '0';

                },
                2500
            );

    }


    /* ========================================
       CART STATE
    ======================================== */

    let cart =
        loadCart();


    function loadCart() {

        try {

            const saved =
                localStorage.getItem(
                    CART_STORAGE_KEY
                );


            if (!saved) {
                return [];
            }


            const parsed =
                JSON.parse(saved);


            return Array.isArray(parsed)
                ? parsed
                : [];


        } catch (error) {

            console.error(
                'Unable to load cart:',
                error
            );


            return [];

        }

    }


    function saveCart() {

        try {

            localStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(cart)
            );

        } catch (error) {

            console.error(
                'Unable to save cart:',
                error
            );

        }

    }


    /* ========================================
       HISTORY STATE
    ======================================== */

    function loadHistory() {

        try {

            const saved =
                localStorage.getItem(
                    HISTORY_STORAGE_KEY
                );


            if (!saved) {
                return [];
            }


            const parsed =
                JSON.parse(saved);


            return Array.isArray(parsed)
                ? parsed
                : [];


        } catch (error) {

            console.error(
                'Unable to load history:',
                error
            );


            return [];

        }

    }


    function saveHistory(
        history
    ) {

        try {

            localStorage.setItem(
                HISTORY_STORAGE_KEY,
                JSON.stringify(history)
            );


            return true;


        } catch (error) {

            console.error(
                'Unable to save history:',
                error
            );


            return false;

        }

    }


    /* ========================================
       CREATE HISTORY ID
    ======================================== */

    function createHistoryId() {

        return (
            'HIST-' +
            Date.now() +
            '-' +
            Math.random()
                .toString(36)
                .substring(2, 10)
        );

    }


    /* ========================================
       ADD ITEM TO PERMANENT HISTORY
    ======================================== */

    function addToHistory(
        item
    ) {

        const history =
            loadHistory();


        const historyItem = {

            /*
             * Unique history entry.
             */

            history_id:
                createHistoryId(),


            /*
             * Product information.
             */

            item_id:
                Number(item.id),


            name:
                item.name || 'Item',


            price:
                Number(item.price) || 0,


            image:
                item.image || '',


            quantity:
                1,


            /*
             * When it was added.
             */

            added_at:
                new Date().toISOString(),


            added_timestamp:
                Date.now(),


            /*
             * Session in which it was added.
             */

            session_id:
                SESSION_ID

        };


        /*
         * IMPORTANT:
         *
         * PUSH creates a NEW record.
         *
         * We DO NOT search for an existing
         * product and update it.
         *
         * Therefore:
         *
         * Add Pizza
         * Add Pizza
         * Add Pizza
         *
         * = 3 history records.
         */

        history.push(
            historyItem
        );


        saveHistory(
            history
        );


        /*
         * Notify the website.
         */

        document.dispatchEvent(
            new CustomEvent(
                'lbv:history-updated',
                {
                    detail:
                        historyItem
                }
            )
        );


        return historyItem;

    }


    /* ========================================
       GET COMPLETE HISTORY
    ======================================== */

    function getHistory() {

        return loadHistory();

    }


    /* ========================================
       GET HISTORY - NEWEST FIRST
    ======================================== */

    function getHistoryNewestFirst() {

        return loadHistory()
            .slice()
            .sort(
                function (a, b) {

                    return (
                        Number(
                            b.added_timestamp
                        ) -
                        Number(
                            a.added_timestamp
                        )
                    );

                }
            );

    }


    /* ========================================
       HISTORY COUNT
    ======================================== */

    function getHistoryCount() {

        return loadHistory().length;

    }


    /* ========================================
       HISTORY QUANTITY
    ======================================== */

    function getHistoryQuantity() {

        return loadHistory()
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        (
                            Number(
                                item.quantity
                            ) || 0
                        )
                    );

                },
                0
            );

    }


    /* ========================================
       HISTORY VALUE
    ======================================== */

    function getHistoryValue() {

        return loadHistory()
            .reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        (
                            (
                                Number(
                                    item.price
                                ) || 0
                            ) *
                            (
                                Number(
                                    item.quantity
                                ) || 0
                            )
                        )
                    );

                },
                0
            );

    }


    /* ========================================
       GET HISTORY FOR ONE ITEM
    ======================================== */

    function getItemHistory(
        itemId
    ) {

        return getHistoryNewestFirst()
            .filter(
                function (item) {

                    return (
                        String(
                            item.item_id
                        ) ===
                        String(
                            itemId
                        )
                    );

                }
            );

    }


    /* ========================================
       DELETE ONE HISTORY RECORD
       ======================================== */

    function removeHistoryItem(
        historyId
    ) {

        const history =
            loadHistory();


        const updated =
            history.filter(
                function (item) {

                    return (
                        item.history_id !==
                        historyId
                    );

                }
            );


        saveHistory(
            updated
        );


        document.dispatchEvent(
            new CustomEvent(
                'lbv:history-updated'
            )
        );


        return true;

    }


    /* ========================================
       CLEAR ALL HISTORY
       ========================================

       This is NOT called automatically.

       Cart clearing/payment DOES NOT call this.

       It only runs if you explicitly call:

       Cart.clearHistory()

       or

       window.lbvClearHistory()
    */

    function clearHistory() {

        localStorage.removeItem(
            HISTORY_STORAGE_KEY
        );


        document.dispatchEvent(
            new CustomEvent(
                'lbv:history-cleared'
            )
        );


        toast(
            'History cleared.'
        );

    }


    /* ========================================
       BADGE
    ======================================== */

    function updateBadge() {

        const count =
            cart.reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        (
                            Number(
                                item.quantity
                            ) || 0
                        )
                    );

                },
                0
            );


        document
            .querySelectorAll(
                '#lbvCartCount, .lbv-cart-badge'
            )
            .forEach(
                function (badge) {

                    badge.textContent =
                        count;


                    badge.style.display =
                        count > 0
                            ? ''
                            : 'none';

                }
            );

    }


    /* ========================================
       RENDER CART
    ======================================== */

    function renderCart() {

        const container =
            document.getElementById(
                'lbvCartItems'
            );


        const totalEl =
            document.getElementById(
                'lbvCartTotal'
            );


        const btn =
            document.getElementById(
                'lbvCheckoutBtn'
            );


        if (!container) {

            updateBadge();

            return;

        }


        if (cart.length === 0) {

            container.innerHTML = `
                <div class="lbv-empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <p style="
                        font-size:.9rem;
                        color:#bbb;
                    ">
                        Start adding items from our menu!
                    </p>
                </div>
            `;


            if (totalEl) {

                totalEl.textContent =
                    '₹0.00';

            }


            if (btn) {

                btn.disabled =
                    true;

            }


            updateBadge();

            return;

        }


        let html = '';

        let total = 0;


        cart.forEach(
            function (
                item,
                idx
            ) {

                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 0;


                total +=
                    price *
                    quantity;


                html += `
                    <div class="lbv-cart-item">

                        <div class="lbv-cart-item-info">

                            <div class="lbv-cart-item-name">
                                ${escapeHTML(item.name)}
                            </div>

                            <div class="lbv-cart-item-price">
                                ₹${price.toFixed(2)} each
                            </div>

                        </div>


                        <div class="lbv-cart-item-controls">

                            <button
                                type="button"
                                data-lbv-action="dec"
                                data-index="${idx}"
                            >
                                −
                            </button>


                            <span class="lbv-cart-item-qty">
                                ${quantity}
                            </span>


                            <button
                                type="button"
                                data-lbv-action="inc"
                                data-index="${idx}"
                            >
                                +
                            </button>


                            <button
                                type="button"
                                class="lbv-cart-item-remove"
                                data-lbv-action="remove"
                                data-index="${idx}"
                            >
                                <i class="fas fa-trash-alt"></i>
                            </button>

                        </div>

                    </div>
                `;

            }
        );


        container.innerHTML =
            html;


        if (totalEl) {

            totalEl.textContent =
                '₹' +
                total.toFixed(2);

        }


        if (btn) {

            btn.disabled =
                false;

        }


        updateBadge();


        saveCart();

    }


    /* ========================================
       ESCAPE HTML
    ======================================== */

    function escapeHTML(
        value
    ) {

        const div =
            document.createElement(
                'div'
            );


        div.textContent =
            value == null
                ? ''
                : String(value);


        return div.innerHTML;

    }


    /* ========================================
       EVENTS
    ======================================== */

    document.addEventListener(
        'click',
        function (e) {


            /* ====================================
               ADD TO CART
            ==================================== */

            const addBtn =
                e.target.closest(
                    '[data-add-to-cart], .add-to-cart-btn'
                );


            if (addBtn) {

                e.preventDefault();

                e.stopPropagation();


                const id =
                    parseInt(
                        addBtn.dataset.itemId ||
                        addBtn.dataset.id,
                        10
                    );


                const name =
                    addBtn.dataset.name ||
                    addBtn.dataset.itemName ||
                    'Item';


                const price =
                    parseFloat(
                        addBtn.dataset.price ||
                        0
                    );


                const image =
                    addBtn.dataset.image ||
                    '';


                if (!id) {

                    return;

                }


                const item = {

                    id:

                        id,

                    name:

                        name,

                    price:

                        price,

                    image:

                        image

                };


                /* =================================
                   CURRENT CART
                   ================================= */

                const existing =
                    cart.find(
                        function (i) {

                            return (
                                Number(i.id) ===
                                Number(id)
                            );

                        }
                    );


                if (existing) {

                    existing.quantity += 1;

                } else {

                    cart.push({

                        id:

                            id,

                        name:

                            name,

                        price:

                            price,

                        image:

                            image,

                        quantity:

                            1

                    });

                }


                /* =================================
                   SAVE CURRENT CART
                   ================================= */

                saveCart();


                /* =================================
                   SAVE PERMANENT HISTORY
                   =================================

                   THIS HAPPENS EVERY TIME ADD
                   IS CLICKED.
                */

                const historyItem =
                    addToHistory(
                        item
                    );


                /* =================================
                   RENDER
                   ================================= */

                renderCart();


                /* =================================
                   TOAST
                   ================================= */

                toast(
                    `✅ ${name} added!`
                );


                /* =================================
                   OPEN CART
                   ================================= */

                openCart();


                /* =================================
                   BACKEND
                   ================================= */

                fetch(
                    API_BASE +
                    '/cart.php?action=add',
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                item_id:
                                    id,

                                quantity:
                                    1

                            })

                    }
                )
                .catch(
                    function () {}
                );


                /* =================================
                   BUTTON FEEDBACK
                   ================================= */

                const originalHTML =
                    addBtn.innerHTML;


                addBtn.innerHTML =
                    '<i class="fas fa-check"></i> Added!';


                addBtn.classList.add(
                    'added'
                );


                setTimeout(
                    function () {

                        addBtn.innerHTML =
                            originalHTML;


                        addBtn.classList.remove(
                            'added'
                        );

                    },
                    1200
                );


                /*
                 * Make the history record
                 * available globally if needed.
                 */

                window._lbvLastHistoryItem =
                    historyItem;


                return;

            }


            /* ====================================
               CART CONTROLS
               ==================================== */

            const ctrl =
                e.target.closest(
                    '[data-lbv-action]'
                );


            if (ctrl) {

                const idx =
                    parseInt(
                        ctrl.dataset.index,
                        10
                    );


                const action =
                    ctrl.dataset.lbvAction;


                if (
                    isNaN(idx) ||
                    !cart[idx]
                ) {

                    return;

                }


                if (
                    action === 'inc'
                ) {

                    cart[idx].quantity += 1;

                }


                else if (
                    action === 'dec'
                ) {

                    cart[idx].quantity -= 1;


                    if (
                        cart[idx].quantity <= 0
                    ) {

                        cart.splice(
                            idx,
                            1
                        );

                    }

                }


                else if (
                    action === 'remove'
                ) {

                    const n =
                        cart[idx].name;


                    cart.splice(
                        idx,
                        1
                    );


                    toast(
                        `🗑️ ${n} removed`
                    );

                }


                saveCart();

                renderCart();

            }

        }
    );


    /* ========================================
       OPEN / CLOSE CART
    ======================================== */

    function openCart() {

        const sb =
            document.getElementById(
                'lbvCartSidebar'
            );


        const ov =
            document.getElementById(
                'lbvCartOverlay'
            );


        if (sb) {

            sb.classList.add(
                'open'
            );

        }


        if (ov) {

            ov.classList.add(
                'show'
            );

        }


        document.body.style.overflow =
            'hidden';

    }


    function closeCart() {

        const sb =
            document.getElementById(
                'lbvCartSidebar'
            );


        const ov =
            document.getElementById(
                'lbvCartOverlay'
            );


        if (sb) {

            sb.classList.remove(
                'open'
            );

        }


        if (ov) {

            ov.classList.remove(
                'show'
            );

        }


        document.body.style.overflow =
            '';

    }


    window.lbvOpenCart =
        openCart;


    window.lbvCloseCart =
        closeCart;


    /* ========================================
       BILL
    ======================================== */

    function showBill() {

        if (
            cart.length === 0
        ) {

            return;

        }


        const subtotal =
            cart.reduce(
                function (
                    s,
                    i
                ) {

                    return (
                        s +
                        (
                            i.price *
                            i.quantity
                        )
                    );

                },
                0
            );


        const tax =
            subtotal *
            0.08;


        const service =
            subtotal *
            0.05;


        const grand =
            subtotal +
            tax +
            service;


        const orderNo =
            'LBV-' +
            String(
                Date.now()
            ).slice(-8);


        const date =
            new Date()
                .toLocaleString();


        const items =
            cart.map(
                function (i) {

                    return `
                        <div class="lbv-bill-item-row">

                            <span>
                                ${escapeHTML(i.name)}
                                × ${i.quantity}
                            </span>

                            <span>
                                ₹${(
                                    i.price *
                                    i.quantity
                                ).toFixed(2)}
                            </span>

                        </div>
                    `;

                }
            )
            .join('');


        const billBody =
            document.getElementById(
                'lbvBillBody'
            );


        if (!billBody) {

            return;

        }


        billBody.innerHTML = `

            <div class="lbv-bill-header">

                <h2>
                    🧾 La Belle Vie
                </h2>

                <p>
                    Fine Dining Restaurant
                </p>

                <p style="
                    font-size:.85rem;
                    color:#999;
                ">
                    Order #${orderNo}
                </p>

                <p style="
                    font-size:.85rem;
                    color:#999;
                ">
                    ${date}
                </p>

            </div>


            <div>
                ${items}
            </div>


            <div class="lbv-bill-totals">

                <div class="lbv-total-row">
                    <span>Subtotal</span>
                    <span>
                        ₹${subtotal.toFixed(2)}
                    </span>
                </div>


                <div class="lbv-total-row">
                    <span>Tax (8%)</span>
                    <span>
                        ₹${tax.toFixed(2)}
                    </span>
                </div>


                <div class="lbv-total-row">
                    <span>Service (5%)</span>
                    <span>
                        ₹${service.toFixed(2)}
                    </span>
                </div>


                <div class="lbv-total-row lbv-grand">
                    <span>Grand Total</span>
                    <span>
                        ₹${grand.toFixed(2)}
                    </span>
                </div>

            </div>


            <div class="lbv-bill-footer">

                <p>
                    <i
                        class="fas fa-heart"
                        style="color:#C9A96E;"
                    ></i>

                    Thank you!
                </p>

            </div>


            <div class="lbv-bill-actions">

                <button
                    class="btn btn-primary"
                    onclick="window.print()"
                >
                    <i class="fas fa-print"></i>
                    Print
                </button>


                <button
                    class="btn btn-success"
                    id="lbvPayBtn"
                >
                    <i class="fas fa-qrcode"></i>
                    Pay Now
                </button>

            </div>


            <div id="lbvQrArea"></div>
        `;


        window._lbvOrder = {

            orderNo:
                orderNo,

            grand:
                grand

        };


        const modalElement =
            document.getElementById(
                'lbvBillModal'
            );


        if (!modalElement) {

            return;

        }


        const modal =
            new bootstrap.Modal(
                modalElement
            );


        modal.show();


        setTimeout(
            function () {

                const payBtn =
                    document.getElementById(
                        'lbvPayBtn'
                    );


                if (!payBtn) {

                    return;

                }


                payBtn.addEventListener(
                    'click',
                    function () {

                        generateQR(
                            payBtn,
                            grand,
                            orderNo
                        );

                    }
                );

            },
            100
        );

    }


    /* ========================================
       QR
    ======================================== */

    async function generateQR(
        btn,
        amount,
        orderNo
    ) {

        btn.disabled =
            true;


        btn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Generating…';


        const upi =
            `upi://pay?pa=label@ybl&pn=La%20Belle%20Vie&am=${amount.toFixed(2)}&cu=INR&tn=Order%20${orderNo}`;


        let qrUrl =
            null;


        try {

            const res =
                await fetch(
                    API_BASE +
                    '/payment_qr.php',
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                amount:

                                    amount,

                                order_no:

                                    orderNo,

                                upi:

                                    upi

                            })

                    }
                );


            const data =
                await res.json();


            if (
                data.success &&
                data.qr
            ) {

                qrUrl =
                    data.qr;

            }

        } catch (_) {}


        /*
         * Fallback QR.
         */

        if (!qrUrl) {

            qrUrl =
                'https://quickchart.io/qr?text=' +
                encodeURIComponent(upi) +
                '&size=260&margin=2';

        }


        const qrArea =
            document.getElementById(
                'lbvQrArea'
            );


        if (!qrArea) {

            return;

        }


        qrArea.innerHTML = `

            <div class="lbv-qr-wrap">

                <div class="lbv-qr-amount">

                    Amount:
                    ₹${amount.toFixed(2)}

                </div>


                <img
                    src="${escapeHTML(qrUrl)}"
                    alt="Payment QR"
                >


                <p class="lbv-qr-hint">

                    Scan with GPay,
                    PhonePe,
                    Paytm,
                    or any UPI app.

                </p>


                <button
                    class="btn btn-success"
                    id="lbvIvePaidBtn"
                >

                    <i
                        class="fas fa-check-circle"
                    ></i>

                    I've Paid

                </button>

            </div>
        `;


        const paidBtn =
            document.getElementById(
                'lbvIvePaidBtn'
            );


        if (paidBtn) {

            paidBtn.addEventListener(
                'click',
                function () {


                    /*
                     * IMPORTANT:
                     *
                     * We clear ONLY the current cart.
                     *
                     * HISTORY STAYS.
                     */

                    cart = [];


                    saveCart();


                    renderCart();


                    const modalEl =
                        document.getElementById(
                            'lbvBillModal'
                        );


                    const modal =
                        bootstrap.Modal
                            .getInstance(
                                modalEl
                            );


                    if (modal) {

                        modal.hide();

                    }


                    window.location.href =
                        (
                            window.API_BASE_SUBPATH ||
                            ''
                        ) +
                        'payment-success.html?order=' +
                        encodeURIComponent(
                            orderNo
                        ) +
                        '&amount=' +
                        amount.toFixed(2);

                }
            );

        }

    }


    /* ========================================
       GLOBAL FUNCTIONS
    ======================================== */

    window.lbvShowBill =
        showBill;


    window.lbvRenderCart =
        renderCart;


    /*
     * HISTORY API
     */

    window.lbvGetHistory =
        getHistoryNewestFirst;


    window.lbvGetHistoryCount =
        getHistoryCount;


    window.lbvGetHistoryQuantity =
        getHistoryQuantity;


    window.lbvGetHistoryValue =
        getHistoryValue;


    window.lbvGetItemHistory =
        getItemHistory;


    window.lbvRemoveHistoryItem =
        removeHistoryItem;


    window.lbvClearHistory =
        clearHistory;


    /* ========================================
       CART OBJECT
       ======================================== */

    /*
     * This lets your checkout page continue
     * using Cart.get(), Cart.update(), etc.
     *
     * It also exposes the history functions.
     */

    window.Cart = {

        getHistory:
            getHistory,

        getHistoryNewestFirst:
            getHistoryNewestFirst,

        getHistoryCount:
            getHistoryCount,

        getHistoryQuantity:
            getHistoryQuantity,

        getHistoryValue:
            getHistoryValue,

        getItemHistory:
            getItemHistory,

        removeHistoryItem:
            removeHistoryItem,

        clearHistory:
            clearHistory

    };


    /* ========================================
       DOM READY
    ======================================== */

    document.addEventListener(
        'DOMContentLoaded',
        function () {


            /*
             * Cart toggle.
             */

            const toggle =
                document.getElementById(
                    'lbvCartToggle'
                );


            if (toggle) {

                toggle.addEventListener(
                    'click',
                    openCart
                );

            }


            /*
             * Close button.
             */

            const close =
                document.getElementById(
                    'lbvCloseCart'
                );


            if (close) {

                close.addEventListener(
                    'click',
                    closeCart
                );

            }


            /*
             * Overlay.
             */

            const overlay =
                document.getElementById(
                    'lbvCartOverlay'
                );


            if (overlay) {

                overlay.addEventListener(
                    'click',
                    closeCart
                );

            }


            /*
             * Checkout.
             */

            const checkout =
                document.getElementById(
                    'lbvCheckoutBtn'
                );


            if (checkout) {

                checkout.addEventListener(
                    'click',
                    function () {

                        if (
                            cart.length === 0
                        ) {

                            return;

                        }


                        closeCart();


                        setTimeout(
                            showBill,
                            400
                        );

                    }
                );

            }


            /*
             * Escape.
             */

            document.addEventListener(
                'keydown',
                function (e) {

                    if (
                        e.key === 'Escape'
                    ) {

                        closeCart();

                    }

                }
            );


            /*
             * Initial render.
             */

            renderCart();


            /*
             * Initial badge.
             */

            updateBadge();

        }
    );


    /* ========================================
       STORAGE EVENT
       ======================================== */

    /*
     * If the user has the Menu open in one
     * browser tab and History open in another,
     * update the history when localStorage
     * changes.
     */

    window.addEventListener(
        'storage',
        function (event) {

            if (
                event.key ===
                HISTORY_STORAGE_KEY
            ) {

                document.dispatchEvent(
                    new CustomEvent(
                        'lbv:history-updated'
                    )
                );

            }


            if (
                event.key ===
                CART_STORAGE_KEY
            ) {

                cart =
                    loadCart();

                renderCart();

            }

        }
    );


    /* ========================================
       DEBUG
    ======================================== */

    console.log(
        '🍽️ La Belle Vie Cart + Permanent History Loaded'
    );


})();
