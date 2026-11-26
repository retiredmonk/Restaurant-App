(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
        const targets = document.querySelectorAll(
            ".hero-content h1, .hero-content p, .hero-content .primary-button, " +
            ".story-text, .story-media, .family-message-inner, " +
            ".category-heading, .food-card, .reservation-form, .reservation-image, " +
            ".contents, .policies"
        );
        targets.forEach((target) => target.classList.add("reveal"));

        const observer = new IntersectionObserver((entries, activeObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                activeObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        targets.forEach((target) => observer.observe(target));

        const dynamicTargets = ".category-heading, .food-card";
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) return;
                    const elements = node.matches(dynamicTargets)
                        ? [node, ...node.querySelectorAll(dynamicTargets)]
                        : [...node.querySelectorAll(dynamicTargets)];
                    elements.forEach((element) => {
                        element.classList.add("reveal");
                        observer.observe(element);
                    });
                });
            });
        });
        mutationObserver.observe(document.body, { childList:true, subtree:true });

        document.querySelectorAll(".hero-content h1, .hero-content p, .hero-content .primary-button")
            .forEach((target, index) => {
                target.style.transitionDelay = `${index * 0.12}s`;
            });

        const heroMedia = document.querySelector(".hero video");
        if (heroMedia) {
            heroMedia.animate(
                [{ transform:"scale(1)" }, { transform:"scale(1.025)" }],
                { duration:12000, easing:"linear", iterations:Infinity, direction:"alternate" }
            );
        }
    }
})();
