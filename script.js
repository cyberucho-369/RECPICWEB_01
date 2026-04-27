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
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
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

});
