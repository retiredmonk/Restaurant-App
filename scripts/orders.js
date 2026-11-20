const storageKey = "matsumoto_cart";
const serviceFee = 250;

function formatPrice(price) {
    return `¥ ${price.toLocaleString("en-US")}`;
}

function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(savedCart)) return [];

        return savedCart
            .filter((item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                Number.isFinite(item.quantity) &&
                item.quantity > 0
            )
            .map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: Math.max(1, Math.floor(item.quantity))
            }));
    } catch {
        return [];
    }
}

function getPickupTime(date = new Date()) {
    const pickup = new Date(date.getTime() + 30 * 60 * 1000);
    return pickup.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = cart.length > 0 ? serviceFee : 0;

    const fields = {
        subtotal: formatPrice(subtotal),
        "order-subtotal": formatPrice(subtotal),
        "order-delivery": "Free",
        "order-service-fee": formatPrice(fee),
        "order-total": formatPrice(subtotal + fee),
        "pickup-time": getPickupTime()
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    const confirmButton = document.getElementById("confirm-order-btn");
    if (confirmButton) confirmButton.disabled = cart.length === 0;

    return { subtotal, serviceFee: fee, total: subtotal + fee };
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    if (!cartItems) return;

    const cart = loadCart();
    cartItems.replaceChildren();

    if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "cart-empty";
        empty.append(document.createTextNode("Your cart is empty. "));
        const menuLink = document.createElement("a");
        menuLink.href = "menu.html";
        menuLink.textContent = "Browse the Menu";
        empty.append(menuLink);
        cartItems.append(empty);
    } else {
        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "cart-item";

            const name = document.createElement("span");
            name.className = "cart-item-name";
            name.textContent = item.name;

            const price = document.createElement("span");
            price.className = "cart-item-price";
            price.textContent = formatPrice(item.price * item.quantity);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const decrease = document.createElement("button");
            decrease.type = "button";
            decrease.dataset.action = "decrease";
            decrease.dataset.id = item.id;
            decrease.setAttribute("aria-label", `Decrease ${item.name} quantity`);
            decrease.textContent = "−";

            const quantity = document.createElement("span");
            quantity.setAttribute("aria-live", "polite");
            quantity.textContent = String(item.quantity);

            const increase = document.createElement("button");
            increase.type = "button";
            increase.dataset.action = "increase";
            increase.dataset.id = item.id;
            increase.setAttribute("aria-label", `Increase ${item.name} quantity`);
            increase.textContent = "+";

            controls.append(decrease, quantity, increase);
            row.append(name, price, controls);
            cartItems.append(row);
        });
    }

    updateSummary(cart);
    return cart;
}

function updateCart(action, id) {
    let cart;
    try {
        const savedCart = JSON.parse(localStorage.getItem(storageKey) || "[]");
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch {
        cart = [];
    }

    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    if (action === "increase") item.quantity += 1;
    if (action === "decrease") item.quantity -= 1;

    cart = cart.filter((cartItem) => cartItem.quantity > 0);
    localStorage.setItem(storageKey, JSON.stringify(cart));
    renderCart();
}

const cartItems = document.getElementById("cart-items");
if (cartItems) {
    cartItems.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        updateCart(button.dataset.action, button.dataset.id);
    });
}

const cardNumber = document.getElementById("card-number");
const expiryDate = document.getElementById("expiry-date");
const cvv = document.getElementById("cvv");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const address = document.getElementById("address");

