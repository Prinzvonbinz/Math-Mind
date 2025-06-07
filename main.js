(() => {
  // --- Globals ---
  const PASSWORD_KEY = "mathmind_password";
  const STATS_KEY = "mathmind_stats";

  // State
  let password = "";
  let stats = {};
  let currentGame = null;

  // Utility
  function saveStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  function loadStats() {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      stats = JSON.parse(raw);
    } else {
      stats = {};
    }
  }

  function savePassword() {
    localStorage.setItem(PASSWORD_KEY, password);
  }
  function loadPassword() {
    const pass = localStorage.getItem(PASSWORD_KEY);
    if (pass) password = pass;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active");
  }

  // Update Stats Display
  function updateStatsDisplay() {
    const container = document.getElementById("stats-content");
    container.innerHTML = "";
    if (!stats || Object.keys(stats).length === 0) {
      container.textContent = "Keine Statistiken verfügbar.";
      return;
    }
    for (const [game, data] of Object.entries(stats)) {
      const div = document.createElement("div");
      div.style.marginBottom = "12px";
      div.innerHTML = `<strong>${game}</strong><br>` + Object.entries(data).map(([k,v])=> `${k}: ${v}`).join("<br>");
      container.appendChild(div);
    }
    document.getElementById("stats-password").textContent = password;
  }

  // --- Login Screen ---
  const loginScreen = document.getElementById("login-screen");
  const loginBtn = document.getElementById("login-btn");
  const passwordInput = document.getElementById("password-input");

  loginBtn.addEventListener("click", () => {
    const pass = passwordInput.value.trim();
    if (!pass) {
      alert("Bitte ein Passwort eingeben.");
      return;
    }
    password = pass;
    savePassword();
    loadStats();
    updateStatsDisplay();
    showScreen("main-menu");
  });

  // --- Main Menu ---
  const playBtn = document.getElementById("play-btn");
  const statsBtn = document.getElementById("stats-btn");

  playBtn.addEventListener("click", () => {
    showScreen("games-menu");
  });
  statsBtn.addEventListener("click", () => {
    updateStatsDisplay();
    showScreen("stats-screen");
  });

 // --- Games Menu ---
  document.querySelectorAll(".game-select").forEach(btn => {
    btn.addEventListener("click", () => {
      currentGame = btn.dataset.game;
      if (gameHandlers[currentGame]?.start) {
        gameHandlers[currentGame].start();
      }
      showScreen(`${currentGame}-screen`);
    });
  });

  document.getElementById("games-back-btn").addEventListener("click", () => {
    showScreen("main-menu");
  });

  document.getElementById("stats-back-btn").addEventListener("click", () => {
    showScreen("main-menu");
  });

  // --- Code Heist ---
  const chInput = document.getElementById("ch-input");
  const chSubmit = document.getElementById("ch-submit-btn");
  const chFeedback = document.getElementById("ch-feedback");
  const chHistory = document.getElementById("ch-history");
  let chTarget = "";

  function generateCode() {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join("");
  }

  chSubmit.addEventListener("click", () => {
    const guess = chInput.value.trim();
    if (!/^\d{5}$/.test(guess)) return alert("Bitte 5 Ziffern eingeben.");
    let feedback = "";
    for (let i = 0; i < 5; i++) {
      if (guess[i] === chTarget[i]) {
        feedback += "🟩";
      } else if (chTarget.includes(guess[i])) {
        feedback += "🟨";
      } else {
        feedback += "⬛";
      }
    }
    chHistory.textContent += `${guess} ➜ ${feedback}\n`;
    chInput.value = "";
    if (guess === chTarget) {
      chFeedback.textContent = "✅ Entschärft!";
      updateStats("Code Heist", { gewonnen: "Ja" });
    } else if (chHistory.textContent.split("\n").filter(x => x).length >= 6) {
      chFeedback.textContent = `❌ Gescheitert! Code war: ${chTarget}`;
      updateStats("Code Heist", { gewonnen: "Nein" });
    }
  });

  document.getElementById("ch-back-btn").addEventListener("click", () => {
    showScreen("games-menu");
  });

  // --- Guess the Number ---
  const gnInput = document.getElementById("gn-input");
  const gnSubmit = document.getElementById("gn-submit-btn");
  const gnFeedback = document.getElementById("gn-feedback");
  const gnAttempts = document.getElementById("gn-attempts");
  let gnTarget = 0;
  let gnCount = 0;

  gnSubmit.addEventListener("click", () => {
    const guess = Number(gnInput.value);
    if (guess < 1 || guess > 100) return;
    gnCount++;
    if (guess < gnTarget) {
      gnFeedback.textContent = "Zu niedrig!";
    } else if (guess > gnTarget) {
      gnFeedback.textContent = "Zu hoch!";
    } else {
      gnFeedback.textContent = `✅ Richtig in ${gnCount} Versuchen!`;
      updateStats("Guess the Number", { Versuche: gnCount });
    }
    gnAttempts.textContent = `Versuche: ${gnCount}`;
  });

  document.getElementById("gn-back-btn").addEventListener("click", () => {
    showScreen("games-menu");
  });

  // --- Quick Calc ---
  const qcQuestion = document.getElementById("qc-question");
  const qcInput = document.getElementById("qc-input");
  const qcSubmit = document.getElementById("qc-submit-btn");
  const qcFeedback = document.getElementById("qc-feedback");
  const qcScore = document.getElementById("qc-score");
  let qcCorrect = 0;
  let qcStartTime = 0;
  let qcA = 0, qcB = 0;

  function nextQuickCalc() {
    qcA = Math.floor(Math.random() * 10 + 1);
    qcB = Math.floor(Math.random() * 10 + 1);
    qcQuestion.textContent = `${qcA} + ${qcB} = ?`;
    qcInput.value = "";
    qcInput.focus();
    qcStartTime = Date.now();
  }

  qcSubmit.addEventListener("click", () => {
    const answer = Number(qcInput.value);
    if (answer === qcA + qcB) {
      const time = (Date.now() - qcStartTime) / 1000;
      qcFeedback.textContent = `✅ Korrekt in ${time.toFixed(2)}s`;
      qcCorrect++;
      updateStats("Quick Calc", { Punkte: qcCorrect });
    } else {
      qcFeedback.textContent = "❌ Falsch!";
    }
    qcScore.textContent = `Punkte: ${qcCorrect}`;
    nextQuickCalc();
  });

  document.getElementById("qc-back-btn").addEventListener("click", () => {
    showScreen("games-menu");
  });

  // --- Number Sequence ---
  const nsSequence = document.getElementById("ns-sequence");
  const nsInput = document.getElementById("ns-input");
  const nsSubmit = document.getElementById("ns-submit-btn");
  const nsFeedback = document.getElementById("ns-feedback");
  const nsScore = document.getElementById("ns-score");
  let nsCorrect = 0;
  let nsNext = 0;

  function nextSequence() {
    const start = Math.floor(Math.random() * 10);
    const step = Math.floor(Math.random() * 5) + 1;
    const hideIndex = 3;
    const sequence = Array.from({ length: 5 }, (_, i) => start + i * step);
    nsNext = sequence[hideIndex];
    const display = sequence.map((n, i) => i === hideIndex ? "?" : n).join(", ");
    nsSequence.textContent = display;
  }

  nsSubmit.addEventListener("click", () => {
    const guess = Number(nsInput.value);
    if (guess === nsNext) {
      nsFeedback.textContent = "✅ Korrekt!";
      nsCorrect++;
      updateStats("Number Sequence", { Punkte: nsCorrect });
    } else {
      nsFeedback.textContent = `❌ Falsch! Richtige Antwort: ${nsNext}`;
    }
    nsScore.textContent = `Punkte: ${nsCorrect}`;
    nextSequence();
    nsInput.value = "";
  });

  document.getElementById("ns-back-btn").addEventListener("click", () => {
    showScreen("games-menu");
  });

  // --- Fastest Finger ---
  const ffClickBtn = document.getElementById("ff-click-btn");
  const ffFeedback = document.getElementById("ff-feedback");
  const ffBestTime = document.getElementById("ff-best-time");
  let ffStart = 0;
  let ffBest = null;

  ffClickBtn.addEventListener("click", () => {
    const now = performance.now();
    if (!ffStart) {
      ffClickBtn.textContent = "Warte...";
      setTimeout(() => {
        ffStart = performance.now();
        ffClickBtn.textContent = "JETZT!";
      }, Math.random() * 2000 + 1000);
    } else {
      const reaction = now - ffStart;
      ffFeedback.textContent = `⏱️ Reaktionszeit: ${reaction.toFixed(0)} ms`;
      if (!ffBest || reaction < ffBest) {
        ffBest = reaction;
        updateStats("Fastest Finger", { "Beste Zeit (ms)": Math.round(ffBest) });
      }
      ffBestTime.textContent = `Beste Zeit: ${Math.round(ffBest)} ms`;
      ffStart = 0;
      ffClickBtn.textContent = "Klick mich!";
    }
  });

  document.getElementById("ff-back-btn").addEventListener("click", () => {
    showScreen("games-menu");
  });

  // --- Game Init ---
  const gameHandlers = {
    codeHeist: {
      start() {
        chTarget = generateCode();
        chInput.value = "";
        chFeedback.textContent = "";
        chHistory.textContent = "";
      }
    },
    guessNumber: {
      start() {
        gnTarget = Math.floor(Math.random() * 100) + 1;
        gnCount = 0;
        gnFeedback.textContent = "";
        gnAttempts.textContent = "";
        gnInput.value = "";
      }
    },
    quickCalc: {
      start() {
        qcCorrect = 0;
        qcScore.textContent = "";
        qcFeedback.textContent = "";
        nextQuickCalc();
      }
    },
    numberSequence: {
      start() {
        nsCorrect = 0;
        nsScore.textContent = "";
        nsFeedback.textContent = "";
        nextSequence();
      }
    },
    fastestFinger: {
      start() {
        ffStart = 0;
        ffFeedback.textContent = "";
        ffClickBtn.textContent = "Klick mich!";
      }
    }
  };

  // --- Init ---
  loadPassword();
  if (password) {
    loadStats();
    updateStatsDisplay();
    showScreen("main-menu");
  }

  function updateStats(game, updates) {
    if (!stats[game]) stats[game] = {};
    for (const [k, v] of Object.entries(updates)) {
      stats[game][k] = v;
    }
    saveStats();
  }

})();
