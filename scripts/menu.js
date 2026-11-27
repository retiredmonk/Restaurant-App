const menuData = {
    "small-plates": [
        { id: "agedashi-tofu", name: "Agedashi Tofu", description: "Silken tofu crisped to order in kombu dashi with daikon and scallion.", price: 980 },
        { id: "smoked-edamame", name: "Smoked Edamame", description: "Warm young soybeans finished with smoked sea salt and yuzu kosho.", price: 680 },
        { id: "hamachi-crudo", name: "Hamachi Crudo", description: "Thin-cut yellowtail with shiso oil, ponzu, daikon, and fresh wasabi.", price: 1680 }
    ],
    sashimi: [
        { id: "otoro-nigiri", name: "Otoro Nigiri", description: "Fatty bluefin tuna atop red-vinegar rice with aged nikiri soy.", price: 1980 },
        { id: "hokkaido-uni", name: "Hokkaido Uni", description: "Sweet Hokkaido sea urchin, warm shari, nori, and a whisper of ponzu.", price: 2280 },
        { id: "seasonal-sashimi-selection", name: "Seasonal Sashimi Selection", description: "Chef's selection of three pristine seasonal cuts with freshly grated wasabi.", price: 3980 }
    ],
    "signature-rolls": [
        { id: "spicy-bluefin-tuna-roll", name: "Spicy Bluefin Tuna Roll", description: "Bluefin tuna, cucumber, kizami shiso, and sesame-yuzu spice.", price: 1680 },
        { id: "crispy-soft-shell-crab-roll", name: "Crispy Soft-Shell Crab Roll", description: "Soft-shell crab, avocado, cucumber, kabayaki, and pickled daikon.", price: 1880 },
        { id: "truffle-avocado-roll", name: "Truffle Avocado Roll", description: "Agedashi tofu, avocado, cucumber, truffle, and smoked soy.", price: 1480 }
    ],
    mains: [
        { id: "miso-black-cod", name: "Miso Black Cod", description: "Saikyo-miso cured cod, charred scallion, ginger, and yuzu jus.", price: 3480 },
        { id: "a5-wagyu-striploin", name: "A5 Wagyu Striploin", description: "Miyazaki A5 striploin, smoked bone jus, and fresh wasabi.", price: 4880 },
        { id: "dashi-duck-breast", name: "Dashi Duck Breast", description: "Slow-roasted duck, kombu jus, sansho, and pickled Japanese plum.", price: 3280 }
    ]
};

const categoryNames = {
    "small-plates": "Small Plates",
    sashimi: "Sashimi",
    "signature-rolls": "Signature Rolls",
    mains: "Mains"
};

const storageKey = "matsumoto_cart";
let cart = [];

function formatPrice(price) {
    return `¥ ${price.toLocaleString("en-US")}`;
}

function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(savedCart)) throw new Error("Invalid cart");

        cart = savedCart
            .filter((item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                Number.isFinite(item.quantity)
            )
            .map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: Math.max(1, Math.floor(item.quantity))
            }));
    } catch {
        localStorage.removeItem(storageKey);
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem(storageKey, JSON.stringify(cart));
}

