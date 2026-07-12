document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav");
  const backToTop = document.getElementById("backToTop");
  const navbarMenu = document.getElementById("navbarMenu");

  const handleScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
    backToTop.classList.toggle("show", window.scrollY > 450);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const collapse = bootstrap.Collapse.getInstance(navbarMenu);
      if (collapse) collapse.hide();
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.count);
        const duration = 1300;
        const start = performance.now();

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.floor(target * eased);
          el.textContent = target >= 1000 ? value.toLocaleString() + "+" : value + (target === 92 ? "%" : "+");
          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const sections = document.querySelectorAll("header[id], main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  const sendAnother = document.getElementById("sendAnother");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    form.classList.add("d-none");
    success.classList.remove("d-none");
  });

  sendAnother.addEventListener("click", () => {
    form.reset();
    form.classList.remove("was-validated", "d-none");
    success.classList.add("d-none");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
});
