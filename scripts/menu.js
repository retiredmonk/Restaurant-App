const menuData = {
    appetizers: [
        { id: "agedashi-tofu", name: "Agedashi Tofu", description: "Silken tofu crisped to order in kombu dashi with daikon and scallion.", price: 980 },
        { id: "smoked-edamame", name: "Smoked Edamame", description: "Warm young soybeans finished with sea salt and fragrant yuzu kosho.", price: 680 },
        { id: "wagyu-tataki", name: "Wagyu Tataki", description: "Lightly seared A5 wagyu with ponzu, shiso, and crisp myoga.", price: 1880 },
        { id: "chawanmushi", name: "Chawanmushi", description: "Steamed egg custard with shiitake, prawn, mitsuba, and clear dashi.", price: 1280 }
    ],
    "soups-salads": [
        { id: "aka-miso-soup", name: "Aka Miso Soup", description: "Dark red miso and Hokkaido clams in a fragrant kombu broth.", price: 780 },
        { id: "dobin-mushi", name: "Dobin Mushi", description: "Matsutake mushroom, prawn, and yuzu steamed in a small teapot.", price: 1180 },
        { id: "seaweed-yuzu-salad", name: "Seaweed & Yuzu Salad", description: "Assorted wakame and seaweed with cucumber and bright yuzu dressing.", price: 980 },
        { id: "sesame-spinach-ohitashi", name: "Sesame Spinach Ohitashi", description: "Blanched spinach in dashi with toasted sesame and a touch of soy.", price: 880 }
    ],
    "sushi-sashimi": [
        { id: "otoro-nigiri", name: "Otoro Nigiri", description: "Fatty bluefin tuna atop red-vinegar rice with aged nikiri soy.", price: 1980 },
        { id: "hokkaido-scallop-crudo", name: "Hokkaido Scallop Crudo", description: "Scallop sashimi with yuzu, sea salt, shiso oil, and fresh wasabi.", price: 1680 },
        { id: "seasonal-sashimi-moriawase", name: "Seasonal Sashimi Moriawase", description: "Chef's selection of six seasonal cuts with freshly grated wasabi.", price: 3980 },
        { id: "unagi-hand-roll", name: "Unagi Hand Roll", description: "Charcoal-grilled eel, cucumber, kaiware, and kabayaki glaze.", price: 1480 }
    ],
    noodles: [
        { id: "handmade-zaru-soba", name: "Handmade Zaru Soba", description: "Chilled buckwheat soba with nori and aged soy dipping sauce.", price: 1280 },
        { id: "duck-nanban-soba", name: "Duck Nanban Soba", description: "Hand-cut soba in warm dashi with roasted duck, leek, and sansho.", price: 1680 },
        { id: "yuzu-shio-ramen", name: "Yuzu Shio Ramen", description: "Clear chicken broth, chashu, ajitama, bamboo shoots, and yuzu.", price: 1480 },
        { id: "kitsune-udon", name: "Kitsune Udon", description: "Thick Sanuki udon with sweet fried tofu, scallion, and kombu broth.", price: 1380 }
    ],
    "rice-bowls": [
        { id: "unadon", name: "Unadon", description: "Chargrilled freshwater eel glazed with kabayaki over steamed rice.", price: 2980 },
        { id: "bara-chirashi", name: "Bara Chirashi", description: "Diced seasonal sashimi, tamago, cucumber, shiso, and ikura.", price: 2480 },
        { id: "a5-wagyu-donburi", name: "A5 Wagyu Donburi", description: "Miyazaki A5 wagyu, sweet onion, onsen egg, and sansho over rice.", price: 3680 },
        { id: "salmon-ikura-don", name: "Salmon Ikura Don", description: "Sliced salmon and ikura with shiso, cucumber, and seasoned rice.", price: 2180 }
    ]
};

const categoryNames = {
    appetizers: "Appetizers",
    "soups-salads": "Soups & Salads",
    "sushi-sashimi": "Sushi & Sashimi",
    noodles: "Noodles",
    "rice-bowls": "Rice Bowls"
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
            button.textContent = "Add";

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
    const tabs = [...document.querySelectorAll(".menu-nav [role='tab']")];
    const panels = [...document.querySelectorAll(".menu-categories [role='tabpanel']")];

    tabs.forEach((tab) => {
        const selected = tab.id === `tab-${categoryId}`;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.setAttribute("tabindex", selected ? "0" : "-1");
    });

    panels.forEach((panel) => {
        const visible = categoryId === "all" || panel.id === categoryId;
        panel.hidden = !visible;
        panel.classList.toggle("active", visible);
    });
}

function scrollToCategory(categoryId) {
    let target = null;

    if (categoryId === "all") {
        target = document.querySelector("#appetizers .food-card");
    } else {
        const panel = document.getElementById(categoryId);
        target = panel ? panel.querySelector(".food-card") : null;
    }

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
    const tabs = [...document.querySelectorAll(".menu-nav [role='tab']")];

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const categoryId = tab.id.replace("tab-", "");
            activateCategory(categoryId);
        });

        tab.addEventListener("keydown", (event) => {
            if (!["ArrowRight", "ArrowLeft", "ArrowHome", "ArrowEnd"].includes(event.key)) return;

            event.preventDefault();
            const currentIndex = tabs.indexOf(tab);
            let nextIndex = currentIndex;

            if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
            if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            if (event.key === "ArrowHome") nextIndex = 0;
            if (event.key === "ArrowEnd") nextIndex = tabs.length - 1;

            tabs[nextIndex].focus();
            tabs[nextIndex].click();
        });
    });
}

function initializeCategoryLinks() {
    document.querySelectorAll('[href="#appetizers"], [href="#soups-salads"], [href="#sushi-sashimi"], [href="#noodles"], [href="#rice-bowls"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const categoryId = link.hash.slice(1);
            if (!document.getElementById(categoryId)) return;

            event.preventDefault();
            activateCategory(categoryId);
            window.history.replaceState(null, "", `#${categoryId}`);
        });
    });

    const categoryId = window.location.hash.slice(1);
    if (Object.prototype.hasOwnProperty.call(categoryNames, categoryId)) {
        activateCategory(categoryId);
    } else {
        setCategory("all");
    }

    window.addEventListener("hashchange", () => {
        const nextCategory = window.location.hash.slice(1);
        if (Object.prototype.hasOwnProperty.call(categoryNames, nextCategory)) {
            activateCategory(nextCategory);
        }
    });
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

        window.clearTimeout(buttonTimers.get(button));
        button.textContent = "Added ✓";
        const buttonTimer = window.setTimeout(() => {
            button.textContent = "Add";
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
