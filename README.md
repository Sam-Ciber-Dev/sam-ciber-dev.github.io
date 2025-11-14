# Samuel Oliveira Portfolio Website

**Live:** https://sam-ciber-dev.github.io

## Overview

A static portfolio website hosted on GitHub Pages, focused on cybersecurity projects, technical skills, certificates, and a contact form. Built with a modular, security-oriented architecture in Vanilla JavaScript, emphasizing accessibility, privacy, and performance.

## Features

- Advanced SEO: canonical, Open Graph/Twitter tags, structured data (JSON-LD).
- robots.txt and sitemap.xml configured (includes CV and certificates).
- Anti-spam contact form (Formspree + honeypot + decoy + time-trap + content validation).
- Copy email to clipboard with notification.
- CV selection modal (PT/EN) with full accessibility and focus trapping.
- Keyboard shortcuts: **Shift+S** (next section), **Shift+A** (previous section).
- Scroll lock until the transition completes.
- Responsive layout and accessible semantics (keyboard-friendly, semantic HTML).
- Smooth fade-in animations with IntersectionObserver.

## How it works

The site is fully static and client-driven, yet behaves like a small application. All logic is modularized and handled through ES modules imported in `main.js`. Each module has a single responsibility.

### Contact form

- The form uses Formspree as a lightweight backend.
- Data is sent via POST with the required fields: name, email, subject, and message.
- Successful submissions trigger inline confirmation (via Formspree response).
- All external links and documents open in new browser tabs to ensure smooth navigation.

### Anti-spam measures

To protect the form from automated spam, several layers are applied:

- Honeypot: hidden _gotcha field must remain empty; bots filling it are discarded.
- Decoy field: a fake website input acts as a secondary trap for less sophisticated crawlers.
- Time-trap: a hidden timestamp (ts) is set on load; forms submitted in under a few seconds are flagged or ignored.
- Content validation: checks message length and suspicious patterns.
- Domain blacklist: filters disposable addresses (tempmail, mailinator, etc.).

These traps reduce automated spam submissions without relying on third-party captchas, preserving accessibility and user privacy.

### Dynamic project rendering

- Projects are dynamically generated from projects-data.js.  
- Cards are rendered with accessible semantics and adaptive pagination based on viewport size.  
- Placeholder cards maintain layout consistency when fewer projects are available.  
- Pagination buttons include loading state and anti-abuse lock during animations.

### Accessibility

- Fully keyboard-navigable.
- Accessible modal semantics.
- Focus trapping and restoration in modals.
- Reduced motion support.
- Logical heading order and descriptive labels.
- Accessible color contrast and focus outlines.

### Animations
- Fade-in elements.
- Animated hero background with fallback for reduced-motion users.
- Seam fix applied between hero and about sections to prevent scroll jank.

## Tech details

- **Stack:** HTML5, CSS3, Vanilla JavaScript. No framework or build tools.
- **Icons:** Font Awesome 6.4.0 (via CDN).
- **Fonts:** Inter, loaded from Google Fonts.
- **Forms:** Formspree (serverless email form backend).
- **Hosting:** GitHub Pages, pure static deployment (.nojekyll ensures no Jekyll processing).
- **Meta & SEO:** canonical URL, Open Graph and Twitter tags, JSON-LD structured data, sitemap, and robots.txt for crawl control.
- **Accessibility:** keyboard-friendly navigation, semantic markup, proper labels and focus states.

## Browser support

Designed and tested for modern evergreen browsers, following the “last-two-versions” rule:

- Chrome, Edge, Firefox, Safari, Vivaldi, and Opera GX (Chromium-based).
- iOS Safari ≥ 12 and latest Chrome/Firefox on Android.
- Legacy browsers like Internet Explorer are not supported, prioritizing modern standards, security, and smaller code footprint.

## Performance

The site uses a lightweight, no-build architecture optimized for a fast first paint with minimal blocking resources. It preconnects to font and CDN domains (reducing handshake latency), preloads the Inter font, and loads JavaScript as a module at the end of the body (non-blocking), keeping the critical path minimal and avoiding external runtime dependencies. It follows Google Lighthouse best practices for SEO and accessibility; meta tags and structured data are validated using the Rich Results Test.

### Performance improvements implemented
- Inter font preload configured
- Animations driven by IntersectionObserver (respects prefers-reduced-motion)
- Single non-blocking module script at the end of body
- Single stylesheet to keep the critical path small

### Potential next steps
- Minify CSS and JavaScript for production
- Integrate linting and JSDoc documentation
- Add basic CI for validation and deployment

## Project structure

- index.html - main entry point
- index.css - global styles
- js/ - JavaScript modules
  - main.js - module bootstrap
  - anchors.js - smooth anchors + hero/about seam fix
  - navigation.js - active link + header handling
  - menu.js - mobile menu toggle
  - modal.js - CV selector modal (ARIA, focus trap)
  - form.js - contact form + anti-spam (honeypot/decoy/time-trap)
  - projects.js - rendering + adaptive pagination + button lock/loader
  - projects-data.js - dataset for projects
  - validation.js - name/email/content validation (incl. disposable domains)
  - keyboard-nav.js - Shift+S / Shift+A shortcuts with scroll lock
  - layout.js - header height + layout utilities
  - dom-utils.js - shared DOM helpers
  - observer.js - fade-in animations via IntersectionObserver
  - notifications.js - copy/feedback toast helpers
  - copy.js - copy-to-clipboard behavior
  - data-handlers.js - small helpers wiring actions (future)
- robots.txt - indexing rules + sitemap reference
- sitemap.xml - sitemap for crawlers (includes PDFs)
- .nojekyll - ensures pure static deployment
- .gitignore - ignores artifacts/backups
- CV/ - public CV PDFs (PT and EN)
- certificate PDFs
- assets/ - images and social preview

## Contact

- **Email:** sam.oliveira.dev@gmail.com 
- **Compose in Gmail:** [Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=sam.oliveira.dev@gmail.com&su=Portfolio%20inquiry&body=Hi%20Samuel%2C%0A)
- **Compose in Outlook:** [Outlook](https://outlook.live.com/owa/?path=/mail/action/compose&to=sam.oliveira.dev@gmail.com&subject=Portfolio%20inquiry&body=Hi%20Samuel%2C%0A)  
- **LinkedIn:** [linkedin.com/in/jose-samuel-oliveira](https://www.linkedin.com/in/jose-samuel-oliveira)
- **Website:** [sam-ciber-dev.github.io](https://sam-ciber-dev.github.io)

## License

This repository is licensed under the [**MIT License**](LICENSE) and [**CC BY 4.0**](LICENSE-CC-BY-4.0.md). See [**LICENSE**](LICENSE) and [**LICENSE-CC-BY-4.0.md**](LICENSE-CC-BY-4.0.md) for details.

## Social Preview

The social preview image used for link cards:

<img src="assets/social-preview.png" alt="Samuel Oliveira Portfolio — Cybersecurity, DevOps, Web, Software" width="640">

## Badges

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