if (phone) {
    phone.addEventListener("input", () => {
        const digits = phone.value.replace(/\D/g, "").slice(0, 11);
        let formatted = digits;
        if (digits.length > 7) {
            formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        } else if (digits.length > 3) {
            formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        phone.value = formatted;
    });
}

if (cardNumber) {
    cardNumber.addEventListener("input", () => {
        const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
        cardNumber.value = digits.replace(/(.{4})(?=.)/g, "$1 ");
    });
}

if (expiryDate) {
    expiryDate.addEventListener("input", () => {
        const digits = expiryDate.value.replace(/\D/g, "").slice(0, 4);
        expiryDate.value = digits.length > 2
            ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
            : digits;
    });
}

if (cvv) {
    const validateCvv = () => {
        if (/^\d{3}$/.test(cvv.value)) {
            clearFieldError(cvv);
        } else {
            setFieldError(cvv, "Enter a 3-digit CVV.");
        }
    };
    cvv.addEventListener("input", () => {
        cvv.value = cvv.value.replace(/\D/g, "").slice(0, 3);
    });
    cvv.addEventListener("blur", validateCvv);
}

function getErrorElement(field) {
    let wrapper = field.closest(".info-group, .form-group");
    if (!wrapper) wrapper = field.parentElement;

    let error = wrapper.querySelector(".field-error");
    if (!error) {
        error = document.createElement("p");
        error.className = "field-error";
        wrapper.append(error);
    }
    return error;
}

function setFieldError(field, message) {
    const error = getErrorElement(field);
    if (!error.id) error.id = `${field.id}-error`;
    error.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", error.id);
}

function clearFieldError(field) {
    const wrapper = field.closest(".info-group, .form-group") || field.parentElement;
    const error = wrapper.querySelector(".field-error");
    if (error) error.textContent = "";
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
}

function isValidPhone(value) {
    return /^(070|080|090)-\d{4}-\d{4}$/.test(value);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

function isValidAddress(value) {
    const trimmed = value.trim();
    if (trimmed.length < 10) return false;

    const words = trimmed.split(/[\s,]+/).filter(Boolean);
    const hasTwoWords = words.length >= 2;
    const hasStreetDetail = /(?:\b(?:street|st|avenue|ave|road|rd|building|bldg)\b|丁目|番地|[-#/]\d)/i.test(trimmed);
    return hasTwoWords || hasStreetDetail;
}

document.querySelectorAll(".place-order input, .place-order textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
});

if (phone) {
    const validatePhone = () => {
        if (isValidPhone(phone.value)) {
            clearFieldError(phone);
        } else {
            const digits = phone.value.replace(/\D/g, "");
            const prefixMessage = digits.length >= 3 && !["070", "080", "090"].includes(digits.slice(0, 3))
                ? "Phone must start with 070, 080, or 090."
                : "Enter an 11-digit Japanese mobile number.";
            setFieldError(phone, prefixMessage);
        }
    };
    phone.addEventListener("blur", validatePhone);
}

if (email) {
    const validateEmail = () => {
        if (isValidEmail(email.value)) {
            clearFieldError(email);
        } else {
            setFieldError(email, "Enter a valid email address (name@example.com).");
        }
    };
    email.addEventListener("input", validateEmail);
    email.addEventListener("blur", validateEmail);
}

if (address) {
    const validateAddress = () => {
        if (isValidAddress(address.value)) {
            clearFieldError(address);
        } else {
            setFieldError(address, "Enter a complete address with at least 10 characters and street or building details.");
        }
    };
    address.addEventListener("input", validateAddress);
    address.addEventListener("blur", validateAddress);
}

function generateOrderRef() {
    const values = new Uint32Array(1);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(values);
        return `MAT-${String(values[0] % 10000).padStart(4, "0")}`;
    }
    return `MAT-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

function isValidExpiry(value) {
    const match = /^(\d{2})\s\/\s(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
    return expiryEnd >= now;
}

function showConfirmation(payload, cart) {
    const previouslyFocused = document.activeElement;
    const backdrop = document.createElement("div");
    backdrop.className = "order-modal-backdrop";

    const modal = document.createElement("section");
    modal.className = "order-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "order-confirmed-heading");

    const heading = document.createElement("h2");
    heading.id = "order-confirmed-heading";
    heading.textContent = "Order Confirmed";

    const reference = document.createElement("p");
    reference.className = "order-modal-reference";
    reference.textContent = `Order reference: ${payload.orderRef}`;

    const total = document.createElement("p");
    total.className = "order-modal-detail";
    total.textContent = `Total paid: ${formatPrice(payload.total)}`;

    const pickup = document.createElement("p");
    pickup.className = "order-modal-detail";
    pickup.textContent = `Estimated pickup time: ${payload.estimatedPickup}`;

    const actions = document.createElement("div");
    actions.className = "order-modal-actions";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "order-modal-close";
    closeButton.textContent = "Close";

    const returnLink = document.createElement("a");
    returnLink.className = "primary-button";
    returnLink.href = "menu.html";
    returnLink.textContent = "Return to Menu";

    actions.append(closeButton, returnLink);
    modal.append(heading, reference, total, pickup, actions);
    backdrop.append(modal);
    document.body.append(backdrop);

    const closeModal = () => {
        backdrop.remove();
        document.removeEventListener("keydown", handleKeydown);
        renderCart();
        if (previouslyFocused && typeof previouslyFocused.focus === "function") {
            previouslyFocused.focus();
        }
    };

    const handleKeydown = (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key === "Tab") {
            const focusable = Array.from(modal.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    };

    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", handleKeydown);
    returnLink.focus();
}

const orderForm = document.querySelector(".place-order");
if (orderForm) {
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const cart = loadCart();
        if (cart.length === 0) return;

        const fields = {
            name: document.getElementById("name"),
            phone: document.getElementById("phone"),
            email: document.getElementById("email"),
            address: document.getElementById("address"),
            cardholderName: document.getElementById("cardholder-name"),
            cardNumber: document.getElementById("card-number"),
            expiryDate: document.getElementById("expiry-date"),
            cvv: document.getElementById("cvv")
        };

        let firstInvalid = null;
        document.querySelectorAll(".place-order input, .place-order textarea").forEach(clearFieldError);

        const validate = (field, valid, message) => {
            if (!field || valid) return;
            setFieldError(field, message);
            if (!firstInvalid) firstInvalid = field;
        };

        validate(fields.name, fields.name.value.trim() !== "", "Enter your name.");
        validate(fields.phone, isValidPhone(fields.phone.value), "Enter an 11-digit Japanese mobile number starting with 070, 080, or 090.");
        validate(fields.email, isValidEmail(fields.email.value), "Enter a valid email address (name@example.com).");
        validate(fields.address, isValidAddress(fields.address.value), "Enter a complete address with at least 10 characters and street or building details.");
        validate(fields.cardholderName, fields.cardholderName.value.trim() !== "", "Enter the cardholder name.");
        validate(fields.cardNumber, fields.cardNumber.value.replace(/\D/g, "").length === 16, "Enter a 16-digit card number.");
        validate(fields.expiryDate, isValidExpiry(fields.expiryDate.value), "Enter a valid, future expiry date.");
        validate(fields.cvv, /^\d{3}$/.test(fields.cvv.value), "Enter a 3-digit CVV.");

        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const summary = updateSummary(cart);
        const cardDigits = fields.cardNumber.value.replace(/\D/g, "");
        const pickup = getPickupTime();
        const payload = {
            orderRef: generateOrderRef(),
            items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: summary.subtotal,
            serviceFee: summary.serviceFee,
            total: summary.total,
            customer: {
                name: fields.name.value.trim(),
                phone: fields.phone.value,
                email: fields.email.value.trim(),
                address: fields.address.value.trim()
            },
            paymentLast4: cardDigits.slice(-4),
            estimatedPickup: pickup,
            createdAt: new Date().toISOString()
        };

        localStorage.removeItem(storageKey);
        renderCart();
        showConfirmation(payload, cart);
    });
}

renderCart();
