/* =========================================================
   Portfolio interactions
   Sections: 1. Setup  2. Navbar  3. Mobile menu  4. Scroll reveal
   5. Active nav highlight  6. Node background  7. Project modal
   8. Hero text reveal  9. Achievement filters  10. Cert/LOR lightbox
   11. Contact form
   ========================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. GITHUB URL (edit this) ---------- */
  // TODO: put your GitHub profile URL here once you have it.
  const GITHUB_URL = ''; // e.g. 'https://github.com/yourusername'
  document.querySelectorAll('#githubLink, #footerGithub').forEach((el) => {
    if (GITHUB_URL) {
      el.href = GITHUB_URL;
      const value = el.querySelector('.contact-value');
      if (value) value.textContent = GITHUB_URL.replace('https://', '');
    }
  });

  /* ---------- 2. NAVBAR: shrink + blur on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ---------- 3. MOBILE NAV MENU ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- 4. SCROLL REVEAL ---------- */
  const revealTargets = document.querySelectorAll('.reveal, .about-copy p, .panel, .skill-card, .project-card, .cert-card');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  let revealObserver = null;

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), (i % 6) * 70);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- 5. ACTIVE NAV SECTION HIGHLIGHT ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- 6. NODE NETWORK BACKGROUND (hero "connecting the dots") ---------- */
  const canvas = document.getElementById('node-canvas');
  const ctx = canvas.getContext('2d');
  let nodes = [];
  let width, height;
  let animId = null;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.min(window.innerHeight, 900);
    const count = Math.max(24, Math.min(70, Math.floor((width * height) / 24000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
    }));
  }

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function drawNodes() {
    ctx.clearRect(0, 0, width, height);
    const linkDist = 130;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > width) a.vx *= -1;
      if (a.y < 0 || a.y > height) a.vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          ctx.strokeStyle = `rgba(86, 232, 207, ${0.14 * (1 - dist / linkDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 160) {
        ctx.strokeStyle = `rgba(143, 123, 246, ${0.35 * (1 - mdist / 160)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(86, 232, 207, 0.55)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(drawNodes);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (!prefersReducedMotion) {
    drawNodes();
  } else {
    // Static single frame for reduced-motion users
    drawNodes();
    cancelAnimationFrame(animId);
  }

  /* ---------- 7. PROJECTS: render cards + modal ---------- */
  // TODO: replace with your real project details. Keys match data-project index on each card.
  const PROJECT_DATA = [
    {
      title: 'Project One',
      image: '',
      problem: 'Describe the problem this project addressed.',
      approach: 'Describe the approach and key decisions.',
      tech: 'Tech A, Tech B, Tech C',
      contribution: 'Describe your specific contribution.',
      result: 'Describe the outcome or impact.',
      github: '#',
      demo: '#',
    },
    {
      title: 'Project Two',
      image: '',
      problem: 'Describe the problem this project addressed.',
      approach: 'Describe the approach and key decisions.',
      tech: 'Tech A, Tech B',
      contribution: 'Describe your specific contribution.',
      result: 'Describe the outcome or impact.',
      github: '#',
      demo: '#',
    },
    {
      title: 'Project Three',
      image: '',
      problem: 'Describe the problem this project addressed.',
      approach: 'Describe the approach and key decisions.',
      tech: 'Tech A, Tech B, Tech C',
      contribution: 'Describe your specific contribution.',
      result: 'Describe the outcome or impact.',
      github: '#',
      demo: '#',
    },
  ];

  /* Render project cards into #projectGrid from PROJECT_DATA above.
     Each card gets a "View Details" trigger (.js-open-modal) wired to the modal. */
  const projectGrid = document.getElementById('projectGrid');

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderProjects() {
    if (!projectGrid) return;

    if (!PROJECT_DATA.length) {
      projectGrid.innerHTML = `
        <div class="projects-empty">
          <p class="projects-empty-title">Projects coming soon</p>
          <p class="projects-empty-sub">Add entries to the PROJECTS list in script.js and cards will appear here automatically.</p>
        </div>`;
      return;
    }

    projectGrid.innerHTML = PROJECT_DATA.map((p, i) => {
      const tags = (p.tech || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => `<span class="tag">${escapeHTML(t)}</span>`)
        .join('');

      const hasRealGithub = p.github && p.github !== '#';
      const hasRealDemo = p.demo && p.demo !== '#';

      const media = p.image
        ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="project-media-fallback" style="display:none">◈</div>`
        : `<div class="project-media-fallback">◈</div>`;

      return `
        <article class="project-card reveal">
          <div class="project-media">${media}</div>
          <div class="project-body">
            <h3 class="project-title">${escapeHTML(p.title)}</h3>
            <p class="project-desc">${escapeHTML(p.problem)}</p>
            <div class="tag-row">${tags}</div>
            <div class="project-actions">
              <button type="button" class="btn btn-sm btn-outline js-open-modal" data-project="${i}">View Details</button>
              ${hasRealGithub ? `<a class="icon-link" href="${escapeHTML(p.github)}" target="_blank" rel="noopener noreferrer">GitHub →</a>` : ''}
              ${hasRealDemo ? `<a class="icon-link" href="${escapeHTML(p.demo)}" target="_blank" rel="noopener noreferrer">Live Demo →</a>` : ''}
            </div>
          </div>
        </article>`;
    }).join('');

    // Newly injected cards need the reveal-on-scroll treatment applied to the rest of the page.
    projectGrid.querySelectorAll('.reveal').forEach((el) => {
      if (prefersReducedMotion) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  renderProjects();

  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalMedia = document.getElementById('modalMedia');
  const modalImage = document.getElementById('modalImage');
  const modalEyebrow = document.getElementById('modalEyebrow');
  let lastFocusedEl = null;

  function openModal(index) {
    const data = PROJECT_DATA[index];
    if (!data) return;

    modalEyebrow.textContent = 'Project';
    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalProblem').textContent = data.problem;
    document.getElementById('modalApproach').textContent = data.approach;
    document.getElementById('modalTech').textContent = data.tech;
    document.getElementById('modalContribution').textContent = data.contribution;
    document.getElementById('modalResult').textContent = data.result;
    document.getElementById('modalGithub').href = data.github;
    document.getElementById('modalDemo').href = data.demo;

    if (data.image) {
      modalImage.src = data.image;
      modalImage.alt = data.title;
      modalMedia.classList.add('has-image');
    } else {
      modalImage.removeAttribute('src');
      modalMedia.classList.remove('has-image');
    }

    lastFocusedEl = document.activeElement;
    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modalClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('.js-open-modal').forEach((btn) => {
    btn.addEventListener('click', () => openModal(Number(btn.dataset.project)));
  });
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
  });

  /* ---------- 8. HERO TEXT REVEAL ---------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.hero-name .line').forEach((line, i) => {
      line.style.transform = 'translateY(110%)';
      line.style.transition = `transform 0.9s ${0.15 + i * 0.12}s cubic-bezier(0.16,1,0.3,1)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        line.style.transform = 'translateY(0)';
      }));
    });
  }

 /* ---------- 9. ACHIEVEMENTS: CATEGORY FILTERS ---------- */

