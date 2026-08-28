// 1. Vaša Firebase konfigurácia
const firebaseConfig = {
  apiKey: "VÁŠ_API_KEY", // <-- SEM doplňte váš skutočný API kľúč z Firebase Console
  authDomain: "memorial-qr-app.firebaseapp.com",
  databaseURL: "https://memorial-qr-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "memorial-qr-app",
  storageBucket: "memorial-qr-app.appspot.com",
  messagingSenderId: "172160112509",
  appId: "VÁŠ_APP_ID" // <-- SEM doplňte vaše skutočné App ID z Firebase Console
};

// 2. Inicializácia (bez importov!)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. Referencie na databázu
const candleRef = database.ref('candleCounter');
const commentsRef = database.ref('comments');

// 4. HTML Elementy z vášho vzor.html
const candleCountSpan = document.getElementById('candleCount');
const lightCandleBtn = document.getElementById('lightCandleBtn');
const tributeForm = document.getElementById('tributeForm');
const authorNameInput = document.getElementById('authorName');
const messageTextInput = document.getElementById('messageText');
const messagesList = document.getElementById('messagesList');

// --- POČÍTADLO SVIEČOK ---

// Načítanie počtu sviečok v reálnom čase
candleRef.on('value', (snapshot) => {
  const count = snapshot.val() || 0;
  candleCountSpan.textContent = count;
});

// Zapálenie sviečky s limitom 24 hodín na zariadenie
lightCandleBtn.addEventListener('click', () => {
  const lastLit = localStorage.getItem('lastLitCandle');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (lastLit && (now - lastLit < twentyFourHours)) {
    const timeLeftMs = twentyFourHours - (now - lastLit);
    const hoursLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60));
    alert(`Sviečku ste už dnes zapálili. Ďalšiu môžete zapáliť o ${hoursLeft} hod.`);
    return;
  }

  candleRef.transaction((currentCount) => {
    return (currentCount || 0) + 1;
  }, (error, committed) => {
    if (committed) {
      localStorage.setItem('lastLitCandle', now);
      alert("Sviečka bola úspešne zapálená. Ďakujeme.");
    }
  });
});

// --- KNIHA KONDOLENCIÍ (KOMENTÁRE) ---

// Odoslanie nového komentára do Firebase
tributeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newComment = {
    author: authorNameInput.value.trim(),
    body: messageTextInput.value.trim(),
    timestamp: Date.now(),
    dateString: new Date().toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  commentsRef.push(newComment)
    .then(() => {
      tributeForm.reset(); // Vyčistenie formulára
    })
    .catch((error) => {
      console.error("Chyba pri ukladaní:", error);
    });
});

// Načítanie komentárov v reálnom čase
commentsRef.on('value', (snapshot) => {
  messagesList.innerHTML = ''; // Vymaže statický vzorový komentár z HTML
  const comments = [];

  snapshot.forEach((childSnapshot) => {
    comments.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  // Zobrazenie od najnovšieho
  comments.reverse().forEach((comment) => {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <p class="message-author">${escapeHTML(comment.author)}</p>
      <p class="message-body">"${escapeHTML(comment.body)}"</p>
      <span class="message-date">${comment.dateString}</span>
    `;
    messagesList.appendChild(card);
  });
});

// Ochrana pred nebezpečným HTML kódom (XSS)
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

