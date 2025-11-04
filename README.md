# Samuel Oliveira Portfolio Website

**Live:** https://sam-ciber-dev.github.io

## Overview

A static portfolio website hosted on GitHub Pages, focused on cybersecurity projects, technical skills, certificates, and a contact form.

## Features

- Advanced SEO: canonical, Open Graph/Twitter tags, structured data (JSON‑LD)
- robots.txt + sitemap.xml configured
- Anti‑spam contact form (Formspree + honeypot + time‑trap)
- CV and certificates open in new tabs (PDF)
- Responsive layout and accessible semantics (keyboard‑friendly, semantic HTML)

## How it works

The site is fully static and client-driven, yet behaves like a small application.  
All interactions, including the contact form, project rendering, and anti-spam logic, are handled in index.js without external dependencies.

### Contact form

- The form uses Formspree as a lightweight backend.
- Data is sent via POST with the required fields: name, email, subject, and message.
- Successful submissions trigger inline confirmation (via Formspree response) or can optionally redirect to a thank-you page.
- All external links and documents open in a new browser tab to keep navigation frictionless.

### Anti-spam measures

To protect the form from automated spam, several layers are applied:

- Honeypot: hidden _gotcha field must remain empty; bots filling it are discarded.
- Decoy field: a fake website input acts as a secondary trap for less sophisticated crawlers.
- Time-trap: a hidden timestamp (ts) is set on load; forms submitted in under a few seconds are flagged or ignored.

These traps reduce automated spam submissions without relying on third-party captchas, preserving accessibility and user privacy.

### Dynamic project rendering

- index.js dynamically generates project cards from a JSON-like dataset: [{ title, description, tags, links }]
- Projects are grouped by category with simple client-side pagination (previous/next controls per category).
- Cards are created with accessible semantics and automatically injected into containers by ID.

## Tech details

- **Stack:** HTML5, CSS3, Vanilla JavaScript — no framework or build tools.
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

The site uses a lightweight, no-build architecture optimized for a fast first paint and minimal blocking resources. It preconnects to font and CDN domains to reduce handshake latency, defers all JavaScript to allow early content rendering, and keeps the critical path minimal with no external dependencies. The site follows **Google Lighthouse** best practices for SEO and accessibility; meta tags and structured data are validated via the Rich Results Test.

**Potential next steps:** preload the Inter font, compress images (PNG → WebP), and minify CSS/JS once the site stabilizes.

## Project structure

- index.html — main page
- index.css — styles
- index.js — interactions, validations, anti‑spam
- robots.txt — indexing rules + sitemap
- sitemap.xml — sitemap for crawlers
- .nojekyll — serve as pure static site on GitHub Pages
- CV/ — public (PDF)
- certeficados/ — certificate PDFs
- assets/ — images (e.g., social preview), optional

## Contact

- **Email:** sam.oliveira.dev@gmail.com 
- **Compose in Gmail:** [Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=sam.oliveira.dev@gmail.com&su=Portfolio%20inquiry&body=Hi%20Samuel%2C%0A)
- **Compose in Outlook:** [Outlook](https://outlook.live.com/owa/?path=/mail/action/compose&to=sam.oliveira.dev@gmail.com&subject=Portfolio%20inquiry&body=Hi%20Samuel%2C%0A)  
- **LinkedIn:** [Samuel Oliveira](https://www.linkedin.com/in/jose-samuel-oliveira)

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
