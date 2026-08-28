document.addEventListener('DOMContentLoaded', () => {
  // Candle Lighting Interaction
  const candle = document.getElementById('candle');
  const lightBtn = document.getElementById('lightCandleBtn');
  const candleCountEl = document.getElementById('candleCount');
  
  let currentCount = 42;
  let isLit = false;

  lightBtn.addEventListener('click', () => {
    if (!isLit) {
      candle.classList.add('lit');
      currentCount++;
      candleCountEl.textContent = currentCount;
      lightBtn.textContent = 'Candle Lit';
      lightBtn.disabled = true;
      lightBtn.style.opacity = '0.7';
      isLit = true;
    }
  });

  // Guestbook Form Submission Handling
  const form = document.getElementById('tributeForm');
  const messagesList = document.getElementById('messagesList');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('authorName').value;
    const message = document.getElementById('messageText').value;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create New Message Element
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <p class="message-author">${escapeHTML(name)}</p>
      <p class="message-body">"${escapeHTML(message)}"</p>
      <span class="message-date">${currentDate}</span>
    `;

    // Prepend to display newest first
    messagesList.insertBefore(card, messagesList.firstChild);

    // Reset Form
    form.reset();
  });

  // Helper function to prevent XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