function renderMenu() {
    Object.entries(menuData).forEach(([categoryId, dishes]) => {
        const panel = document.getElementById(categoryId);
        if (!panel) return;

        const placeholder = panel.querySelector(".placeholder");
        if (!placeholder) return;

        const heading = document.createElement("h2");
        heading.className = "category-heading";
        heading.textContent = categoryNames[categoryId];
        panel.prepend(heading);
        placeholder.replaceChildren();

        dishes.forEach((dish) => {
            const card = document.createElement("article");
            card.className = "food-card";

            const copy = document.createElement("div");
            copy.className = "food-card-copy";

            const name = document.createElement("h3");
            name.textContent = dish.name;

            const description = document.createElement("p");
            description.textContent = dish.description;

            copy.append(name, description);

            const aside = document.createElement("div");
            aside.className = "food-card-aside";

            const price = document.createElement("span");
            price.className = "food-price";
            price.textContent = formatPrice(dish.price);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "add-to-cart";
            button.dataset.id = dish.id;
            button.setAttribute("aria-label", `Add ${dish.name} to cart`);
            button.textContent = "+ Add";

            aside.append(price, button);
            card.append(copy, aside);
            placeholder.append(card);
        });
    });
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const subtotal = document.getElementById("subtotal");
    if (!cartItems || !subtotal) return;

    cartItems.replaceChildren();
    let total = 0;

    if (cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "cart-empty";
        empty.textContent = "Your cart is empty.";
        cartItems.append(empty);
        subtotal.textContent = "¥ 0";
        return;
    }

    cart.forEach((item) => {
        total += item.price * item.quantity;

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
        controls.setAttribute("aria-label", `Quantity for ${item.name}`);

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

    subtotal.textContent = formatPrice(total);
}

function setCategory(categoryId) {
    document.querySelectorAll(".menu-nav a").forEach((link) => {
        const selected = link.getAttribute("href") === `#${categoryId}`;
        link.classList.toggle("active", selected);
        if (selected) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
    });
}

function scrollToCategory(categoryId) {
    const target = document.getElementById(categoryId);
    if (!target) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
    });
}

function activateCategory(categoryId, shouldScroll = true) {
    setCategory(categoryId);

    if (shouldScroll) {
        window.requestAnimationFrame(() => scrollToCategory(categoryId));
    }
}

function initializeTabs() {
    return;
}

function initializeCategoryLinks() {
    document.querySelectorAll(".menu-nav a").forEach((link) => {
        link.addEventListener("click", (event) => {
            const categoryId = link.hash.slice(1);
            if (!document.getElementById(categoryId)) return;

            event.preventDefault();
            scrollToCategory(categoryId);
            window.history.replaceState(null, "", `#${categoryId}`);
        });
    });

    const categoryId = window.location.hash.slice(1);
    if (Object.prototype.hasOwnProperty.call(categoryNames, categoryId)) {
        setCategory(categoryId);
        window.requestAnimationFrame(() => scrollToCategory(categoryId));
    }

    window.addEventListener("hashchange", () => {
        const nextCategory = window.location.hash.slice(1);
        if (Object.prototype.hasOwnProperty.call(categoryNames, nextCategory)) {
            setCategory(nextCategory);
        }
    });

    const sections = [...document.querySelectorAll(".menu-categories > section")];
    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCategory(visible.target.id);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
}

function initializeCart() {
    const menuPanels = document.getElementById("menu-panels");
    const cartItems = document.getElementById("cart-items");
    const buttonTimers = new WeakMap();
    let toast = document.querySelector(".cart-toast");
    let toastTimer;

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "cart-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.setAttribute("aria-atomic", "true");
        document.body.append(toast);
    }

    function showToast(dishName) {
        toast.textContent = `Added ${dishName} to cart`;
        toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2000);
    }

    menuPanels.addEventListener("click", (event) => {
        const button = event.target.closest(".add-to-cart");
        if (!button) return;

        const dish = Object.values(menuData)
            .flat()
            .find((item) => item.id === button.dataset.id);
        if (!dish) return;

        const existing = cart.find((item) => item.id === dish.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
        showToast(dish.name);

        const cartPanel = document.getElementById("cart");
        if (cartPanel) {
            cartPanel.classList.remove("cart-bump");
            void cartPanel.offsetWidth;
            cartPanel.classList.add("cart-bump");
        }

        window.clearTimeout(buttonTimers.get(button));
        button.textContent = "Added ✓";
        const buttonTimer = window.setTimeout(() => {
            button.textContent = "+ Add";
            buttonTimers.delete(button);
        }, 1100);
        buttonTimers.set(button, buttonTimer);
    });

    cartItems.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const item = cart.find((cartItem) => cartItem.id === button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "increase") item.quantity += 1;
        if (button.dataset.action === "decrease") item.quantity -= 1;

        if (item.quantity <= 0) {
            cart = cart.filter((cartItem) => cartItem.id !== item.id);
        }

        saveCart();
        renderCart();
    });
}

loadCart();
renderMenu();
renderCart();
initializeTabs();
initializeCart();
initializeCategoryLinks();
