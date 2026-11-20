// Contact form: preselect topic/office from the link, send with fetch, show the result.
// Without JavaScript the form still posts and the server redirects back with ?sent=1 or ?error=...
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("cf-status");
  const params = new URLSearchParams(location.search);
  const topic = form.elements.topic, office = form.elements.office;
  if (params.get("topic") && [...topic.options].some((o) => o.value === params.get("topic"))) topic.value = params.get("topic");
  if (params.get("office") && [...office.options].some((o) => o.value === params.get("office"))) office.value = params.get("office");

  const cvField = document.getElementById("cf-cv-field");
  const showCv = () => { cvField.hidden = topic.value !== "careers"; };
  topic.addEventListener("change", showCv);
  showCv();

  const messages = {
    sent: "Thank you. Your message has been sent, and Thuso will reply by email.",
    invalid: "Please fill in your name, a valid email address and a message.",
    file: "The CV must be a PDF or Word file of 5 MB or less.",
    captcha: "The spam check did not complete. Please try again.",
    send: "The message could not be sent just now. Please try again shortly, or call +44 (0)20 8144 8316.",
  };
  const show = (key, ok) => { status.textContent = messages[key] || messages.send; status.className = "form-status " + (ok ? "is-ok" : "is-error"); };
  if (params.get("sent")) show("sent", true);
  else if (params.get("error")) show(params.get("error"), false);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { show("invalid", false); form.reportValidity(); return; }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; status.textContent = "Sending..."; status.className = "form-status";
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { form.reset(); showCv(); show("sent", true); }
      else show(data.error || "send", false);
    } catch (_) { show("send", false); }
    btn.disabled = false;
    if (window.turnstile) window.turnstile.reset();
  });
})();
