# Samuel Oliveira — Portfólio (GitHub Pages)

Site estático do meu portefólio: cibersegurança, projetos e contactos. Preparado para GitHub Pages, com SEO avançado e proteção anti‑spam no formulário (Formspree + honeypot + time‑trap).

> Atualiza o URL público abaixo assim que o Pages estiver ativo.

- Site (prod): https://sam-ciber-dev.github.io/  ← ajustar quando publicar
- Repositório: este repo

## Principais features
- PWA‑like head: meta robots, theme‑color, OG/Twitter básicos
- Structured Data (JSON‑LD): WebSite, Person, WebPage
- SEO pronto para produção (falta só preencher URLs absolutas pós‑deploy)
- Formulário de contacto via Formspree com honeypot, decoy e armadilha de tempo
- Secção de projetos com EyeWeb (em fase de desenvolvimento)
- Certificados em PDF abrem em nova aba (não forçam download)
- Botão “Download CV” abre CV/Jose_Oliveira_CV_publico.pdf em nova aba

## Stack
- HTML5, CSS3
- JavaScript vanilla
- Formspree (backend do formulário)

## Estrutura
```
.
├─ index.html        # Página principal
├─ index.css         # Estilos
├─ index.js          # Interações, UI, validações e anti‑spam
├─ robots.txt        # Indexação (com Sitemap comentado)
├─ sitemap.xml       # (preparado) Preencher domínio após publicar
├─ .nojekyll         # Serve como site estático puro no Pages
├─ CV/
│  └─ Jose_Oliveira_CV_publico.pdf
├─ JoseOliveira_certeficado_GPSI.pdf
├─ JoseOliveira_certeficado_Joteca.pdf
└─ ... (backups históricos fora de produção)
```

## Como correr localmente
- Basta abrir `index.html` no navegador.
- Opcional: usar a extensão “Live Server” no VS Code.

## Deploy (GitHub Pages)
1. Cria o repositório do site. Recomendo user site: `sam-ciber-dev.github.io` (URL limpa), ou um repo de projeto.
2. Faz push do conteúdo (inclui `.nojekyll`).
3. Repo → Settings → Pages → Deploy from a branch → main / (root).
4. Espera 1–3 minutos para propagar.

## Check‑list pós‑publicação (SEO)
- [ ] Adicionar `<link rel="canonical" href="https://SEU-DOMINIO/">`
- [ ] Definir `og:url` e `twitter:url`
- [ ] Definir `og:image` e `twitter:image` (1200×630 PNG, URL absoluto)
- [ ] Atualizar JSON‑LD com `@id`/`url` absolutos
- [ ] Atualizar `robots.txt` com `Sitemap: https://SEU-DOMINIO/sitemap.xml`
- [ ] Validar em Rich Results Test + Sharing Debugger + Card Validator

## Licenças
- Código: MIT (ver `LICENSE`)
- Conteúdo (texto/imagens do portefólio e CV): CC BY 4.0 (ver `LICENSE-CC-BY-4.0.md`)
- Ícones: Font Awesome; Fontes: Google Fonts

## Contacto
- Email: sam.oliveira.dev@gmail.com
- LinkedIn: https://www.linkedin.com/in/jos%C3%A9-samuel-oliveira-367299377/
- GitHub: https://github.com/Sam-Ciber-Dev
