/* ======================================================
   MUKILAN PORTFOLIO — app.js
   Matrix Decrypt Title Effect, Nav Rail & Interactions
   ====================================================== */

(function () {
  'use strict';

  // ---- Matrix Decrypt & Hover Scramble Effect for Giant Title ----
  const titleBlocks = document.querySelectorAll('.title-block');
  const CHARACTERS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$@%&*';

  function getRandomChar() {
    return CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }

  // Initial Decrypt Animation on Page Load
  function initialDecryptAnimation() {
    titleBlocks.forEach((block, index) => {
      const targetChar  = block.getAttribute('data-char') || block.textContent.trim();
      let shuffleCount  = 0;
      const maxShuffles = 10 + index * 5; // Staggered unlock

      const interval = setInterval(() => {
        block.textContent = getRandomChar();
        shuffleCount++;

        if (shuffleCount >= maxShuffles) {
          clearInterval(interval);
          block.textContent = targetChar;
        }
      }, 50);
    });
  }

  // Hover Scramble for Individual Letter Blocks
  titleBlocks.forEach(block => {
    let hoverInterval = null;

    block.addEventListener('mouseenter', () => {
      const targetChar = block.getAttribute('data-char') || block.textContent.trim();
      let count = 0;

      if (hoverInterval) clearInterval(hoverInterval);

      hoverInterval = setInterval(() => {
        block.textContent = getRandomChar();
        count++;

        if (count >= 8) {
          clearInterval(hoverInterval);
          block.textContent = targetChar;
        }
      }, 45);
    });
  });

  // Trigger initial decrypt on load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initialDecryptAnimation, 300);
  });
  // Fallback trigger if already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initialDecryptAnimation, 300);
  }

  // ---- Dark / Light Theme Toggle ----
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl      = document.documentElement;
  const themeLabel  = themeToggle ? themeToggle.querySelector('.theme-label') : null;

  // Initialize saved theme or system preference
  const savedTheme = localStorage.getItem('atomq_theme');
  if (savedTheme) {
    if (savedTheme === 'light') {
      htmlEl.classList.remove('dark');
      htmlEl.classList.add('light');
      if (themeLabel) themeLabel.textContent = 'DARK';
    } else {
      htmlEl.classList.remove('light');
      htmlEl.classList.add('dark');
      if (themeLabel) themeLabel.textContent = 'LIGHT';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = htmlEl.classList.contains('light');
      if (isLight) {
        htmlEl.classList.remove('light');
        htmlEl.classList.add('dark');
        localStorage.setItem('atomq_theme', 'dark');
        if (themeLabel) themeLabel.textContent = 'LIGHT';
      } else {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
        localStorage.setItem('atomq_theme', 'light');
        if (themeLabel) themeLabel.textContent = 'DARK';
      }
    });
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
