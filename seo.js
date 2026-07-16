(() => {
  const progress = document.querySelector(".reading-progress span");
  const railProgress = document.querySelector(".toc-progress span");
  const sections = [...document.querySelectorAll(".article-grid article > section[id]")];
  const tocLinks = [...document.querySelectorAll(".toc a, .mobile-toc a")];
  const currentSection = document.querySelector(".current-section");
  const mobileToc = document.querySelector(".mobile-toc");
  let ticking = false;

  const setProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const value = Math.min(1, Math.max(0, scrollY / scrollable));
    if (progress) progress.style.transform = `scaleX(${value})`;
    if (railProgress) railProgress.style.transform = `scaleY(${value})`;
    ticking = false;
  };

  addEventListener("scroll", () => {
    if (!ticking) requestAnimationFrame(setProgress);
    ticking = true;
  }, { passive: true });
  addEventListener("resize", setProgress, { passive: true });
  setProgress();

  const linksById = new Map();
  tocLinks.forEach((link) => {
    const id = decodeURIComponent((link.hash || "").slice(1));
    if (!linksById.has(id)) linksById.set(id, []);
    linksById.get(id).push(link);
    link.addEventListener("click", () => {
      if (mobileToc) mobileToc.open = false;
    });
  });

  const activate = (id) => {
    tocLinks.forEach((link) => link.classList.remove("is-active"));
    (linksById.get(id) || []).forEach((link) => link.classList.add("is-active"));
    const section = sections.find((item) => item.id === id);
    const heading = section?.querySelector("h2")?.textContent;
    if (heading && currentSection) currentSection.textContent = heading;
  };

  if (sections.length) {
    activate(sections[0].id);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activate(visible[0].target.id);
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.1, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("click", (event) => {
    if (mobileToc?.open && !mobileToc.contains(event.target)) mobileToc.open = false;
  });
})();