const filterButtons = document.querySelectorAll('.filter-btn');

const filterableCards = document.querySelectorAll(
    '#recognitionGrid [data-category], #lorGrid [data-category]'
);

filterButtons.forEach((button) => {

    button.addEventListener('click', () => {

        const selectedCategory = button.dataset.filter;

        // Update button state
        filterButtons.forEach((btn) => {
            const isActive = btn === button;

            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        // Filter cards
        filterableCards.forEach((card) => {

            const category = card.dataset.category;

            const shouldShow =
                selectedCategory === 'all' ||
                category === selectedCategory;

            if (shouldShow) {
                card.classList.remove('is-hidden');

                // Re-trigger reveal animation
                if (!prefersReducedMotion) {
                    card.classList.remove('is-visible');

                    requestAnimationFrame(() => {
                        card.classList.add('is-visible');
                    });
                } else {
                    card.classList.add('is-visible');
                }

            } else {
                card.classList.add('is-hidden');
                card.classList.remove('is-visible');
            }
        });
    });

});
  /* ---------- 10. CERTIFICATE / LOR LIGHTBOX ---------- */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastLightboxFocus = null;

 function openLightbox(src, title) {

    const frame = document.querySelector('.lightbox-frame');

    frame.classList.remove('has-error');

    lightboxImage.src = '';
    lightboxImage.alt = title || 'Certificate preview';
    lightboxTitle.textContent = title || 'Certificate';

    lightboxImage.onload = () => {
        frame.classList.remove('has-error');
    };

    lightboxImage.onerror = () => {
        frame.classList.add('has-error');
        console.error('Could not load:', src);
    };

    lightboxImage.src = src;

    lastLightboxFocus = document.activeElement;

    lightboxOverlay.classList.add('is-open');
    lightboxOverlay.setAttribute('aria-hidden', 'false');

    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
}
  function closeLightbox() {
    lightboxOverlay.classList.remove('is-open');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastLightboxFocus) lastLightboxFocus.focus();
  }

  document.querySelectorAll('.js-lightbox-trigger').forEach((el) => {

    el.addEventListener('click', (e) => {

        e.preventDefault();

        const src = el.dataset.src;
        const title = el.dataset.title || 'Document';
        const type = el.dataset.type || 'image';

        if (!src) {
            console.error('Missing document path:', el);
            return;
        }

        if (type === 'pdf') {
            window.open(src, '_blank', 'noopener,noreferrer');
            return;
        }

        openLightbox(src, title);
    });

});
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('is-open')) closeLightbox();
  });

  /* ---------- 11. CONTACT FORM (mailto fallback) ---------- */
  // To send messages without opening the user's email client, replace this
  // handler with a fetch() call to a service like Formspree or EmailJS.
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:saikesavasantosh@gmail.com?subject=${subject}&body=${body}`;
  });
})();