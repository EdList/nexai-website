(() => {
  const companyEmail = "info@nexai.id";
  const partnerEmail = "partners@nexai.id";
  const fixedLogoPath = "./images/nexai-logo-official.JPG";
  const pageLinks = {
    investors: "./investors.html",
    privacy: "./privacy.html",
    terms: "./terms.html",
  };
  const mailtoLinks = {
    requestTour: `mailto:${companyEmail}?subject=${encodeURIComponent("Request a tour of NEXAI")}`,
    requestOverview: `mailto:${companyEmail}?subject=${encodeURIComponent("Request the NEXAI overview pack")}`,
    investorRelations: `mailto:${companyEmail}?subject=${encodeURIComponent("Investor relations enquiry")}`,
    approvedMaterials: `mailto:${companyEmail}?subject=${encodeURIComponent("Request approved company materials")}`,
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
    const emailParagraphs = [
      { value: companyEmail, title: "Email NEXAI" },
      { value: partnerEmail, title: "Email NEXAI partnerships" },
    ];

    emailParagraphs.forEach(({ value, title }) => {
      document.querySelectorAll("p").forEach((paragraph) => {
        if (normalizeText(paragraph.textContent || "") !== value || paragraph.dataset.mailtoPatched === "true") {
          return;
        }

        const link = document.createElement("a");
        link.href = `mailto:${value}`;
        link.textContent = value;
        link.className = paragraph.className;
        link.title = title;
        link.dataset.mailtoPatched = "true";
        paragraph.replaceWith(link);
      });
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

  function findDesktopNavRow(nav) {
    return Array.from(nav.querySelectorAll("div")).find((element) => {
      const classes = Array.from(element.classList);
      return classes.includes("hidden") && classes.includes("lg:flex");
    }) || null;
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

  function ensureInvestorSection() {
    const contactSection = document.querySelector("#contact");
    if (!contactSection || document.querySelector("#investors")) {
      return;
    }

    const section = document.createElement("section");
    section.id = "investors";
    section.className = "site-investors";
    section.innerHTML = `
      <div class="site-shell">
        <div class="site-investors-layout">
          <div class="site-panel site-investor-summary">
            <p class="site-kicker">INVESTOR RELATIONS</p>
            <h2 class="site-heading">Information built for public-market scrutiny.</h2>
            <p class="site-copy">
              For shareholders, analysts, governance teams, and strategic investors, NEXAI routes
              enquiries through controlled channels aligned with approved company materials and
              formal disclosure practices.
            </p>
            <div class="site-button-row">
              <a class="btn-primary" href="${pageLinks.investors}">Open IR Center</a>
              <a class="btn-secondary" href="${mailtoLinks.investorRelations}">Email Investor Relations</a>
            </div>
          </div>
          <div class="site-panel site-investor-focus">
            <div class="site-mini-label">Coverage</div>
            <h3>What this section is designed to support</h3>
            <ul class="site-investor-list">
              <li>Requests for approved company materials and shareholder-facing documents.</li>
              <li>Governance and oversight questions that need a controlled investor contact path.</li>
              <li>Management, analyst, and investor meeting requests handled alongside disclosure discipline.</li>
            </ul>
            <p class="site-note">
              <strong>Important:</strong> Website content is provided for general corporate
              information only and should be read together with formally released company disclosures.
            </p>
          </div>
        </div>
        <div class="site-investor-grid">
          <div class="site-panel site-investor-card">
            <div class="site-mini-label">Materials</div>
            <h3>Approved company information</h3>
            <p>
              Request current company overviews, shareholder communications, and other approved
              materials through investor relations rather than relying on informal summaries.
            </p>
          </div>
          <div class="site-panel site-investor-card">
            <div class="site-mini-label">Governance</div>
            <h3>Governance and oversight context</h3>
            <p>
              Route board, policy, and governance enquiries through an appropriate corporate
              contact rather than relying on informal summaries or marketing copy.
            </p>
          </div>
          <div class="site-panel site-investor-card">
            <div class="site-mini-label">Disclosures</div>
            <h3>Public-market discipline</h3>
            <p>
              Investor-facing requests are framed around approved releases and controlled
              communications so stakeholders can evaluate the business on consistent information.
            </p>
          </div>
        </div>
      </div>
    `;

    contactSection.insertAdjacentElement("beforebegin", section);
  }

  function ensureNavLinks() {
    const nav = document.querySelector("nav");
    if (!nav) {
      return;
    }

    const desktopRow = findDesktopNavRow(nav);
    if (desktopRow && !desktopRow.querySelector('a[href="#investors"]')) {
      const investorLink = createLink(
        "Investors",
        "#investors",
        "text-sm text-nexai-text-muted hover:text-nexai-text transition-colors duration-300",
      );
      const contactLink = Array.from(desktopRow.querySelectorAll("a")).find(
        (link) => normalizeText(link.textContent || "") === "Contact",
      );
      if (contactLink) {
        contactLink.insertAdjacentElement("beforebegin", investorLink);
      }
    }
  }

  function enhanceContactSection() {
    const contactSection = document.querySelector("#contact");
    if (!contactSection) {
      return;
    }

    const intro = contactSection.querySelector("div > p.text-nexai-text-muted.leading-relaxed");
    if (intro) {
      intro.textContent =
        "Whether you're a hyperscaler looking for capacity, an investor reviewing the opportunity, or a partner ready to join the ecosystem, we'll route your enquiry to the right team.";
    }

    const leftColumn = Array.from(contactSection.querySelectorAll("div")).find((element) => {
      return element.classList.contains("space-y-8");
    });

    if (leftColumn && !leftColumn.querySelector('[data-site-investor-contact="true"]')) {
      const ctaRow = Array.from(leftColumn.children).find((element) => {
        return element.classList.contains("flex") && element.querySelector("a");
      });

      const card = document.createElement("div");
      card.className = "glass-card p-6 site-contact-card";
      card.dataset.siteInvestorContact = "true";
      card.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-nexai-accent/10 flex items-center justify-center">
            <span class="site-symbol">IR</span>
          </div>
          <div>
            <h4 class="font-display font-semibold text-nexai-text">Investor Relations</h4>
            <a class="text-nexai-text-muted text-sm" href="${mailtoLinks.investorRelations}">
              ${companyEmail}
            </a>
          </div>
        </div>
        <p class="text-nexai-text-muted text-sm leading-relaxed">
          Use this path for shareholder, governance, or approved-material requests that need
          disciplined handling.
        </p>
      `;

      if (ctaRow) {
        ctaRow.insertAdjacentElement("beforebegin", card);
      } else {
        leftColumn.append(card);
      }
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
              NEXAI presents general corporate information for customers, partners, and capital
              markets audiences evaluating the business through approved disclosure channels.
            </p>
            <div class="site-footer-links">
              <a href="${pageLinks.investors}">Investor Relations Center</a>
              <a href="${mailtoLinks.approvedMaterials}">Request approved company materials</a>
            </div>
          </div>
          <div class="site-footer-column">
            <p class="site-footer-heading">Explore</p>
            <div class="site-footer-links">
              <a href="#about">About</a>
              <a href="#approach">Approach</a>
              <a href="#vision">Vision</a>
              <a href="#leadership">Leadership</a>
              <a href="#investors">Investors</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div class="site-footer-column">
            <p class="site-footer-heading">Investors</p>
            <div class="site-footer-links">
              <a href="${pageLinks.investors}">IR Center</a>
              <a href="${mailtoLinks.investorRelations}">Investor enquiries</a>
              <a href="${mailtoLinks.approvedMaterials}">Approved materials</a>
              <a href="#investors">IR on homepage</a>
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
            This website provides general corporate information only and does not constitute an
            offer to sell or a solicitation to buy securities.
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

      if (!navLinks.some((link) => link.getAttribute("href") === "#investors")) {
        const contactIndex = navLinks.findIndex(
          (link) => normalizeText(link.textContent || "") === "Contact",
        );
        const investorLink = createLink("Investors", "#investors", "");
        if (contactIndex >= 0) {
          navLinks.splice(contactIndex, 0, investorLink);
        } else {
          navLinks.push(investorLink);
        }
      }

      panel.innerHTML = "";
      panel.className = "site-mobile-menu-panel";
      panel.dataset.siteEnhanced = "true";

      const header = document.createElement("div");
      header.className = "site-mobile-menu-header";
      header.innerHTML = `
        <p class="site-kicker">Navigate</p>
        <h2 class="site-mobile-menu-title">Explore NEXAI</h2>
        <p class="site-mobile-menu-copy">
          Public-company information, infrastructure context, and controlled investor routes in one place.
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
        createLink("Investor Relations Center", pageLinks.investors, "btn-secondary"),
      );

      const footer = document.createElement("div");
      footer.className = "site-mobile-menu-footer";
      footer.innerHTML = `
        <div class="site-mobile-menu-meta-links">
          <a href="${pageLinks.privacy}">Privacy</a>
          <a href="${pageLinks.terms}">Terms</a>
          <a href="${mailtoLinks.investorRelations}">IR Enquiry</a>
        </div>
        <p class="site-mobile-menu-note">
          General corporate information only. Use approved company materials and formal disclosures
          for investor evaluation.
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
      note.textContent = "Submitting opens your email app with a pre-addressed message to info@nexai.id.";
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
    ensureInvestorSection();
    updateLogoSources();
    updatePlaceholderLinks();
    updateEmailLinks();
    updateAltText();
    ensureNavLinks();
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
