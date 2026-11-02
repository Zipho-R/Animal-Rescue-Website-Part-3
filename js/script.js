/* =========================================================
   PAWS ANIMAL RESCUE - MAIN JAVASCRIPT (Part 3)

   Contents
   1.  Helpers
   2.  Mobile navigation
   3.  Footer year + today's opening hours
   4.  Animal directory (dynamic loading, search, filter, sort)
   5.  Animal profile modal
   6.  FAQ accordion
   7.  Tabs
   8.  Gallery lightbox
   9.  Leaflet map
   10. Form validation helpers
   11. Enquiry form (validation, cost/availability, AJAX)
   12. Contact form (validation, compiled email)

   Security note: all visitor input is inserted into the page
   with textContent (never innerHTML) to prevent HTML/script
   injection (XSS).
========================================================= */

"use strict";

/* ---------- 1. HELPERS ---------- */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ANIMALS = Array.isArray(window.PAWS_ANIMALS) ? window.PAWS_ANIMALS : [];

function formatRand(amount) {
    return "R" + Number(amount).toLocaleString("en-ZA", { minimumFractionDigits: 0 });
}

/* Builds a responsive <img> for an animal from the data file */
function buildAnimalImage(animal, sizesAttr) {
    const img = document.createElement("img");
    const srcset = animal.sizes.map(w => `images/responsive/${animal.image}-${w}w.jpg ${w}w`);
    srcset.push(`images/${animal.image}.jpg ${animal.width}w`);
    img.src = `images/${animal.image}.jpg`;
    img.srcset = srcset.join(", ");
    img.sizes = sizesAttr;
    img.alt = animal.alt;
    img.width = animal.width;
    img.height = animal.height;
    img.loading = "lazy";
    img.decoding = "async";
    return img;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

/* Keeps keyboard focus inside an open dialog */
function trapFocus(container, event) {
    if (event.key !== "Tab") return;
    const focusable = $$("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])", container)
        .filter(item => !item.disabled && item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

/* Scroll reveal: elements with class "reveal" fade in once when scrolled into view */
let observeReveal = items => items.forEach(item => item.classList.add("is-visible"));

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    observeReveal = items => items.forEach(item => revealObserver.observe(item));
}
observeReveal($$(".reveal"));

/* Replaced by the profile modal once it is set up (section 5) */
let openProfile = () => {};

/* ---------- 2. MOBILE NAVIGATION ---------- */
(function initNavigation() {
    const toggle = $("#menuToggle");
    const links = $(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const open = links.classList.toggle("show");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "✕" : "☰";
    });

    $$("a", links).forEach(link => link.addEventListener("click", () => {
        links.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
    }));
})();

/* ---------- 3. FOOTER YEAR + TODAY'S HOURS ---------- */
(function initSmallDetails() {
    $$("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });

    // Highlights today's row in the opening hours list (contact page)
    const day = new Date().getDay(); // 0 = Sunday
    const key = day === 0 ? "sun" : day === 6 ? "sat" : "week";
    const row = $(`.hours-list [data-day="${key}"]`);
    if (row) {
        row.classList.add("is-today");
        row.firstElementChild.textContent += " (today)";
    }
})();

/* ---------- 4. ANIMAL DIRECTORY ---------- */
(function initAnimalDirectory() {
    const container = $("#animalCards");
    if (!container || !ANIMALS.length) return;

    const search = $("#animalSearch");
    const species = $("#animalSpecies");
    const sort = $("#animalSort");
    const results = $("#animalResults");

    // Build one card per animal from the data file
    function buildCard(animal) {
        const card = el("article", "animal-card reveal");
        card.dataset.id = animal.id;

        const imageWrap = el("div", "animal-image");
        imageWrap.appendChild(buildAnimalImage(animal, "(max-width: 760px) 92vw, (max-width: 1000px) 45vw, 380px"));
        const status = el("span", "animal-status" + (animal.status !== "Available" ? " is-pending" : ""), animal.status);
        const kind = el("span", "animal-species", animal.species === "dog" ? "🐶 Dog" : "🐱 Cat");
        imageWrap.append(status, kind);

        const details = el("div", "animal-details");
        details.appendChild(el("h3", "", animal.name));
        details.appendChild(el("p", "animal-meta", `${animal.breed} · ${animal.ageLabel} · ${animal.sex}`));
        details.appendChild(el("p", "", animal.summary));

        const traits = el("ul", "animal-traits");
        traits.setAttribute("aria-label", `${animal.name}'s traits`);
        animal.traits.forEach(trait => traits.appendChild(el("li", "", trait)));
        details.appendChild(traits);

        const actions = el("div", "animal-actions");
        const meet = el("button", "btn btn-primary", `Meet ${animal.name}`);
        meet.type = "button";
        meet.dataset.profile = animal.id;
        const adopt = el("a", "btn btn-outline", animal.status === "Available" ? "Apply to adopt" : "Join waiting list");
        adopt.href = `enquiry.html?animal=${encodeURIComponent(animal.id)}`;
        actions.append(meet, adopt);
        details.appendChild(actions);

        card.append(imageWrap, details);
        return card;
    }

    const cards = new Map(ANIMALS.map(animal => [animal.id, buildCard(animal)]));
    const empty = el("p", "no-results", "No animals match your search. Try another name or choose “All animals”.");

    function update() {
        const term = search ? search.value.trim().toLowerCase() : "";
        const type = species ? species.value : "all";
        const order = sort ? sort.value : "name";

        const matches = ANIMALS.filter(animal => {
            const haystack = [animal.name, animal.breed, animal.summary, animal.traits.join(" ")].join(" ").toLowerCase();
            return (type === "all" || animal.species === type) && haystack.includes(term);
        }).sort((a, b) => {
            if (order === "age-young") return a.ageYears - b.ageYears;
            if (order === "age-old") return b.ageYears - a.ageYears;
            if (order === "fee-low") return a.fee - b.fee;
            return a.name.localeCompare(b.name);
        });

        container.replaceChildren(...(matches.length ? matches.map(a => cards.get(a.id)) : [empty]));
        if (results) {
            results.textContent = matches.length === ANIMALS.length
                ? `Showing all ${ANIMALS.length} animals.`
                : `Showing ${matches.length} of ${ANIMALS.length} animals.`;
        }
        observeReveal($$(".reveal", container));
    }

    // Allow links like index.html?type=cat#adopt to pre-filter the list
    const params = new URLSearchParams(window.location.search);
    if (species && ["dog", "cat"].includes(params.get("type"))) species.value = params.get("type");

    [search, species, sort].forEach(control => control && control.addEventListener(control === search ? "input" : "change", update));
    update();

    container.addEventListener("click", event => {
        const button = event.target.closest("[data-profile]");
        if (button) openProfile(button.dataset.profile, button);
    });
})();

/* ---------- 5. ANIMAL PROFILE MODAL ---------- */
(function initProfileModal() {
    if (!$("#animalCards") || !ANIMALS.length) return;

    const modal = el("div", "modal");
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "profileName");
    modal.innerHTML = `
        <div class="modal-panel">
            <button class="modal-close" type="button" aria-label="Close profile">×</button>
            <div class="modal-photo"></div>
            <div class="modal-content">
                <div class="modal-badges"><span data-field="status"></span><span data-field="species"></span></div>
                <h2 id="profileName" data-field="name"></h2>
                <p class="modal-meta" data-field="meta"></p>
                <div class="modal-facts">
                    <section><h3>Personality</h3><p data-field="personality"></p></section>
                    <section><h3>Favourite things</h3><p data-field="hobbies"></p></section>
                    <section><h3>Daily routine</h3><p data-field="habits"></p></section>
                    <section><h3>Ideal home</h3><p data-field="home"></p></section>
                </div>
                <p class="modal-fee" data-field="fee"></p>
                <div class="button-row">
                    <a class="btn btn-primary" data-field="apply" href="enquiry.html">Apply to adopt</a>
                    <a class="btn btn-outline" href="services.html#ways-to-help">How adoption works</a>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const panel = $(".modal-panel", modal);
    const photo = $(".modal-photo", modal);
    const closeButton = $(".modal-close", modal);
    const field = name => $(`[data-field="${name}"]`, modal);
    let lastTrigger = null;

    openProfile = function (id, trigger) {
        const animal = ANIMALS.find(a => a.id === id);
        if (!animal) return;
        lastTrigger = trigger;

        // Full-quality photo, shown whole (no cropping)
        const img = buildAnimalImage(animal, "(max-width: 900px) 100vw, 860px");
        img.loading = "eager";
        photo.replaceChildren(img);

        field("status").textContent = animal.status;
        field("species").textContent = animal.species === "dog" ? "🐶 Dog" : "🐱 Cat";
        field("name").textContent = animal.name;
        field("meta").textContent = `${animal.breed} · ${animal.ageLabel} · ${animal.sex}`;
        field("personality").textContent = animal.personality;
        field("hobbies").textContent = animal.hobbies;
        field("habits").textContent = animal.habits;
        field("home").textContent = animal.home;
        field("fee").textContent = `Adoption fee: ${formatRand(animal.fee)} (includes sterilisation, vaccinations and a microchip)`;
        const apply = field("apply");
        apply.href = `enquiry.html?animal=${encodeURIComponent(animal.id)}`;
        apply.textContent = animal.status === "Available" ? `Apply to adopt ${animal.name}` : "Join the waiting list";

        modal.hidden = false;
        panel.scrollTop = 0;
        document.body.classList.add("modal-open");
        closeButton.focus();
    };

    function close() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        if (lastTrigger) lastTrigger.focus();
    }

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", event => { if (event.target === modal) close(); });
    modal.addEventListener("keydown", event => {
        if (event.key === "Escape") close();
        trapFocus(panel, event);
    });
})();

/* ---------- 6. FAQ ACCORDION ----------
   One icon per question (in the HTML). Opening a question
   closes the others. */
(function initAccordion() {
    const questions = $$(".faq-question");
    questions.forEach(question => {
        question.addEventListener("click", () => {
            const willOpen = question.getAttribute("aria-expanded") !== "true";
            questions.forEach(other => {
                other.setAttribute("aria-expanded", "false");
                $(`#${other.getAttribute("aria-controls")}`).hidden = true;
            });
            question.setAttribute("aria-expanded", String(willOpen));
            $(`#${question.getAttribute("aria-controls")}`).hidden = !willOpen;
        });
    });
})();

