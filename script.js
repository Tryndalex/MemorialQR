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

  // Konfigurácia Firebase projektu
const firebaseConfig = {
  apiKey: "172160112509", // Nájdete v nastaveniach projektu vo Firebase Console
  authDomain: "memorial-qr-app.firebaseapp.com",
  databaseURL: "https://memorial-qr-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "memorial-qr-app",
  storageBucket: "memorial-qr-app.appspot.com",
  messagingSenderId: "172160112509",
  appId: "memorial-qr-app" // Nájdete v nastaveniach projektu vo Firebase Console
};

// Inicializácia Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const candleRef = database.ref('candleCounter');

// Získanie HTML elementov
const candleCountSpan = document.getElementById('candleCount');
const lightCandleBtn = document.getElementById('lightCandleBtn');

// 1. Načítanie a aktualizácia počtu sviečok v reálnom čase
candleRef.on('value', (snapshot) => {
  const count = snapshot.val() || 0;
  candleCountSpan.textContent = count;
});

// Zvýšenie počtu sviečok s obmedzením na 24 hodín
lightCandleBtn.addEventListener('click', () => {
  const lastLit = localStorage.getItem('lastLitCandle');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hodín v milisekundách

  // 1. Kontrola, či už uplynulo 24 hodín
  if (lastLit && (now - lastLit < twentyFourHours)) {
    const timeLeftMs = twentyFourHours - (now - lastLit);
    const hoursLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60));
    
    alert(`Sviečku ste už dnes zapálili. Ďalšiu môžete zapáliť o ${hoursLeft} hod.`);
    return;
  }

  // 2. Ak je všetko v poriadku, navýšime počítadlo v databáze
  candleRef.transaction((currentCount) => {
    return (currentCount || 0) + 1;
  }, (error, committed) => {
    if (committed) {
      // 3. Po úspešnom zápise uložíme aktuálny čas do zariadenia
      localStorage.setItem('lastLitCandle', now);
      alert("Sviečka bola úspešne zapálená. Ďakujeme.");
    } else if (error) {
      console.error("Chyba pri zápise:", error);
    }
  });
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
