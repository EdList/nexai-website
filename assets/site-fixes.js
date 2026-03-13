(() => {
  const companyEmail = "info@nexia-group.com";
  const legacyEmails = ["info@nexai.id", "partners@nexai.id", companyEmail];
  const fixedLogoPath = "./images/nexai-logo-official.jpg";
  const pageLinks = {
    privacy: "./privacy.html",
    terms: "./terms.html",
  };
  const mailtoLinks = {
    requestTour: `mailto:${companyEmail}?subject=${encodeURIComponent("Request a tour of NEXAI")}`,
    requestOverview: `mailto:${companyEmail}?subject=${encodeURIComponent("Request the NEXAI overview pack")}`,
    generalEnquiry: `mailto:${companyEmail}?subject=${encodeURIComponent("General enquiry for NEXAI")}`,
  };

  const altTextFixes = new Map([
    ["THERMAL DESIGN", "Liquid cooling systems inside the NEXAI data center"],
    ["SECURITY", "Security corridor inside the NEXAI facility"],
    ["NETWORK", "Network operations room inside the NEXAI facility"],
    ["PLATFORM", "Platform operations room inside the NEXAI facility"],
    ["SUSTAINABILITY", "Energy-efficient infrastructure corridor inside the facility"],
    ["WORKLOADS", "AI workload operations room inside the NEXAI facility"],
  ]);

  const fixedForms = new WeakSet();
  let mutationObserver;
  let updateQueued = false;

  function normalizeText(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function createLink(label, href, className, attributes = {}) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    if (className) {
      link.className = className;
    }

    Object.entries(attributes).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });

    return link;
  }

  function updateLogoSources() {
    document.querySelectorAll('img[src$="nexai-logo-official.jpg"]').forEach((image) => {
      image.setAttribute("src", fixedLogoPath);
    });
  }

  function updateOverviewLabels() {
    document.querySelectorAll("a").forEach((link) => {
      if (normalizeText(link.textContent || "") === "Download Overview") {
        link.textContent = "Request Overview";
      }
    });
  }

  function updatePlaceholderLinks() {
    const linkTargets = new Map([
      [
        "Request a Tour",
        {
          href: mailtoLinks.requestTour,
          title: "Request a facility tour by email",
        },
      ],
      [
        "Request Overview",
        {
          href: mailtoLinks.requestOverview,
          title: "Request the overview pack by email",
        },
      ],
      [
        "Privacy",
        {
          href: pageLinks.privacy,
          title: "Read the privacy policy",
        },
      ],
      [
        "Terms",
        {
          href: pageLinks.terms,
          title: "Read the terms of use",
        },
      ],
    ]);

    document.querySelectorAll("a").forEach((link) => {
      const label = normalizeText(link.textContent || "");
      const href = link.getAttribute("href");

      if (href === "#" && link.querySelector('img[alt="NEXAI"]')) {
        link.setAttribute("href", "#top");
        link.setAttribute("aria-label", "Back to top");
        return;
      }

      const target = linkTargets.get(label);
      if (!target) {
        return;
      }

      if (href === "#" || href?.startsWith("mailto:")) {
        link.setAttribute("href", target.href);
        link.setAttribute("title", target.title);
      }
    });
  }

  function updateEmailLinks() {
    document.querySelectorAll("p").forEach((paragraph) => {
      const text = normalizeText(paragraph.textContent || "");
      if (!legacyEmails.includes(text) || paragraph.dataset.mailtoPatched === "true") {
        return;
      }

      const link = document.createElement("a");
      link.href = `mailto:${companyEmail}`;
      link.textContent = companyEmail;
      link.className = paragraph.className;
      link.title = "Email NEXAI";
      link.dataset.mailtoPatched = "true";
      paragraph.replaceWith(link);
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      const href = link.getAttribute("href") || "";
      const label = normalizeText(link.textContent || "");
      const matchedEmail = legacyEmails.find((email) => href.includes(email));

      if (matchedEmail) {
        link.href = href.replace(/mailto:[^?]+/i, `mailto:${companyEmail}`);
      }

      if (legacyEmails.includes(label)) {
        link.textContent = companyEmail;
        link.title = "Email NEXAI";
      }
    });
  }

  function updateAltText() {
    document.querySelectorAll("img").forEach((image) => {
      const currentAlt = normalizeText(image.getAttribute("alt") || "");
      const nextAlt = altTextFixes.get(currentAlt);

      if (nextAlt) {
        image.setAttribute("alt", nextAlt);
      }
    });
  }

  function findMobileMenu() {
    return Array.from(document.querySelectorAll("div")).find((element) => {
      if (element.id === "root" || element.closest("footer") || element.closest("#contact")) {
        return false;
      }

      if (getComputedStyle(element).position !== "fixed") {
        return false;
      }

      const hrefs = Array.from(element.querySelectorAll("a")).map((link) => link.getAttribute("href"));
      return hrefs.includes("#about") && hrefs.includes("#contact");
    }) || null;
  }

  function enhanceContactSection() {
    const contactSection = document.querySelector("#contact");
    if (!contactSection) {
      return;
    }

    const intro = contactSection.querySelector("div > p.text-nexai-text-muted.leading-relaxed");
    if (intro) {
      intro.textContent =
        "Whether you're evaluating capacity, exploring a partnership, or reaching out about the company, we'll route your enquiry to the right team.";
    }

    Array.from(contactSection.querySelectorAll("a")).forEach((link) => {
      if (normalizeText(link.textContent || "") === "Request Overview") {
        link.href = mailtoLinks.requestOverview;
        link.title = "Request the overview pack by email";
      }
    });
  }

  function enhanceFooter() {
    const footer = document.querySelector("footer");
    if (!footer || footer.dataset.siteEnhanced === "true") {
      return;
    }

    footer.dataset.siteEnhanced = "true";
    footer.classList.add("site-footer");
    footer.innerHTML = `
      <div class="px-6 lg:px-[7vw] site-footer-wrap">
        <div class="site-footer-grid">
          <div class="site-footer-brand">
            <a href="#top" class="flex items-center group" aria-label="Back to top">
              <div class="relative p-1.5 bg-white rounded-xl border border-white/20 shadow-[0_0_30px_rgba(45,107,255,0.15)] group-hover:shadow-[0_0_40px_rgba(45,107,255,0.25)] group-hover:border-nexai-accent/30 transition-all duration-300">
                <img alt="NEXAI" class="h-10 w-auto object-contain rounded-lg" src="${fixedLogoPath}">
              </div>
            </a>
            <p style="margin-top:1rem;">
              NEXAI shares corporate information for customers, partners, and stakeholders
              evaluating the company's AI infrastructure platform.
            </p>
            <div class="site-footer-links">
              <a href="${mailtoLinks.requestOverview}">Request Overview</a>
              <a href="${mailtoLinks.generalEnquiry}">General enquiries</a>
            </div>
          </div>
          <div class="site-footer-column">
            <p class="site-footer-heading">Explore</p>
            <div class="site-footer-links">
              <a href="#about">About</a>
              <a href="#approach">Approach</a>
              <a href="#vision">Vision</a>
              <a href="#leadership">Leadership</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div class="site-footer-column">
            <p class="site-footer-heading">Connect</p>
            <div class="site-footer-links">
              <a href="${mailtoLinks.requestTour}">Request a tour</a>
              <a href="${mailtoLinks.requestOverview}">Request overview</a>
              <a href="${mailtoLinks.generalEnquiry}">Email NEXAI</a>
            </div>
          </div>
          <div class="site-footer-column">
            <p class="site-footer-heading">Legal</p>
            <div class="site-footer-links">
              <a href="${pageLinks.privacy}">Privacy Policy</a>
              <a href="${pageLinks.terms}">Terms of Use</a>
              <a href="mailto:${companyEmail}?subject=${encodeURIComponent("Website legal enquiry")}">Legal enquiries</a>
            </div>
          </div>
        </div>
        <div class="site-footer-meta">
          <p>&copy; ${new Date().getFullYear()} NEXAI. All rights reserved.</p>
          <p>
            This website provides general corporate information only and should be paired with
            direct company contact for current materials or formal business discussions.
          </p>
        </div>
      </div>
    `;
  }

  function enhanceMobileMenu() {
    const mobileMenu = findMobileMenu();
    if (!mobileMenu) {
      return;
    }

    mobileMenu.classList.add("site-mobile-menu");
    mobileMenu.id = "mobile-navigation";

    const panel = mobileMenu.firstElementChild;
    if (!panel) {
      return;
    }

    if (panel.dataset.siteEnhanced !== "true") {
      const existingLinks = Array.from(panel.querySelectorAll(":scope > a"));
      const getInTouchLink = existingLinks.find(
        (link) => normalizeText(link.textContent || "") === "Get in Touch",
      );
      const navLinks = existingLinks.filter((link) => link !== getInTouchLink);

      panel.innerHTML = "";
      panel.className = "site-mobile-menu-panel";
      panel.dataset.siteEnhanced = "true";

      const header = document.createElement("div");
      header.className = "site-mobile-menu-header";
      header.innerHTML = `
        <p class="site-kicker">Navigate</p>
        <h2 class="site-mobile-menu-title">Explore NEXAI</h2>
        <p class="site-mobile-menu-copy">
          Corporate overview, infrastructure strategy, and the fastest routes into the team.
        </p>
      `;

      const linkGroup = document.createElement("div");
      linkGroup.className = "site-mobile-links";
      navLinks.forEach((link) => {
        link.className = "site-mobile-menu-link";
        linkGroup.append(link);
      });

      const ctaGroup = document.createElement("div");
      ctaGroup.className = "site-mobile-menu-cta";
      if (getInTouchLink) {
        getInTouchLink.className = "btn-primary";
        ctaGroup.append(getInTouchLink);
      }
      ctaGroup.append(
        createLink("Request Overview", mailtoLinks.requestOverview, "btn-secondary"),
      );

      const footer = document.createElement("div");
      footer.className = "site-mobile-menu-footer";
      footer.innerHTML = `
        <div class="site-mobile-menu-meta-links">
          <a href="${pageLinks.privacy}">Privacy</a>
          <a href="${pageLinks.terms}">Terms</a>
          <a href="${mailtoLinks.generalEnquiry}">Email</a>
        </div>
        <p class="site-mobile-menu-note">
          Use this site for company background, then reach the team directly for current materials
          or next steps.
        </p>
      `;

      panel.append(header, linkGroup, ctaGroup, footer);
    }
  }

  function updateMenuButton() {
    const nav = document.querySelector("nav");
    const button = nav?.querySelector("button");
    const mobileMenu = findMobileMenu();

    if (!button) {
      document.body.removeAttribute("data-nav-open");
      return;
    }

    button.setAttribute("type", "button");
    button.setAttribute("aria-label", mobileMenu ? "Close navigation menu" : "Open navigation menu");
    button.setAttribute("aria-expanded", String(Boolean(mobileMenu)));

    if (mobileMenu) {
      button.setAttribute("aria-controls", mobileMenu.id || "mobile-navigation");
      document.body.setAttribute("data-nav-open", "true");
      return;
    }

    button.removeAttribute("aria-controls");
    document.body.removeAttribute("data-nav-open");
  }

  function attachFormHandler() {
    const form = document.querySelector("#contact form");
    if (!form || fixedForms.has(form)) {
      return;
    }

    fixedForms.add(form);

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton && !form.querySelector(".site-fix-form-note")) {
      const note = document.createElement("p");
      note.className = "site-fix-form-note";
      note.textContent = `Submitting opens your email app with a pre-addressed message to ${companyEmail}.`;
      submitButton.insertAdjacentElement("afterend", note);
    }

    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const name = form.querySelector('input[placeholder="Your name"]')?.value.trim() || "";
        const email = form.querySelector('input[placeholder="your@email.com"]')?.value.trim() || "";
        const company = form.querySelector('input[placeholder="Your company"]')?.value.trim() || "";
        const message = form.querySelector('textarea[placeholder="How can we help?"]')?.value.trim() || "";

        const subjectName = name || "Website visitor";
        const subject = company
          ? `Website enquiry from ${subjectName} (${company})`
          : `Website enquiry from ${subjectName}`;

        const body = [
          `Name: ${name || "-"}`,
          `Email: ${email || "-"}`,
          `Company: ${company || "-"}`,
          "",
          "Message:",
          message || "-",
        ].join("\n");

        window.location.href = `mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
      true,
    );
  }

  function applyFixes() {
    updateOverviewLabels();
    updateLogoSources();
    updatePlaceholderLinks();
    updateEmailLinks();
    updateAltText();
    enhanceContactSection();
    enhanceFooter();
    enhanceMobileMenu();
    updateMenuButton();
    attachFormHandler();
  }

  function scheduleFixes() {
    if (updateQueued) {
      return;
    }

    updateQueued = true;
    window.requestAnimationFrame(() => {
      updateQueued = false;
      applyFixes();
    });
  }

  function start() {
    applyFixes();

    if (!mutationObserver) {
      mutationObserver = new MutationObserver(() => {
        scheduleFixes();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
