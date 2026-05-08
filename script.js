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

  // ---------- Dynamic Portfolio & Video Modal ----------
  const portfolioCards = document.querySelectorAll('.portfolio-card[data-portfolio-id]');
  const videoModal = document.getElementById('video-modal');
  const videoIframe = document.getElementById('video-modal-iframe');
  
  if (videoModal) {
    const closeModal = () => {
      videoModal.classList.remove('active');
      videoIframe.src = ''; // stop playing
    };

    document.getElementById('video-modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('video-modal-close-bg').addEventListener('click', closeModal);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) closeModal();
    });
  }

  // Parse youtube/vimeo link to embed format
  const getEmbedUrl = (urlStr) => {
    try {
      const url = new URL(urlStr.trim());
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = url.searchParams.get('v');
        if (!videoId && url.hostname.includes('youtu.be')) videoId = url.pathname.slice(1);
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      }
      return urlStr; // fallback
    } catch(e) {
      return urlStr; 
    }
  };

  portfolioCards.forEach(card => {
    const id = card.getAttribute('data-portfolio-id'); // '01', '02', etc.
    
    // Fetch info.txt
    fetch(`assets/portfolio/${id}/info.txt`)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then(text => {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const title = lines[0] || `Project ${id}`;
        const videoUrl = lines[1] || '';

        // Inject DOM
        card.innerHTML = `
          <img class="portfolio-thumb" src="assets/portfolio/${id}/thumb.jpg" alt="${title}" onerror="this.onerror=null; this.src='assets/images/solution-bg.jpg';">
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
        // Fallback logic if missing
        console.warn(`Portfolio ${id} data not found:`, err);
      });
  });

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

    // Discover folders 07–99
    const MIN_FOLDER = 7;
    const MAX_FOLDER = 99;
    const folderPromises = [];

    for (let i = MIN_FOLDER; i <= MAX_FOLDER; i++) {
      const folderId = i.toString().padStart(2, '0');
      folderPromises.push(
        fetch(`assets/portfolio/${folderId}/info.txt`)
          .then(res => {
            if (!res.ok) throw new Error('Not found');
            return res.text();
          })
          .then(text => {
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            return {
              id: folderId,
              num: i,
              title: lines[0] || `Project ${folderId}`,
              videoUrl: lines[1] || '',
              tag: parseTag(lines)
            };
          })
          .catch(() => null)
      );
    }

    Promise.all(folderPromises).then(results => {
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
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'pf-video-card reveal-up';
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
        pfGrid.innerHTML = '<p style="color: rgba(255,255,255,0.4); font-family: var(--font-mono, monospace); font-size: 0.85rem; grid-column: 1/-1; text-align: center; padding: 4rem 0;">SYS.NOTICE // No portfolio items found in folders 07+</p>';
      }
    });
  }

});
