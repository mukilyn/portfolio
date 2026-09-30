/* ======================================================
   MUKILAN PORTFOLIO — app.js
   Matrix Decrypt Title Effect, Nav Rail & Interactions
   ====================================================== */

(function () {
  'use strict';

  // ---- Mechanical Split-Flap Ticker Title Animation (Atom Q Style) ----
  const giantTitle  = document.getElementById('giantTitle');
  const titleBlocks = document.querySelectorAll('.title-block');
  const FLAP_CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function getRandomFlapChar() {
    return FLAP_CHARS.charAt(Math.floor(Math.random() * FLAP_CHARS.length));
  }

  let isAnimationRunning = false;

  function runSplitFlapOpeningAnimation() {
    if (!titleBlocks.length) return;
    isAnimationRunning = true;

    // 1. Initial State: Put all blocks into scrambling state immediately (Amber/Brown + Orange)
    titleBlocks.forEach(block => {
      block.classList.remove('is-locked', 'just-locked');
      block.classList.add('is-scrambling');
      block.textContent = getRandomFlapChar();
    });

    // 2. Animate each block individually with staggered mechanical locking left-to-right
    titleBlocks.forEach((block, index) => {
      const finalChar = block.getAttribute('data-char') || block.textContent.trim() || ' ';

      // Each letter scrambles for: base 400ms + (index * 240ms)
      // Produces the progressive unlock: left side locks to white/black while right side continues in amber/orange
      const lockDelayMs = 400 + index * 240;
      const startTime = performance.now();

      const scrambleInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;

        if (elapsed >= lockDelayMs) {
          clearInterval(scrambleInterval);
          // Lock into place!
          block.textContent = finalChar;
          block.classList.remove('is-scrambling');
          block.classList.add('is-locked', 'just-locked');

          setTimeout(() => {
            block.classList.remove('just-locked');
          }, 350);

          if (index === titleBlocks.length - 1) {
            isAnimationRunning = false;
          }
        } else {
          // Rapid flap tick
          block.textContent = getRandomFlapChar();
          block.classList.add('flipping');
          setTimeout(() => block.classList.remove('flipping'), 35);
        }
      }, 50);
    });
  }

  // Hover effect: re-scramble and lock individual tile
  titleBlocks.forEach(block => {
    let hoverInterval = null;

    block.addEventListener('mouseenter', () => {
      if (isAnimationRunning) return;
      const finalChar = block.getAttribute('data-char') || block.textContent.trim();
      let ticks = 0;
      const maxTicks = 8;

      if (hoverInterval) clearInterval(hoverInterval);
      block.classList.remove('is-locked');
      block.classList.add('is-scrambling');

      hoverInterval = setInterval(() => {
        block.textContent = getRandomFlapChar();
        block.classList.add('flipping');
        setTimeout(() => block.classList.remove('flipping'), 35);
        ticks++;

        if (ticks >= maxTicks) {
          clearInterval(hoverInterval);
          block.textContent = finalChar;
          block.classList.remove('is-scrambling');
          block.classList.add('is-locked', 'just-locked');
          setTimeout(() => block.classList.remove('just-locked'), 300);
        }
      }, 45);
    });
  });

  // Clicking the whole title board re-runs the full animation sweep
  if (giantTitle) {
    giantTitle.addEventListener('click', () => {
      if (!isAnimationRunning) {
        runSplitFlapOpeningAnimation();
      }
    });
  }

  // Trigger animation on load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(runSplitFlapOpeningAnimation, 250);
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(runSplitFlapOpeningAnimation, 250);
  }

  // ---- Dark / Light Theme Toggle (Atom Q Dynamic Wave Transition) ----
  const themeToggle        = document.getElementById('themeToggle');
  const desktopThemeToggle = document.getElementById('desktopThemeToggle');
  const htmlEl             = document.documentElement;
  const themeLabel         = themeToggle ? themeToggle.querySelector('.theme-label') : null;
  const waveCurtain        = document.getElementById('atomqWaveCurtain');

  function updateThemeUI(theme) {
    const isLight = theme === 'light';
    if (themeLabel) {
      themeLabel.textContent = isLight ? 'DARK' : 'LIGHT';
    }
    if (desktopThemeToggle) {
      desktopThemeToggle.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      desktopThemeToggle.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    }
  }

  // Initialize saved theme or system preference
  const savedTheme = localStorage.getItem('atomq_theme');
  if (savedTheme === 'light') {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
    updateThemeUI('light');
  } else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
    updateThemeUI('dark');
  }

  let isThemeTransitioning = false;

  function toggleThemeWithWave() {
    if (isThemeTransitioning) return;
    const isCurrentlyLight = htmlEl.classList.contains('light');
    const targetTheme = isCurrentlyLight ? 'dark' : 'light';

    // Check if View Transition API is supported (Chromium & Modern Browsers)
    if (typeof document.startViewTransition === 'function') {
      isThemeTransitioning = true;
      htmlEl.setAttribute('data-theme-transition', targetTheme === 'light' ? 'to-light' : 'to-dark');

      const transition = document.startViewTransition(() => {
        if (targetTheme === 'light') {
          htmlEl.classList.remove('dark');
          htmlEl.classList.add('light');
        } else {
          htmlEl.classList.remove('light');
          htmlEl.classList.add('dark');
        }
        localStorage.setItem('atomq_theme', targetTheme);
        updateThemeUI(targetTheme);
      });

      transition.finished.finally(() => {
        htmlEl.removeAttribute('data-theme-transition');
        isThemeTransitioning = false;
      });
    } else if (waveCurtain) {
      // Fallback animated wave curtain
      isThemeTransitioning = true;
      waveCurtain.classList.remove('sweep-out');
      waveCurtain.classList.add('sweep-in');

      setTimeout(() => {
        if (targetTheme === 'light') {
          htmlEl.classList.remove('dark');
          htmlEl.classList.add('light');
        } else {
          htmlEl.classList.remove('light');
          htmlEl.classList.add('dark');
        }
        localStorage.setItem('atomq_theme', targetTheme);
        updateThemeUI(targetTheme);

        waveCurtain.classList.remove('sweep-in');
        waveCurtain.classList.add('sweep-out');

        setTimeout(() => {
          waveCurtain.classList.remove('sweep-out');
          isThemeTransitioning = false;
        }, 450);
      }, 350);
    } else {
      // Instant switch fallback
      if (targetTheme === 'light') {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
      } else {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
      }
      localStorage.setItem('atomq_theme', targetTheme);
      updateThemeUI(targetTheme);
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleThemeWithWave);
  }
  if (desktopThemeToggle) {
    desktopThemeToggle.addEventListener('click', toggleThemeWithWave);
  }

  // ---- Mobile Navigation Menu ----
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu    = document.getElementById('mobileMenu');
  const mobileLinks   = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ---- Side Nav Active Scroll Indicator ----
  const sections = document.querySelectorAll('section[id]');
  const navDots  = document.querySelectorAll('.nav-dot-item');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navDots.forEach(dot => {
          if (dot.getAttribute('data-section') === id) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // ---- Bottom-Left Pop Scroll Reveal Observer (Re-triggers every time on scroll) ----
  const revealElements = document.querySelectorAll('.reveal-left-pop');

  function checkScrollReveals() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // In view: add .visible; Out of view: remove .visible to re-trigger every scroll
      if (rect.top <= windowHeight - 40 && rect.bottom >= 40) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Dual window scroll/resize listener for 100% reliable re-triggering
  window.addEventListener('scroll', checkScrollReveals, { passive: true });
  window.addEventListener('resize', checkScrollReveals, { passive: true });
  // Initial check on load
  setTimeout(checkScrollReveals, 100);
  setTimeout(checkScrollReveals, 500);

  // ---- Contact Form Handler ----
  const contactForm = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('submitBtn');

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btnSpan = submitBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'TRANSMITTING...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      
      // IMPORTANT: Replace the URL below with your Formspree endpoint URL
      fetch('YOUR_FORMSPREE_ENDPOINT_HERE', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          if (btnSpan) btnSpan.textContent = 'TRANSMISSION SENT ✓';
          submitBtn.style.borderColor = 'var(--accent)';
          contactForm.reset();
        } else {
          if (btnSpan) btnSpan.textContent = 'ERROR. TRY AGAIN';
          submitBtn.style.borderColor = 'red';
        }
        setTimeout(() => {
          if (btnSpan) btnSpan.textContent = 'SUBMIT INQUIRY';
          submitBtn.disabled = false;
          submitBtn.style.borderColor = '';
        }, 3000);
      })
      .catch(error => {
        if (btnSpan) btnSpan.textContent = 'NETWORK ERROR';
        submitBtn.style.borderColor = 'red';
        setTimeout(() => {
          if (btnSpan) btnSpan.textContent = 'SUBMIT INQUIRY';
          submitBtn.disabled = false;
          submitBtn.style.borderColor = '';
        }, 3000);
      });
    });
  }

  // ---- AI Widget Logic ----
  const aiWidgetToggle = document.getElementById('aiWidgetToggle');
  const aiChatPanel = document.getElementById('aiChatPanel');
  const aiChatClose = document.getElementById('aiChatClose');
  const aiChatBody = document.getElementById('aiChatBody');
  const aiSuggestionsBtns = document.querySelectorAll('.ai-suggestion-btn');

  if (aiWidgetToggle && aiChatPanel && aiChatClose) {
    aiWidgetToggle.addEventListener('click', () => {
      aiChatPanel.classList.toggle('hidden');
    });
    aiChatClose.addEventListener('click', () => {
      aiChatPanel.classList.add('hidden');
    });

    const aiAnswers = {
      'projects': "I have built a Commercial Video Showreel, Kinetic Motion Typographies, and Full-Stack web platforms. Check the 'Selected Work' section!",
      'skills': "My core skills include React, Node.js, Python, Premiere Pro, After Effects, and DaVinci Resolve.",
      'contact': "You can reach me via the Contact section below, or email me directly at mukilanperiyasamy07@gmail.com."
    };

    aiSuggestionsBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const askKey = e.target.getAttribute('data-ask');
        const questionText = e.target.textContent;
        const answerText = aiAnswers[askKey];

        if (answerText) {
          const userMsg = document.createElement('div');
          userMsg.className = 'ai-message';
          userMsg.innerHTML = `<span class="msg-sender" style="color:var(--text-primary);">USER //</span> ${questionText}`;
          
          const botMsg = document.createElement('div');
          botMsg.className = 'ai-message bot-msg';
          botMsg.innerHTML = `<span class="msg-sender">SYSTEM //</span> ${answerText}`;

          const suggestionsContainer = document.getElementById('aiSuggestions');
          aiChatBody.insertBefore(userMsg, suggestionsContainer);
          aiChatBody.insertBefore(botMsg, suggestionsContainer);
          
          aiChatBody.scrollTop = aiChatBody.scrollHeight;

          // Scroll to the corresponding section smoothly
          const targetSection = document.getElementById(askKey);
          if (targetSection) {
            setTimeout(() => {
              targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 600); // Short delay before scrolling to let the user read
          }
        }
      });
    });
  }

})();
