const allQuestions = [
  { question: "What does AI stand for?", options: ["Artificial Intelligence", "Automated Interface", "Automatic Integration", "Analytical Innovation"], answer: "Artificial Intelligence" },
  { question: "Which of these is a type of AI?", options: ["Narrow AI", "Wide AI", "Macro AI", "Superb AI"], answer: "Narrow AI" },
  { question: "Which language is most commonly used in AI development?", options: ["Python", "Java", "C++", "HTML"], answer: "Python" },
  { question: "What is Machine Learning?", options: ["Machines learning to dance", "A subset of AI where machines learn from data", "Learning how to operate machines", "A type of hardware"], answer: "A subset of AI where machines learn from data" },
  { question: "Which of the following is a real AI chatbot?", options: ["AlphaChat", "NeuralPal", "ChatGPT", "BotMania"], answer: "ChatGPT" },
  { question: "What does NLP stand for?", options: ["Neural Link Processing", "Natural Language Processing", "Network Level Programming", "Normal Learning Protocol"], answer: "Natural Language Processing" },
  { question: "Which company developed GPT models?", options: ["Google", "OpenAI", "Facebook", "Amazon"], answer: "OpenAI" },
  { question: "What is 'training data' in AI?", options: ["Data used to teach AI models", "Data to train humans", "Random data", "A dataset to test AI"], answer: "Data used to teach AI models" },
  { question: "What is reinforcement learning?", options: ["Learning from rewards and punishments", "Learning by watching videos", "Learning via textbooks", "Random learning"], answer: "Learning from rewards and punishments" },
  { question: "Which of the following is NOT a machine learning algorithm?", options: ["Decision Trees", "Linear Regression", "Bubble Sort", "Neural Networks"], answer: "Bubble Sort" }
];

let timerInterval;
let timeLeft = 600; // 10 minutes in seconds

const loginSection = document.getElementById("loginLeaderboardSection");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const leaderboardSection = document.getElementById("leaderboard");

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const restartFromLeaderboardBtn = document.getElementById("restartFromLeaderboardBtn");

const uidInput = document.getElementById("uid");
const loginError = document.getElementById("loginError");
const timerDisplay = document.getElementById("timer");
const quizForm = document.getElementById("quizForm");
const scoreDisplay = document.getElementById("scoreDisplay");
const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardList = document.getElementById("leaderboardList");

let currentUID = null;

// Helper: format seconds to MM:SS
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// Load leaderboard from localStorage
function loadLeaderboard() {
  const data = localStorage.getItem("quizLeaderboard");
  return data ? JSON.parse(data) : [];
}

// Save leaderboard 
async function saveLeaderboard(entry) {
  try {
    const response = await fetch("https://quizapp-azgrh3d4fhddbeaz.westus2-01.azurewebsites.net/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error("Failed to save leaderboard entry.");
    }

    console.log("Saved to backend.");
  } catch (error) {
    console.error("Error saving to database:", error);
  }
}


// Check if UID already attempted quiz
function hasAttempted(uid) {
  const leaderboard = loadLeaderboard();
  return leaderboard.some(entry => entry.uid === uid);
}

// Render leaderboard table on the first screen
function renderLeaderboardPanel() {
  const leaderboard = loadLeaderboard();
  leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

  leaderboardBody.innerHTML = "";

  if (leaderboard.length === 0) {
    leaderboardBody.innerHTML = `<tr><td colspan="4">No entries yet.</td></tr>`;
    return;
  }

  leaderboard.forEach((entry, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.uid}</td>
      <td>${entry.score}</td>
      <td>${formatTime(entry.timeTaken)}</td>
    `;
    leaderboardBody.appendChild(tr);
  });
}

// Render leaderboard in leaderboard section (top 10)
function renderLeaderboardFull() {
  const leaderboard = loadLeaderboard();
  leaderboard.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

  leaderboardList.innerHTML = "";

  const top10 = leaderboard.slice(0, 10);

  if (top10.length === 0) {
    leaderboardList.innerHTML = `<tr><td colspan="4">No entries yet.</td></tr>`;
    return;
  }

  top10.forEach((entry, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.uid}</td>
      <td>${entry.score}</td>
      <td>${formatTime(entry.timeTaken)}</td>
    `;
    leaderboardList.appendChild(tr);
  });
}

// Show section by id, hide others
function showSection(section) {
  [loginSection, quizSection, resultSection, leaderboardSection].forEach(sec => {
    if (sec === section) sec.classList.remove("hidden");
    else sec.classList.add("hidden");
  });
}

// Start countdown timer
function startTimer() {
  timeLeft = 600;
  timerDisplay.textContent = `Time Left: ${formatTime(timeLeft)}`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${formatTime(timeLeft)}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

// Build quiz questions dynamically
function buildQuiz() {
  quizForm.innerHTML = "";
  allQuestions.forEach((q, i) => {
    const div = document.createElement("div");

    let optionsHTML = q.options.map(opt => `
      <label>
        <input type="radio" name="q${i}" value="${opt}" />
        ${opt}
      </label>
    `).join("");

    div.innerHTML = `<p>${i + 1}. ${q.question}</p>${optionsHTML}`;
    quizForm.appendChild(div);
  });
}

// Calculate score
function calculateScore() {
  let score = 0;
  allQuestions.forEach((q, i) => {
    const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
    if (selected && selected.value === q.answer) {
      score++;
    }
  });
  return score;
}

// Submit quiz
function submitQuiz() {
  clearInterval(timerInterval);
  const score = calculateScore();

  // Save result to leaderboard
  const leaderboard = loadLeaderboard();
  leaderboard.push({
    uid: currentUID,
    score,
    timeTaken: 600 - timeLeft,
    timestamp: Date.now()
  });
  saveLeaderboard(leaderboard);

  scoreDisplay.textContent = `${score} / ${allQuestions.length}`;

  showSection(resultSection);
}

// Validate UID
function validateUID(uid) {
  if (!/^\d{6}$/.test(uid)) {
    loginError.textContent = "UID must be exactly 6 digits.";
    return false;
  }
  if (hasAttempted(uid)) {
    loginError.textContent = "This UID has already taken the quiz.";
    return false;
  }
  loginError.textContent = "";
  return true;
}

// Event Listeners

startBtn.addEventListener("click", () => {
  const uid = uidInput.value.trim();
  if (!validateUID(uid)) {
    return;
  }
  currentUID = uid;
  buildQuiz();
  showSection(quizSection);
  startTimer();
});

submitBtn.addEventListener("click", () => {
  submitQuiz();
});

leaderboardBtn.addEventListener("click", () => {
  renderLeaderboardFull();
  showSection(leaderboardSection);
});

restartFromLeaderboardBtn.addEventListener("click", () => {
  uidInput.value = "";
  loginError.textContent = "";
  renderLeaderboardPanel();
  showSection(loginSection);
});

// On page load
window.addEventListener("load", () => {
  renderLeaderboardPanel();
  showSection(loginSection);
});

