// Thuso: small progressive enhancements. Every page works without this file.
document.documentElement.classList.add("js");

// Mobile navigation
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Fade sections in as they scroll into view
const revealables = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealables.length) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add("is-visible"));
}

// References filter (development/references only)
const list = document.querySelector(".ref-list");
if (list) {
  const q = document.getElementById("ref-q");
  const sector = document.getElementById("ref-sector");
  const type = document.getElementById("ref-type");
  const client = document.getElementById("ref-client");
  const count = document.getElementById("ref-n");
  const items = [...list.querySelectorAll(".ref")];
  const text = items.map((li) => li.textContent.toLowerCase());
  const apply = () => {
    const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    items.forEach((li, i) => {
      const ok =
        words.every((w) => text[i].includes(w)) &&
        (!sector.value || li.dataset.sector.split(",").map((s) => s.trim()).includes(sector.value)) &&
        (!type.value || li.dataset.type === type.value) &&
        (!client.value || li.dataset.client === client.value);
      li.hidden = !ok;
      if (ok) n++;
    });
    count.textContent = n;
  };
  [q, sector, type, client].forEach((el) => el.addEventListener("input", apply));
  // Allow links such as /development/references/?sector=Education
  const params = new URLSearchParams(location.search);
  if (params.get("sector")) sector.value = params.get("sector");
  if (params.get("type")) type.value = params.get("type");
  if (params.get("client")) client.value = params.get("client");
  if (params.get("q")) q.value = params.get("q");
  apply();
}

// Sector explorer (development page): one theme shown at a time, starting at a
// random one so that no sector is favoured.
document.querySelectorAll("[data-sx]").forEach((sx) => {
  const tabs = [...sx.querySelectorAll(".sx-tab")];
  if (!tabs.length) return;
  sx.classList.add("sx--js");
  const show = (t) => tabs.forEach((b) => {
    const on = b === t;
    b.setAttribute("aria-expanded", on);
    document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
  });
  tabs.forEach((b) => b.addEventListener("click", () => show(b)));
  // Hold the panel area at the tallest theme's height so the page does not jump.
  const box = sx.querySelector(".sx-panels");
  const fit = () => {
    box.style.minHeight = "";
    const panels = [...box.children];
    const shown = panels.map((p) => p.hidden);
    let h = 0;
    panels.forEach((p) => { p.hidden = false; p.style.position = "absolute"; p.style.visibility = "hidden"; p.style.width = box.clientWidth + "px"; });
    panels.forEach((p) => { h = Math.max(h, p.offsetHeight); p.style.position = p.style.visibility = p.style.width = ""; });
    panels.forEach((p, i) => { p.hidden = shown[i]; });
    box.style.minHeight = h + "px";
  };
  show(tabs[Math.floor(Math.random() * tabs.length)]);
  fit();
  addEventListener("resize", fit);
});

// World map (development page): hover shows the name, select shows examples.
document.querySelectorAll("[data-wm]").forEach((wm) => {
  const marks = [...wm.querySelectorAll("[data-c]")].filter((el) => el.matches(".wm-c, .wm-halo"));
  const infos = [...wm.querySelectorAll(".wm-info")];
  const hint = wm.querySelector(".wm-hint");
  const pick = wm.querySelector("select");
  const tip = wm.querySelector(".wm-tip");
  const map = wm.querySelector(".wm-map");
  const select = (c) => {
    wm.classList.toggle("is-active", !!c);
    marks.forEach((m) => m.classList.toggle("is-on", m.dataset.c === c));
    infos.forEach((i) => { i.hidden = i.dataset.c !== c; });
    hint.hidden = !!c;
    pick.value = c || "";
  };
  marks.forEach((m) => {
    m.addEventListener("click", () => select(m.dataset.c));
    m.addEventListener("mousemove", (e) => {
      const r = map.getBoundingClientRect();
      tip.textContent = m.dataset.c;
      tip.style.left = e.clientX - r.left + "px";
      tip.style.top = e.clientY - r.top + "px";
      tip.hidden = false;
    });
    m.addEventListener("mouseenter", () => marks.forEach((x) => x.classList.toggle("is-hover", x.dataset.c === m.dataset.c)));
    m.addEventListener("mouseleave", () => { tip.hidden = true; marks.forEach((x) => x.classList.remove("is-hover")); });
  });
  pick.addEventListener("change", () => select(pick.value));
});

// References page: ?country=Kenya narrows the list to one country.
(() => {
  const list = document.querySelector(".ref-list");
  const c = new URLSearchParams(location.search).get("country");
  if (!list || !c) return;
  const note = document.getElementById("ref-country");
  const apply = () => {
    let n = 0;
    list.querySelectorAll(".ref").forEach((li) => {
      if (!li.hidden && !li.dataset.countries.split("|").includes(c)) li.hidden = true;
      if (!li.hidden) n++;
    });
    document.getElementById("ref-n").textContent = n;
  };
  const all = document.createElement("a");
  all.href = "?";
  all.textContent = "show all";
  note.append(` in ${c} \u00b7 `, all);
  note.hidden = false;
  apply();
  document.querySelectorAll(".ref-filters input, .ref-filters select").forEach((el) => el.addEventListener("input", () => setTimeout(apply)));
})();