/* ---------- 7. TABS ---------- */
(function initTabs() {
    $$("[data-tabs]").forEach(tabs => {
        const buttons = $$("[role='tab']", tabs);

        function select(button, focus) {
            buttons.forEach(other => {
                const selected = other === button;
                other.setAttribute("aria-selected", String(selected));
                other.tabIndex = selected ? 0 : -1;
                $(`#${other.getAttribute("aria-controls")}`).hidden = !selected;
            });
            if (focus) button.focus();
        }

        buttons.forEach((button, index) => {
            button.addEventListener("click", () => select(button, false));
            button.addEventListener("keydown", event => {
                let next = null;
                if (event.key === "ArrowRight") next = buttons[(index + 1) % buttons.length];
                if (event.key === "ArrowLeft") next = buttons[(index - 1 + buttons.length) % buttons.length];
                if (event.key === "Home") next = buttons[0];
                if (event.key === "End") next = buttons[buttons.length - 1];
                if (next) { event.preventDefault(); select(next, true); }
            });
        });
    });
})();

/* ---------- 8. GALLERY LIGHTBOX ---------- */
(function initLightbox() {
    const items = $$(".gallery-item");
    if (!items.length) return;

    const box = el("div", "lightbox");
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML = `
        <button class="lightbox-btn lightbox-close" type="button" aria-label="Close photo viewer">×</button>
        <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous photo">‹</button>
        <img src="" alt="">
        <p class="lightbox-caption" aria-live="polite"></p>
        <button class="lightbox-btn lightbox-next" type="button" aria-label="Next photo">›</button>`;
    document.body.appendChild(box);

    const image = $("img", box);
    const caption = $(".lightbox-caption", box);
    let current = 0;

    function show(index) {
        current = (index + items.length) % items.length;
        const item = items[current];
        const thumb = $("img", item);
        image.src = item.dataset.full;
        image.alt = thumb.alt;
        caption.textContent = `${thumb.alt} (${current + 1} of ${items.length})`;
    }

    function open(index) {
        show(index);
        box.hidden = false;
        document.body.classList.add("modal-open");
        $(".lightbox-close", box).focus();
    }

    function close() {
        box.hidden = true;
        document.body.classList.remove("modal-open");
        items[current].focus();
    }

    items.forEach((item, index) => item.addEventListener("click", () => open(index)));
    $(".lightbox-close", box).addEventListener("click", close);
    $(".lightbox-prev", box).addEventListener("click", () => show(current - 1));
    $(".lightbox-next", box).addEventListener("click", () => show(current + 1));
    box.addEventListener("click", event => { if (event.target === box) close(); });
    box.addEventListener("keydown", event => {
        if (event.key === "Escape") close();
        if (event.key === "ArrowRight") show(current + 1);
        if (event.key === "ArrowLeft") show(current - 1);
        trapFocus(box, event);
    });
})();


