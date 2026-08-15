/* ==========================================================================
   PRESENTATION SLIDE DECK ENGINE WITH VS CODE DARK+ SYNTAX HIGHLIGHTING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  // UI Elements
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const firstBtn = document.getElementById('first-btn');
  const lastBtn = document.getElementById('last-btn');
  const counterEl = document.getElementById('slide-counter');
  const progressBar = document.getElementById('progress-bar');
  
  const tocBtn = document.getElementById('toc-btn');
  const tocModal = document.getElementById('toc-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const tocContainer = document.getElementById('toc-container');
  const searchInput = document.getElementById('search-input');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const toastEl = document.getElementById('toast');

  // Helper to escape HTML characters
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Tokenizer Engine matching VS Code Dark+ Colors
  function highlightPythonCode(codeText) {
    const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|f"(?:\\.|[^"\\])*"|f'(?:\\.|[^'\\])*'|'''[\s\S]*?'''|"""[\s\S]*?""")|(#.*)|(\b(?:def|return|if|else|elif|for|in|while|break|continue|try|except|import|from|as|with|class|pass|and|or|not|is|yield|lambda)\b)|(\b(?:True|False|None)\b)|(\b(?:print|type|input|int|float|str|bool|len|range|sum|max|min|abs|round|open|enumerate|zip|dict|list|set|tuple|math|random|exp|sqrt|sin|cos|tan)\b)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_]\w*\b(?=\())|(\b[a-zA-Z_]\w*\b)/g;

    return codeText.replace(pattern, (match, str, comment, kw, literal, builtin, num, funcCall, ident) => {
      if (str) return `<span class="hl-string">${escapeHtml(str)}</span>`;
      if (comment) return `<span class="hl-comment">${escapeHtml(comment)}</span>`;
      if (kw) return `<span class="hl-keyword">${escapeHtml(kw)}</span>`;
      if (literal) return `<span class="hl-literal">${escapeHtml(literal)}</span>`;
      if (builtin) return `<span class="hl-builtin">${escapeHtml(builtin)}</span>`;
      if (num) return `<span class="hl-number">${escapeHtml(num)}</span>`;
      if (funcCall) return `<span class="hl-function">${escapeHtml(funcCall)}</span>`;
      if (ident) return `<span class="hl-variable">${escapeHtml(ident)}</span>`;
      return escapeHtml(match);
    });
  }

  function highlightBashCode(codeText) {
    const pattern = /(#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:sudo|apt-get|install|python3|venv|source|pip|activate|jupyter|notebook|conda|create)\b)|(\b-[a-zA-Z0-9_-]+\b)/g;

    return codeText.replace(pattern, (match, comment, str, cmd, flag) => {
      if (comment) return `<span class="hl-comment">${escapeHtml(comment)}</span>`;
      if (str) return `<span class="hl-string">${escapeHtml(str)}</span>`;
      if (cmd) return `<span class="hl-keyword">${escapeHtml(cmd)}</span>`;
      if (flag) return `<span class="hl-builtin">${escapeHtml(flag)}</span>`;
      return escapeHtml(match);
    });
  }

  // Clean output panel whitespace automatically
  function cleanOutputPanels() {
    document.querySelectorAll('.output-content').forEach(el => {
      const cleaned = el.textContent
        .split('\n')
        .map(line => line.trimStart())
        .join('\n')
        .trim();
      el.textContent = cleaned;
    });
  }

  // Perform Highlighting Once for All Code Blocks
  function initCodeHighlighting() {
    document.querySelectorAll('pre.code-block code').forEach((codeBlock) => {
      // 1. Capture clean raw text once before any DOM mutation
      const rawText = codeBlock.textContent;
      codeBlock.dataset.rawCode = rawText;

      // 2. Perform VS Code Dark+ Highlighting
      const isBash = codeBlock.classList.contains('language-bash');
      if (isBash) {
        codeBlock.innerHTML = highlightBashCode(rawText);
      } else {
        codeBlock.innerHTML = highlightPythonCode(rawText);
      }
    });
  }

  // Trigger KaTeX rendering (explicitly ignoring code blocks to prevent mangling)
  function renderMathFormulas() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
        throwOnError: false
      });
    }
  }

  // Initialize & Update Slide View
  function updateSlideView(newIndex) {
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= totalSlides) newIndex = totalSlides - 1;

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex && idx !== newIndex) {
        slide.classList.remove('active');
        if (newIndex > currentSlideIndex) {
          slide.classList.add('prev-exit');
        } else {
          slide.classList.remove('prev-exit');
        }
      } else if (idx === newIndex) {
        slide.classList.remove('prev-exit');
        slide.classList.add('active');
      } else {
        slide.classList.remove('active', 'prev-exit');
      }
    });

    currentSlideIndex = newIndex;

    // Update Counter & Progress
    if (counterEl) {
      counterEl.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;
    }

    if (progressBar) {
      const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    if (slides[currentSlideIndex]) {
      slides[currentSlideIndex].scrollTop = 0;
    }

    // Re-render math formulas on current slide
    renderMathFormulas();
  }

  // Nav Functions
  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      updateSlideView(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      updateSlideView(currentSlideIndex - 1);
    }
  }

  function goToFirst() {
    updateSlideView(0);
  }

  function goToLast() {
    updateSlideView(totalSlides - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (firstBtn) firstBtn.addEventListener('click', goToFirst);
  if (lastBtn) lastBtn.addEventListener('click', goToLast);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (document.activeElement === searchInput) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'Space':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToFirst();
        break;
      case 'End':
        e.preventDefault();
        goToLast();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        closeTocModal();
        break;
    }
  });

  // TOC Modal
  function generateTOC() {
    if (!tocContainer) return;
    tocContainer.innerHTML = '';

    slides.forEach((slide, idx) => {
      const tag = slide.querySelector('.slide-tag')?.textContent || `Chương ${idx + 1}`;
      const title = slide.querySelector('.slide-title')?.textContent || slide.querySelector('.hero-title')?.textContent || `Slide ${idx + 1}`;

      const tocItem = document.createElement('div');
      tocItem.className = 'toc-item';
      tocItem.dataset.slideIndex = idx;
      tocItem.innerHTML = `
        <span class="toc-num">Slide ${idx + 1} • ${tag}</span>
        <span class="toc-title">${title}</span>
      `;

      tocItem.addEventListener('click', () => {
        updateSlideView(idx);
        closeTocModal();
      });

      tocContainer.appendChild(tocItem);
    });
  }

  function openTocModal() {
    generateTOC();
    if (tocModal) tocModal.classList.add('active');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
  }

  function closeTocModal() {
    if (tocModal) tocModal.classList.remove('active');
  }

  if (tocBtn) tocBtn.addEventListener('click', openTocModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTocModal);
  if (tocModal) {
    tocModal.addEventListener('click', (e) => {
      if (e.target === tocModal) closeTocModal();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const items = tocContainer.querySelectorAll('.toc-item');
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        showToast('Không thể bật toàn màn hình');
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Toast Notification
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  // Code Copy & Output Toggle
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-copy-code')) {
      const codeContainer = e.target.closest('.code-container');
      const rawText = codeContainer.querySelector('code')?.dataset.rawCode || codeContainer.querySelector('code')?.innerText;
      if (rawText) {
        navigator.clipboard.writeText(rawText).then(() => {
          showToast('Đã sao chép đoạn mã!');
        }).catch(() => {
          showToast('Lỗi khi sao chép');
        });
      }
    }

    if (e.target.classList.contains('btn-run-code')) {
      const codeContainer = e.target.closest('.code-container');
      const outputPanel = codeContainer.querySelector('.output-panel');
      if (outputPanel) {
        if (outputPanel.style.display === 'none' || !outputPanel.style.display) {
          outputPanel.style.display = 'block';
          e.target.textContent = 'Ẩn Output';
        } else {
          outputPanel.style.display = 'none';
          e.target.textContent = 'Xem Output';
        }
      }
    }
  });

  // Touch Support
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
  }, false);

  // Initial Load Sequence
  cleanOutputPanels();   // Auto-trim output panel indentation
  initCodeHighlighting(); // Highlight code once on raw text
  updateSlideView(0);
  setTimeout(renderMathFormulas, 100);
});
