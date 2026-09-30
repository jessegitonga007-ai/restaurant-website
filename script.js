const nav = document.querySelector(".main-nav");
const toggle = document.querySelector(".menu-toggle");
const scrollFill = document.querySelector(".scroll-fill");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const updateScrollFill = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  if (scrollFill) scrollFill.style.width = `${Math.min(progress, 100)}%`;
};

window.addEventListener("scroll", updateScrollFill, { passive: true });
updateScrollFill();

// Reveal + gallery fade observer — low threshold so items trigger as soon as they appear
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Animated counters
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const target = entry.target;
    const finalValue = Number(target.dataset.count || "0");
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      target.textContent = `${Math.floor(finalValue * eased)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(target);
  });
}, { threshold: 0.4 });

document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// Testimonial carousel — set container height to tallest card after fonts load
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const cards = Array.from(carousel.querySelectorAll(".testimonial-card"));
  if (cards.length < 2) return;

  const setHeight = () => {
    // Temporarily show all cards to measure true height
    cards.forEach((c) => {
      c.style.visibility = "hidden";
      c.style.opacity = "1";
      c.style.position = "relative";
      c.style.transform = "none";
    });
    const maxH = Math.max(...cards.map((c) => c.offsetHeight));
    // Restore
    cards.forEach((c) => {
      c.style.visibility = "";
      c.style.opacity = "";
      c.style.position = "";
      c.style.transform = "";
    });
    carousel.style.minHeight = (maxH + 16) + "px";
  };

  // Run after fonts are ready for accurate measurement
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setHeight);
  } else {
    window.addEventListener("load", setHeight);
  }

  let index = 0;
  setInterval(() => {
    cards[index].classList.remove("active");
    index = (index + 1) % cards.length;
    cards[index].classList.add("active");
  }, 4200);
});

// Booking form → WhatsApp
const bookingForm = document.querySelector("#bookingForm");
if (bookingForm) {
  const note = document.querySelector("#formNote");
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const message = [
      "Hello Glamor Nails & Salon, I would like to request an appointment.",
      `Service: ${data.get("service")}`,
      `Date: ${data.get("date")}`,
      `Time: ${data.get("time")}`,
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email") || "Not provided"}`,
      `Notes: ${data.get("notes") || "None"}`
    ].join("\n");
    if (note) note.textContent = "Opening WhatsApp with your appointment request...";
    window.open(`https://wa.me/254712345678?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });
}