/* ---------- 9. LEAFLET MAP (contact page) ---------- */
(function initMap() {
    const mapElement = $("#branchMap");
    if (!mapElement) return;

    if (!window.L) {
        mapElement.innerHTML = '<p class="map-fallback">The map could not load. Southern Branch: 25 Main Road, Diep River. Northern Branch: 18 Blaauwberg Road, Table View.</p>';
        return;
    }

    const map = L.map(mapElement, { scrollWheelZoom: false }).setView([-33.92, 18.48], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    const branches = [
        { name: "Southern Branch", area: "25 Main Road, Diep River", coords: [-34.0310, 18.4630] },
        { name: "Northern Branch", area: "18 Blaauwberg Road, Table View", coords: [-33.8240, 18.4890] }
    ];
    const markers = branches.map(branch =>
        L.marker(branch.coords).addTo(map).bindPopup(`<strong>${branch.name}</strong><br>${branch.area}`)
    );
    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));

    // Buttons on the location cards fly the map to that branch
    $$("[data-map-branch]").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.mapBranch);
            map.flyTo(branches[index].coords, 14);
            markers[index].openPopup();
            mapElement.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        });
    });
})();

/* ---------- 10. FORM VALIDATION HELPERS ---------- */
const patterns = {
    name: /^[A-Za-zÀ-ÿ' -]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    // South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
    phone: /^(\+27|0)[1-8][0-9]{8}$/
};

function setError(input, message) {
    const error = $(`#${input.id}Error`);
    input.classList.toggle("is-invalid", Boolean(message));
    input.classList.toggle("is-valid", !message && input.value.trim() !== "");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message || "";
    return !message;
}

/* Returns an error message for one field, or "" if valid */
function checkField(input) {
    const value = input.value.trim();
    const label = input.dataset.label || "This field";

    if (input.type === "checkbox") {
        return input.required && !input.checked ? input.dataset.message || "Please tick this box to continue." : "";
    }
    if (input.required && value === "") return `${label} is required.`;
    if (value === "") return "";

    const rule = input.dataset.validate;
    if (rule === "name" && !patterns.name.test(value)) return `${label} should be 2–50 letters (spaces, hyphens and apostrophes are allowed).`;
    if (rule === "email" && !patterns.email.test(value)) return "Enter a valid email address, for example name@example.com.";
    if (rule === "phone" && !patterns.phone.test(value.replace(/[\s()-]/g, ""))) return "Enter a valid South African number, for example 082 123 4567 or +27 82 123 4567.";

    const min = Number(input.getAttribute("minlength"));
    const max = Number(input.getAttribute("maxlength"));
    if (min && value.length < min) return `${label} must be at least ${min} characters (currently ${value.length}).`;
    if (max && value.length > max) return `${label} must be ${max} characters or fewer.`;

    if (rule === "amount") {
        const amount = Number(value);
        if (!Number.isInteger(amount) || amount < 50 || amount > 50000) return "Enter a whole amount between R50 and R50 000.";
    }

    if (rule === "visit-date") {
        const chosen = new Date(value + "T12:00:00");
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days = Math.round((chosen - today) / 86400000);
        if (Number.isNaN(chosen.getTime())) return "Choose a valid date.";
        if (days < 1) return "Choose a date from tomorrow onwards.";
        if (days > 60) return "Choose a date within the next 60 days.";
        if (chosen.getDay() === 0) return "We are closed on Sundays. Please choose Monday to Saturday.";
    }
    return "";
}

function validateForm(form) {
    const fields = $$("[data-validate], [required]", form).filter(input => !input.closest("[hidden]") && !input.disabled);
    let firstInvalid = null;
    fields.forEach(input => {
        const ok = setError(input, checkField(input));
        if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
}

/* Live feedback: check a field when the visitor leaves it, then on every change */
function attachLiveValidation(form) {
    $$("input, select, textarea", form).forEach(input => {
        input.addEventListener("blur", () => { if (input.value.trim() !== "" || input.dataset.touched) setError(input, checkField(input)); input.dataset.touched = "1"; });
        input.addEventListener("input", () => { if (input.dataset.touched) setError(input, checkField(input)); });
        input.addEventListener("change", () => { if (input.dataset.touched) setError(input, checkField(input)); });
    });
}

function attachCharCounter(textarea) {
    const counter = $(`#${textarea.id}Count`);
    if (!counter) return;
    const max = textarea.getAttribute("maxlength");
    const update = () => { counter.textContent = `${textarea.value.length} / ${max} characters`; };
    textarea.addEventListener("input", update);
    update();
}

function showMessage(box, type, text) {
    box.className = `form-message ${type}`;
    box.textContent = text;
    box.hidden = false;
}

/* ---------- 11. ENQUIRY FORM ---------- */
(function initEnquiryForm() {
    const form = $("#enquiryForm");
    if (!form) return;

    const typeField = $("#enquiryType", form);
    const animalField = $("#animalOfInterest", form);
    const tierField = $("#sponsorTier", form);
    const amountGroup = $("#customAmountGroup", form);
    const phoneField = $("#phone", form);
    const message = $("#enquiryMessage");
    const result = $("#enquiryResult");
    const submit = $("button[type='submit']", form);

    // Dynamically load the animal list from the data file
    ANIMALS.forEach(animal => {
        const option = el("option", "", `${animal.name} – ${animal.species === "dog" ? "dog" : "cat"}, ${animal.ageLabel} (${animal.status.toLowerCase()})`);
        option.value = animal.id;
        animalField.appendChild(option);
    });

    // Show only the fields that apply to the chosen enquiry type
    const groups = { animal: ["adoption", "foster"], sponsor: ["sponsor"], volunteer: ["volunteer"], visit: ["adoption", "foster", "volunteer"] };
    function updateVisibleFields() {
        const type = typeField.value;
        $$("[data-show-for]", form).forEach(group => {
            const show = groups[group.dataset.showFor].includes(type);
            group.hidden = !show;
            $$("input, select", group).forEach(input => {
                if (input.dataset.requiredWhenShown) input.required = show;
            });
        });
        amountGroup.hidden = typeField.value !== "sponsor" || tierField.value !== "custom";
        $("#customAmount", form).required = !amountGroup.hidden;
    }
    typeField.addEventListener("change", updateVisibleFields);
    tierField.addEventListener("change", updateVisibleFields);

    // Phone becomes required when the visitor prefers a phone call
    $$("input[name='contactMethod']", form).forEach(radio => radio.addEventListener("change", () => {
        phoneField.required = form.contactMethod.value === "phone";
        $("#phoneRequiredMark").hidden = !phoneField.required;
        if (phoneField.dataset.touched) setError(phoneField, checkField(phoneField));
    }));

    // Visit date limits: tomorrow to 60 days ahead
    const dateField = $("#visitDate", form);
    const toISO = date => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const latest = new Date(); latest.setDate(latest.getDate() + 60);
    dateField.min = toISO(tomorrow);
    dateField.max = toISO(latest);

    // Pre-fill from an "Apply to adopt" link, e.g. enquiry.html?animal=buddy
    const requested = new URLSearchParams(window.location.search).get("animal");
    const match = ANIMALS.find(a => a.id === requested || a.name.toLowerCase() === String(requested).toLowerCase());
    if (match) {
        typeField.value = "adoption";
        animalField.value = match.id;
        showMessage($("#animalNotice"), "info", `🐾 You're enquiring about ${match.name}. We've filled in the enquiry type and animal for you – just add your details.`);
    }
    updateVisibleFields();
    attachLiveValidation(form);
    attachCharCounter($("#message", form));

    /* Works out the cost and availability response for the enquiry */
    function buildResponse(data) {
        const visit = data.visitDate ? new Date(data.visitDate + "T12:00:00") : null;
        const visitText = visit ? visit.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" }) : "";
        const isSaturday = visit && visit.getDay() === 6;
        const slots = isSaturday ? "09:00, 10:30 or 12:00" : "10:00, 12:00, 14:00 or 15:30";
        const animal = ANIMALS.find(a => a.id === data.animal);
        const rows = [];
        let title = "";
        let note = "";

        switch (data.enquiryType) {
            case "adoption":
                title = animal ? `Adopting ${animal.name}` : "Adopting from Paws";
                if (animal) {
                    rows.push(["Adoption fee", `${formatRand(animal.fee)} (sterilisation, vaccinations and microchip included)`]);
                    rows.push(["Availability", animal.status === "Available"
                        ? `${animal.name} is available. You'll be first in line once your application is approved.`
                        : `${animal.name} is currently reserved. We've added you to the waiting list.`]);
                } else {
                    rows.push(["Adoption fees", "Cats and kittens R850–R950 · Dogs R1 200 · Puppies R1 500"]);
                    rows.push(["Availability", `${ANIMALS.filter(a => a.status === "Available").length} animals are ready for homes right now.`]);
                }
                rows.push(["Meet-and-greet", `${visitText} – available times: ${slots}`]);
                rows.push(["Next step", "A short home check, usually within 5 working days."]);
                break;
            case "foster":
                title = "Becoming a foster home";
                rows.push(["Cost to you", "R0 – Paws supplies food, bedding and all vet care."]);
                rows.push(["Availability", `We currently need foster homes for ${ANIMALS.filter(a => a.ageYears < 1).length} young animals.`]);
                rows.push(["Foster orientation", `${visitText} – available times: ${slots}`]);
                rows.push(["Commitment", "Usually 2–8 weeks per animal."]);
                break;
            case "volunteer": {
                const areaNames = { care: "Animal care", walking: "Dog walking", events: "Events and fundraising", admin: "Admin and social media" };
                title = "Volunteering with Paws";
                rows.push(["Cost to you", "Free. We provide a Paws T-shirt and training."]);
                rows.push(["Area", areaNames[data.volunteerArea] || "Any area"]);
                rows.push(["Orientation", `${visitText} – ${isSaturday ? "09:00–11:00" : "14:00–16:00"} (spaces available)`]);
                rows.push(["Shifts", isSaturday ? "Saturdays 09:00–14:00" : "Weekdays 08:00–12:00 or 13:00–17:00"]);
                break;
            }
            case "sponsor": {
                const tiers = { 150: "Paw Pal", 300: "Best Friend", 600: "Guardian Angel" };
                const amount = data.sponsorTier === "custom" ? Number(data.customAmount) : Number(data.sponsorTier);
                title = `Monthly sponsorship${tiers[amount] ? " – " + tiers[amount] : ""}`;
                rows.push(["Monthly amount", formatRand(amount)]);
                rows.push(["Yearly impact", `${formatRand(amount * 12)} per year`]);
                rows.push(["What it covers", `About ${Math.max(1, Math.floor(amount / 150))} month(s) of food for a rescued cat, or ${Math.max(1, Math.floor(amount / 300))} month(s) of food and flea care for a dog.`]);
                rows.push(["Tax", "We'll send a Section 18A certificate for tax deduction purposes."]);
                break;
            }
            default:
                title = "General enquiry";
                rows.push(["Response time", "Within 2 working days."]);
        }

        if (data.reference) rows.push(["Reference", data.reference]);
        note = data.contactMethod === "phone"
            ? `We'll call you on ${data.phone} to confirm.`
            : `We'll email ${data.email} to confirm.`;
        return { title, rows, note };
    }

    function renderResponse(response, firstName, offline) {
        result.replaceChildren();
        result.appendChild(el("h3", "", `Thanks, ${firstName}! ${response.title}`));
        const list = el("dl");
        response.rows.forEach(([term, detail]) => list.append(el("dt", "", term), el("dd", "", detail)));
        result.appendChild(list);
        result.appendChild(el("p", "note", response.note + (offline ? " (We couldn't reach our server, so please keep this page or call 021 555 0123.)" : "")));
        result.hidden = false;
        result.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        message.hidden = true;
        result.hidden = true;

        if (!validateForm(form)) {
            showMessage(message, "error", "Some details need fixing. Check the messages in red above.");
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        submit.disabled = true;
        submit.textContent = "Sending…";

        // AJAX submission: the data is posted in the background without reloading the page
        let offline = false;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const saved = await response.json();
            data.reference = `PAWS-${String(saved.id || Date.now()).slice(-5)}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        } catch (error) {
            offline = true;
        }

        renderResponse(buildResponse(data), data.firstName.trim(), offline);
        showMessage(message, offline ? "info" : "success", offline
            ? "Your enquiry has been checked and processed on this page."
            : "Your enquiry has been sent successfully.");

        form.reset();
        $$(".is-valid", form).forEach(input => input.classList.remove("is-valid"));
        $$("[data-touched]", form).forEach(input => delete input.dataset.touched);
        updateVisibleFields();
        $("#message", form).dispatchEvent(new Event("input"));
        submit.disabled = false;
        submit.textContent = "Send enquiry";
        $("#animalNotice").hidden = true;
    });
})();

/* ---------- 12. CONTACT FORM ---------- */
(function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const RECIPIENT = "hello@pawsrescue.co.za";
    const message = $("#contactFormMessage");
    const preview = $("#emailPreview");

    attachLiveValidation(form);
    attachCharCounter($("#contactMessage", form));

    form.addEventListener("submit", event => {
        event.preventDefault();
        preview.hidden = true;

        if (!validateForm(form)) {
            showMessage(message, "error", "Some details need fixing. Check the messages in red above.");
            return;
        }

        const data = Object.fromEntries(new FormData(form).entries());
        const typeLabel = $("#messageType", form).selectedOptions[0].textContent.trim();
        const subject = `[${typeLabel}] ${data.subject.trim()}`;
        const body = [
            "Hello Paws Animal Rescue team,",
            "",
            data.contactMessage.trim(),
            "",
            "----------------------------------------",
            `Name: ${data.contactName.trim()}`,
            `Email: ${data.contactEmail.trim()}`,
            `Phone: ${data.contactPhone.trim() || "Not provided"}`,
            `Message type: ${typeLabel}`,
            `Sent from: Paws website contact form`
        ].join("\n");

        const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        $("#previewTo").textContent = RECIPIENT;
        $("#previewSubject").textContent = subject;
        $("#previewBody").textContent = body;
        $("#sendEmailLink").href = mailto;
        preview.hidden = false;
        showMessage(message, "success", "Your email is ready. Check it below, then press “Send with my email app”.");
        preview.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });

        $("#copyEmailButton").onclick = async () => {
            try {
                await navigator.clipboard.writeText(`To: ${RECIPIENT}\nSubject: ${subject}\n\n${body}`);
                $("#copyEmailButton").textContent = "Copied ✓";
            } catch (error) {
                $("#copyEmailButton").textContent = "Copy failed – select the text instead";
            }
        };
    });

    // Clear the preview when the form is reset
    form.addEventListener("reset", () => {
        preview.hidden = true;
        message.hidden = true;
        $$(".is-invalid, .is-valid", form).forEach(input => input.classList.remove("is-invalid", "is-valid"));
        $$(".field-error", form).forEach(error => { error.textContent = ""; });
        setTimeout(() => $("#contactMessage", form).dispatchEvent(new Event("input")), 0);
    });
})();
