const form = document.querySelector(".reservation-form");
if (form) {
    form.noValidate = true;

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const guests = document.getElementById("guests");
    const occasion = document.getElementById("occasion");
    const otherOccasion = document.getElementById("other");
    const otherOccasionWrapper = document.getElementById("other-occasion");
    const date = document.getElementById("date");
    const time = document.getElementById("time");
    const reserveButton = document.getElementById("reserve-button");

    function localTodayString(now = new Date()) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function parseLocalDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match) return null;
        const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        if (
            parsed.getFullYear() !== Number(match[1]) ||
            parsed.getMonth() !== Number(match[2]) - 1 ||
            parsed.getDate() !== Number(match[3])
        ) return null;
        return parsed;
    }

    function getErrorElement(field) {
        const wrapper = field === otherOccasion
            ? otherOccasionWrapper
            : field.closest(".name, .email, .guests, .occasion, .date, .time") || field.parentElement;
        let error = wrapper.querySelector(":scope > .field-error");
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
        if (!field) return;
        const wrapper = field === otherOccasion
            ? otherOccasionWrapper
            : field.closest(".name, .email, .guests, .occasion, .date, .time") || field.parentElement;
        const error = wrapper.querySelector(":scope > .field-error");
        if (error) error.textContent = "";
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
    }

    function parseTimeMinutes(value) {
        const match = /^(\d{1,2}):(\d{2})\s+(AM|PM)$/i.exec(value.trim());
        if (!match) return null;
        let hour = Number(match[1]) % 12;
        if (match[3].toUpperCase() === "PM") hour += 12;
        return hour * 60 + Number(match[2]);
    }

    function updateTimeAvailability() {
        if (!time || !date) return;
        const today = localTodayString();
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const isToday = date.value === today;

        Array.from(time.options).forEach((option) => {
            if (!option.value) return;
            const passed = isToday && parseTimeMinutes(option.value) <= nowMinutes;
            option.disabled = passed;
        });

        if (time.value && time.options[time.selectedIndex]?.disabled) {
            time.value = "";
        }
    }

    function validateDate() {
        if (!date) return true;
        clearFieldError(date);

        if (!date.value) {
            setFieldError(date, "Choose a reservation date.");
            return false;
        }

        const selected = parseLocalDate(date.value);
        if (!selected) {
            setFieldError(date, "Choose a valid reservation date.");
            return false;
        }

        if (date.value < localTodayString()) {
            setFieldError(date, "Choose a future reservation date.");
            return false;
        }

        const day = selected.getDay();
        if (day === 0 || day === 1) {
            setFieldError(date, "Matsumoto is closed on Sundays and Mondays. Please choose Tuesday – Saturday.");
            return false;
        }

        return true;
    }

    function validateTime() {
        if (!time) return true;
        clearFieldError(time);

        if (!time.value) {
            setFieldError(time, "Choose a reservation time.");
            return false;
        }

        if (date && date.value === localTodayString()) {
            const minutes = parseTimeMinutes(time.value);
            const now = new Date();
            if (minutes !== null && minutes <= now.getHours() * 60 + now.getMinutes()) {
                setFieldError(time, "Choose a future reservation time.");
                return false;
            }
        }

        return true;
    }

    function validateName() {
        if (!name) return true;
        if (name.value.trim()) {
            clearFieldError(name);
            return true;
        }
        setFieldError(name, "Enter your name.");
        return false;
    }

    function validateEmail() {
        if (!email) return true;
        if (isValidEmail(email.value)) {
            clearFieldError(email);
            return true;
        }
        setFieldError(email, "Enter a valid email address.");
        return false;
    }

    function validateGuests() {
        if (!guests) return true;
        if (guests.value && guests.value !== "9+") {
            clearFieldError(guests);
            return true;
        }
        setFieldError(guests, guests.value === "9+" ? "For 9 or more guests, please contact private dining." : "Select your party size.");
        return false;
    }

    function validateOccasion() {
        if (!occasion) return true;
        clearFieldError(occasion);
        clearFieldError(otherOccasion);

        if (!occasion.value) {
            setFieldError(occasion, "Select an occasion.");
            return false;
        }

        if (occasion.value === "other") {
            if (!otherOccasion.value.trim()) {
                setFieldError(otherOccasion, "Please specify the occasion.");
                return false;
            }
        }

        return true;
    }

    date.min = localTodayString();

    if (occasion && otherOccasionWrapper && otherOccasion) {
        const updateOccasion = () => {
            if (occasion.value === "other") {
                otherOccasionWrapper.hidden = false;
                otherOccasion.required = true;
            } else {
                otherOccasionWrapper.hidden = true;
                otherOccasion.required = false;
                otherOccasion.value = "";
                clearFieldError(otherOccasion);
            }
        };
        occasion.addEventListener("change", () => {
            updateOccasion();
            validateOccasion();
        });
        occasion.addEventListener("blur", validateOccasion);
        otherOccasion.addEventListener("blur", validateOccasion);
        otherOccasion.addEventListener("input", () => {
            if (otherOccasion.value.trim()) clearFieldError(otherOccasion);
        });
        updateOccasion();
    }

    if (guests) {
        let privateDiningNote = guests.closest(".guests").querySelector(".private-dining-note");
        if (!privateDiningNote) {
            privateDiningNote = document.createElement("p");
            privateDiningNote.className = "private-dining-note";
            privateDiningNote.textContent = "For parties of 9 or more, please contact private dining at +81 75-123-4567 or reservations@matsumoto.jp.";
            guests.closest(".guests").append(privateDiningNote);
        }

        const updateGuests = () => {
            if (guests.value === "9+") {
                privateDiningNote.hidden = false;
                reserveButton.disabled = true;
            } else {
                privateDiningNote.hidden = true;
                reserveButton.disabled = false;
            }
        };
        guests.addEventListener("change", () => {
            updateGuests();
            validateGuests();
        });
        guests.addEventListener("blur", validateGuests);
        updateGuests();
    }

    if (date) {
        date.addEventListener("change", () => {
            updateTimeAvailability();
            validateDate();
        });
        date.addEventListener("blur", validateDate);
    }

    if (time) {
        time.addEventListener("change", validateTime);
        time.addEventListener("blur", validateTime);
    }

    if (name) {
        name.addEventListener("blur", validateName);
        name.addEventListener("input", () => {
            if (name.value.trim()) clearFieldError(name);
        });
    }

    if (email) {
        email.addEventListener("blur", validateEmail);
        email.addEventListener("input", () => {
            if (isValidEmail(email.value)) clearFieldError(email);
        });
    }

    updateTimeAvailability();

    function generateReservationRef() {
        const values = new Uint32Array(1);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(values);
            return `RES-${String(values[0] % 10000).padStart(4, "0")}`;
        }
        return `RES-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    }

    function formatReservationDate(value) {
        const parsed = parseLocalDate(value);
        return parsed.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function showConfirmation(payload) {
        const previouslyFocused = document.activeElement;
        const backdrop = document.createElement("div");
        backdrop.className = "reservation-modal-backdrop";

        const modal = document.createElement("section");
        modal.className = "reservation-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "reservation-confirmed-heading");

        const heading = document.createElement("h2");
        heading.id = "reservation-confirmed-heading";
        heading.textContent = "Reservation Confirmed";

        const reference = document.createElement("p");
        reference.className = "reservation-modal-reference";
        reference.textContent = `Reservation reference: ${payload.reservationRef}`;

        const guestName = document.createElement("p");
        guestName.className = "reservation-modal-detail";
        guestName.textContent = `Guest: ${payload.name}`;

        const partySize = document.createElement("p");
        partySize.className = "reservation-modal-detail";
        partySize.textContent = `Party size: ${payload.guests} guests`;

        const dateTime = document.createElement("p");
        dateTime.className = "reservation-modal-detail";
        dateTime.textContent = `${formatReservationDate(payload.date)} at ${payload.time}`;

        const occasionLabel = payload.occasionDetails
            ? `Occasion: ${payload.occasionDetails}`
            : `Occasion: ${payload.occasion}`;
        const occasionDetail = document.createElement("p");
        occasionDetail.className = "reservation-modal-detail";
        occasionDetail.textContent = occasionLabel;

        const actions = document.createElement("div");
        actions.className = "reservation-modal-actions";

        const doneButton = document.createElement("button");
        doneButton.type = "button";
        doneButton.className = "primary-button";
        doneButton.textContent = "Done";

        actions.append(doneButton);
        modal.append(heading, reference, guestName, partySize, dateTime, occasionDetail, actions);
        backdrop.append(modal);
        document.body.append(backdrop);

        const closeModal = () => {
            backdrop.remove();
            document.removeEventListener("keydown", handleKeydown);
            form.reset();
            if (otherOccasionWrapper) otherOccasionWrapper.hidden = true;
            if (otherOccasion) otherOccasion.required = false;
            if (guests) guests.dispatchEvent(new Event("change"));
            if (occasion) occasion.dispatchEvent(new Event("change"));
            date.min = localTodayString();
            updateTimeAvailability();
            if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
        };

        function handleKeydown(event) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }

            if (event.key === "Tab") {
                const focusable = Array.from(modal.querySelectorAll("button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
                if (!focusable.length) return;
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
        }

        doneButton.addEventListener("click", closeModal);
        document.addEventListener("keydown", handleKeydown);
        doneButton.focus();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        updateTimeAvailability();

        [name, email, guests, occasion, otherOccasion, date, time].forEach((field) => {
            if (field) clearFieldError(field);
        });

        const validName = validateName();
        const validEmail = validateEmail();
        const validGuests = validateGuests();
        const validOccasion = validateOccasion();
        const validDate = validateDate();
        const validTime = validateTime();

        const validations = [
            [name, validName],
            [email, validEmail],
            [guests, validGuests],
            [occasion, validOccasion],
            [date, validDate],
            [time, validTime]
        ];
        const firstInvalid = validations.find(([, valid]) => !valid)?.[0];
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const payload = {
            reservationRef: generateReservationRef(),
            name: name.value.trim(),
            email: email.value.trim(),
            guests: guests.value,
            occasion: occasion.value,
            occasionDetails: occasion.value === "other" ? otherOccasion.value.trim() : "",
            date: date.value,
            time: time.value,
            createdAt: new Date().toISOString()
        };

        showConfirmation(payload);
    });
}
