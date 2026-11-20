if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealElements = document.querySelectorAll(
        ".story-text, .story-media, .family-message-inner"
    );

    revealElements.forEach((element) => element.classList.add("reveal"));

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            activeObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => observer.observe(element));
}
