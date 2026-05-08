/* ============================================
   RECPIC — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- FAQ Accordion ----------
  const toggles = document.querySelectorAll('.faq-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const currentItem = this.parentElement;
      const isActive = currentItem.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
      if (!isActive) currentItem.classList.add('active');
    });
  });

  // ---------- Collab Accordion ----------
  document.querySelectorAll('.collab-accordion-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const currentItem = this.closest('.collab-accordion-item');
      const isActive = currentItem.classList.contains('active');
      document.querySelectorAll('.collab-accordion-item').forEach(item => item.classList.remove('active'));
      if (!isActive) currentItem.classList.add('active');
    });
  });

  // ---------- Timecode Ticker ----------
  const tcElements = document.querySelectorAll('.timecode-ticker');
  let frames = 0, seconds = 0, minutes = 0;
  const pad = num => num.toString().padStart(2, '0');

  setInterval(() => {
    frames++;
    if (frames >= 24) { frames = 0; seconds++; }
    if (seconds >= 60) { seconds = 0; minutes++; }
    const tcStr = `TCR 00:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
    tcElements.forEach(el => el.innerText = tcStr);
  }, 1000 / 24);

  // ---------- Navbar Scroll Effect ----------
  const header = document.getElementById('main-header');
  const progressBar = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });

  // ---------- Parallax ----------
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.parallax').forEach(el => {
      const speed = el.getAttribute('data-speed') || 0.1;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const yPos = (rect.top - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${yPos}px)`;
      }
    });
  }, { passive: true });

  // ---------- Scroll Reveal (IntersectionObserver) ----------
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

  // ---------- Mobile Menu ----------
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      const isActive = mainNav.classList.contains('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
      if (isActive) {
        header.classList.add('menu-open');
      } else {
        header.classList.remove('menu-open');
      }
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
        header.classList.remove('menu-open');
      });
    });
  }

  // ---------- Smooth Scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = header.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ---------- Active Nav Link on Scroll ----------
  const sections = document.querySelectorAll('section[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(section => navObserver.observe(section));

  // ---------- Page Navigation Helper ----------
  window.showPage = function(pageId) {
    const target = document.getElementById(pageId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  // ---------- Shared: extract numeric prefix from folder name ----------
  const getFolderNum = (name) => {
    const m = name.match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

  // ---------- Dynamic Portfolio & Video Modal ----------
  const portfolioCards = document.querySelectorAll('.portfolio-card[data-portfolio-id]');
  const videoModal = document.getElementById('video-modal');
  const videoIframe = document.getElementById('video-modal-iframe');

  if (videoModal) {
    const closeModal = () => {
      videoModal.classList.remove('active');
      videoIframe.src = '';
    };

    document.getElementById('video-modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('video-modal-close-bg').addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) closeModal();
    });
  }

  const getEmbedUrl = (urlStr) => {
    try {
      const url = new URL(urlStr.trim());
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = url.searchParams.get('v');
        if (!videoId && url.hostname.includes('youtu.be')) videoId = url.pathname.slice(1);
        if (!videoId && url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      }
      return urlStr;
    } catch(e) {
      return urlStr;
    }
  };

  if (portfolioCards.length) {
    fetch('assets/portfolio/manifest.json')
      .then(res => res.ok ? res.json() : [])
      .then(manifest => {
        portfolioCards.forEach(card => {
          const id = card.getAttribute('data-portfolio-id');
          const targetNum = parseInt(id, 10);
          const folder = manifest.find(f => getFolderNum(f) === targetNum) || id;

          fetch(`assets/portfolio/${folder}/info.txt`)
            .then(res => {
              if (!res.ok) throw new Error('File not found');
              return res.text();
            })
            .then(text => {
              const lines = text.split('\n').filter(l => l.trim().length > 0);
              const title = lines[0] || `Project ${id}`;
              const videoUrl = lines[1] || '';

              card.innerHTML = `
                <img class="portfolio-thumb" src="assets/portfolio/${folder}/thumb.jpg" alt="${title}" onerror="this.onerror=null; this.src='assets/images/solution-bg.jpg';">
                <div class="portfolio-play-btn">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div class="portfolio-info-bar">
                  <h4 class="portfolio-title">${title}</h4>
                </div>
              `;

              if (videoUrl) {
                card.addEventListener('click', () => {
                  if (videoModal && videoIframe) {
                    videoIframe.src = getEmbedUrl(videoUrl);
                    videoModal.classList.add('active');
                  }
                });
              }
            })
            .catch(err => {
              console.warn(`Portfolio ${id} data not found:`, err);
            });
        });
      });
  }

  // ---- Testimonials mobile carousel dots ----
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  if (testimonialsGrid && testimonialDots.length) {
    const mq = window.matchMedia('(max-width: 768px)');
    const syncDots = () => {
      if (!mq.matches) return;
      const card = testimonialsGrid.querySelector('.testimonial-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 16;
      const index = Math.round(testimonialsGrid.scrollLeft / cardWidth);
      testimonialDots.forEach((d, i) => d.classList.toggle('active', i === index));
    };
    testimonialsGrid.addEventListener('scroll', syncDots, { passive: true });
  }

  // ---------- Portfolio PAGE — Dynamic Grid (folders 07+) with Filtering ----------
  const pfGrid = document.getElementById('portfolio-page-grid');
  const pfModal = document.getElementById('pf-video-modal');
  const pfIframe = document.getElementById('pf-modal-iframe');

  if (pfGrid) {
    // Modal controls
    if (pfModal) {
      const pfCloseModal = () => {
        pfModal.classList.remove('active');
        pfIframe.src = '';
      };
      document.getElementById('pf-modal-close-btn').addEventListener('click', pfCloseModal);
      document.getElementById('pf-modal-close-bg').addEventListener('click', pfCloseModal);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pfModal.classList.contains('active')) pfCloseModal();
      });
    }

    // Embed URL parser
    const pfGetEmbedUrl = (urlStr) => {
      try {
        const url = new URL(urlStr.trim());
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
          let videoId = url.searchParams.get('v');
          if (!videoId && url.hostname.includes('youtu.be')) videoId = url.pathname.slice(1);
          if (!videoId && url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2];
          if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else if (url.hostname.includes('vimeo.com')) {
          const videoId = url.pathname.split('/').pop();
          if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }
        return urlStr;
      } catch (e) {
        return urlStr;
      }
    };

    // Tag parser — extracts tag from "tag: promo" or "tag: event" etc.
    const parseTag = (lines) => {
      for (const line of lines) {
        const match = line.match(/^tag:\s*(.+)/i);
        if (match) return match[1].trim().toLowerCase();
      }
      return '';
    };

    // Ratio parser — extracts ratio from "Ratio:9:16" etc.
    const parseRatio = (lines) => {
      for (const line of lines) {
        const match = line.match(/^ratio:\s*(\d+:\d+)/i);
        if (match) return match[1];
      }
      return '16:9';
    };

    // Discover portfolio folders from manifest (skip 01-06, shown on home page)
    const MIN_SORT = 7;

    fetch('assets/portfolio/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('Manifest not found');
        return res.json();
      })
      .then(manifest => {
        const entries = manifest.filter(f => getFolderNum(f) >= MIN_SORT);
        return Promise.all(entries.map(folder =>
          fetch(`assets/portfolio/${folder}/info.txt`)
            .then(res => {
              if (!res.ok) throw new Error('Not found');
              return res.text();
            })
            .then(text => {
              const lines = text.split('\n').filter(l => l.trim().length > 0);
              return {
                id: folder,
                num: getFolderNum(folder),
                title: lines[0] || `Project ${folder}`,
                videoUrl: lines[1] || '',
                tag: parseTag(lines),
                ratio: parseRatio(lines)
              };
            })
            .catch(() => null)
        ));
      })
      .then(results => {
      const items = results.filter(r => r !== null).sort((a, b) => b.num - a.num);

      // --- Filter state ---
      const activeTags = new Set();
      const filterToggle = document.getElementById('pf-filter-toggle');
      const filterDropdown = document.getElementById('pf-filter-dropdown');
      const filterBadge = document.getElementById('pf-filter-badge');
      const filterClear = document.getElementById('pf-filter-clear');
      const filterCount = document.getElementById('pf-filter-count');
      const filterOptions = document.querySelectorAll('.pf-filter-option');

      // Apply filters — show/hide cards
      const applyFilters = () => {
        const cards = pfGrid.querySelectorAll('.pf-video-card');
        let visibleCount = 0;
        cards.forEach(card => {
          const cardTag = card.getAttribute('data-tag');
          if (activeTags.size === 0 || activeTags.has(cardTag)) {
            card.classList.remove('pf-hidden');
            visibleCount++;
          } else {
            card.classList.add('pf-hidden');
          }
        });

        // Update badge
        if (activeTags.size > 0) {
          filterBadge.textContent = activeTags.size;
          filterBadge.classList.add('visible');
          filterToggle.classList.add('active');
        } else {
          filterBadge.classList.remove('visible');
          filterToggle.classList.remove('active');
        }

        // Update count text
        if (filterCount) {
          filterCount.textContent = activeTags.size > 0
            ? `${visibleCount} / ${items.length} PROJECTS`
            : `${items.length} PROJECTS`;
        }
      };

      // Toggle dropdown
      if (filterToggle && filterDropdown) {
        filterToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          filterDropdown.classList.toggle('open');
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
          if (!filterDropdown.contains(e.target) && !filterToggle.contains(e.target)) {
            filterDropdown.classList.remove('open');
          }
        });
      }

      // Checkbox toggles
      filterOptions.forEach(option => {
        option.addEventListener('click', () => {
          const tag = option.getAttribute('data-tag');
          if (activeTags.has(tag)) {
            activeTags.delete(tag);
            option.classList.remove('checked');
          } else {
            activeTags.add(tag);
            option.classList.add('checked');
          }
          applyFilters();
        });
      });

      // Clear all filters
      if (filterClear) {
        filterClear.addEventListener('click', () => {
          activeTags.clear();
          filterOptions.forEach(o => o.classList.remove('checked'));
          applyFilters();
        });
      }

      // --- Render cards ---
      const pfModalContent = pfModal ? pfModal.querySelector('.pf-modal-content') : null;
      const pfModalResponsive = pfModal ? pfModal.querySelector('.pf-modal-responsive') : null;

      items.forEach(item => {
        const isPortrait = item.ratio === '9:16';
        const card = document.createElement('div');
        card.className = 'pf-video-card reveal-up' + (isPortrait ? ' pf-video-card--portrait' : '');
        card.setAttribute('data-tag', item.tag);
        card.innerHTML = `
          <img class="pf-thumbnail-img" src="assets/portfolio/${item.id}/thumb.jpg" alt="${item.title}" onerror="this.onerror=null; this.src='assets/images/solution-bg.jpg';">
          <div class="pf-card-overlay">
            <div class="pf-card-info">
              <h3 class="pf-card-title">${item.title}</h3>
            </div>
          </div>
          <div class="pf-play-btn">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        `;

        if (item.videoUrl && pfModal && pfIframe) {
          card.addEventListener('click', () => {
            pfIframe.src = pfGetEmbedUrl(item.videoUrl);
            if (pfModalContent) pfModalContent.classList.toggle('pf-modal-content--portrait', isPortrait);
            if (pfModalResponsive) pfModalResponsive.classList.toggle('pf-modal-responsive--portrait', isPortrait);
            pfModal.classList.add('active');
          });
        }

        pfGrid.appendChild(card);

        if (typeof observer !== 'undefined') {
          observer.observe(card);
        }
      });

      // Initial count
      applyFilters();

      if (items.length === 0) {
        pfGrid.innerHTML = '<p style="color: rgba(255,255,255,0.4); font-family: var(--font-mono, monospace); font-size: 0.85rem; grid-column: 1/-1; text-align: center; padding: 4rem 0;">SYS.NOTICE // No portfolio items found</p>';
      }
    }).catch(err => {
      console.error('Portfolio manifest error:', err);
      pfGrid.innerHTML = '<p style="color: rgba(255,255,255,0.4); font-family: var(--font-mono, monospace); font-size: 0.85rem; grid-column: 1/-1; text-align: center; padding: 4rem 0;">SYS.NOTICE // Portfolio manifest not found</p>';
    });
  }

});
