const allQuestions = [
  { question: "What does AI stand for?", options: ["Artificial Intelligence", "Automated Interface", "Automatic Integration", "Analytical Innovation"], answer: "Artificial Intelligence" },
  { question: "Which of these is a type of AI?", options: ["Narrow AI", "Wide AI", "Macro AI", "Superb AI"], answer: "Narrow AI" },
  { question: "Which language is most commonly used in AI development?", options: ["Python", "Java", "C++", "HTML"], answer: "Python" },
  { question: "What is Machine Learning?", options: ["Machines learning to dance", "A subset of AI where machines learn from data", "Learning how to operate machines", "A type of hardware"], answer: "A subset of AI where machines learn from data" },
  { question: "Which of the following is a real AI chatbot?", options: ["AlphaChat", "NeuralPal", "ChatGPT", "BotMania"], answer: "ChatGPT" },
  { question: "What does NLP stand for?", options: ["Neural Link Processing", "Natural Language Processing", "Network Level Programming", "Normal Learning Protocol"], answer: "Natural Language Processing" },
  { question: "What is the Turing Test?", options: ["A math test", "A way to determine AI intelligence", "A code review process", "None of the above"], answer: "A way to determine AI intelligence" },
  { question: "Which AI model is used in self-driving cars?", options: ["CNN", "RNN", "Decision Trees", "Naive Bayes"], answer: "CNN" },
  { question: "Which company developed ChatGPT?", options: ["Google", "Meta", "OpenAI", "Amazon"], answer: "OpenAI" },
  { question: "What is supervised learning?", options: ["AI learning without data", "Learning from labeled data", "Learning through images", "Self learning"], answer: "Learning from labeled data" },
  { question: "What is reinforcement learning?", options: ["Learning via punishments and rewards", "Learning from images", "Unsupervised learning", "None"], answer: "Learning via punishments and rewards" },
  { question: "Which of the following is NOT an AI application?", options: ["Face detection", "Spam filtering", "WordPad", "Voice assistants"], answer: "WordPad" },
  { question: "What is overfitting in AI?", options: ["Model fits too well to training data", "Model performs badly", "Training fails", "Under-optimization"], answer: "Model fits too well to training data" },
  { question: "What is an artificial neural network inspired by?", options: ["Bones", "Blood", "Human brain", "Robots"], answer: "Human brain" },
  { question: "GANs are used for?", options: ["Generating fake data", "Sorting data", "Filtering emails", "Cleaning datasets"], answer: "Generating fake data" },
  { question: "Which one is a Python library for AI?", options: ["NumPy", "Pandas", "TensorFlow", "Bootstrap"], answer: "TensorFlow" },
  { question: "What is the full form of CNN in AI?", options: ["Convolutional Neural Network", "Central Neural Node", "Control Neural Network", "Computer Network Node"], answer: "Convolutional Neural Network" },
  { question: "Which is a pre-trained language model?", options: ["GPT-3", "Tensor", "Keras", "Vue"], answer: "GPT-3" },
  { question: "Which AI system beat humans at Go?", options: ["AlphaGo", "DeepMind", "TensorGo", "IBM Watson"], answer: "AlphaGo" },
  { question: "Which domain is most impacted by AI?", options: ["Finance", "Healthcare", "Education", "All of the above"], answer: "All of the above" },
  { question: "AI that mimics human thinking is?", options: ["Strong AI", "Narrow AI", "Weak AI", "Open AI"], answer: "Strong AI" },
  { question: "Which is an unsupervised learning algorithm?", options: ["K-Means", "Linear Regression", "Logistic Regression", "Decision Trees"], answer: "K-Means" },
  { question: "Voice assistants use which AI domain?", options: ["Robotics", "Vision", "NLP", "AR"], answer: "NLP" },
  { question: "What is backpropagation?", options: ["Error correction in neural networks", "Data transfer", "Image processing", "None"], answer: "Error correction in neural networks" },
  { question: "AI ethics focus on?", options: ["Privacy", "Bias", "Transparency", "All of the above"], answer: "All of the above" }
];

const QUIZ_DURATION = 600; // 10 minutes
let selectedQuestions = [];
let timerInterval;
let timeLeft = QUIZ_DURATION;
let quizStartTimestamp = 0;

// DOM Elements
const loginSection = document.getElementById('login');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');
const leaderboardSection = document.getElementById('leaderboard');

const uidInput = document.getElementById('uid');
const loginError = document.getElementById('loginError');
const submitError = document.getElementById('submitError'); // Create if needed in HTML
const quizForm = document.getElementById('quizForm');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('scoreDisplay');
const leaderboardList = document.getElementById('leaderboardList');

document.getElementById('startBtn').addEventListener('click', startQuiz);
document.getElementById('submitBtn').addEventListener('click', submitQuiz);
document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
document.getElementById('restartBtn').addEventListener('click', restart);
document.getElementById('restartFromLeaderboardBtn').addEventListener('click', restart);

function startQuiz() {
  const uid = uidInput.value.trim();

  // Check UID format: 6 digit number only
  if (!/^\d{6}$/.test(uid)) {
    loginError.textContent = "UID must be exactly 6 digits (numbers only).";
    return;
  }

  loginError.textContent = "";

  // Select 25 random questions or all if less than 25
  selectedQuestions = getRandomQuestions(allQuestions, Math.min(25, allQuestions.length));

  quizStartTimestamp = Date.now();
  timeLeft = QUIZ_DURATION;

  showQuiz();
  startTimer();

  localStorage.setItem('currentUID', uid);
}

function getRandomQuestions(arr, num) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function showQuiz() {
  loginSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  leaderboardSection.classList.add('hidden');
  quizSection.classList.remove('hidden');

  quizForm.innerHTML = "";

  selectedQuestions.forEach((q, idx) => {
    const questionDiv = document.createElement('div');

    let optionsHTML = q.options.map(option =>
      `<label>
        <input type="radio" name="q${idx}" value="${option}" required />
        ${option}
      </label>`
    ).join("");

    questionDiv.innerHTML = `<p><strong>${idx + 1}. ${q.question}</strong></p>${optionsHTML}`;
    quizForm.appendChild(questionDiv);
  });

  // Disable copy/paste
  disableCopyPaste(quizForm);
}

function disableCopyPaste(element) {
  element.addEventListener('copy', e => e.preventDefault());
  element.addEventListener('paste', e => e.preventDefault());
}

function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
  timerDisplay.textContent = `Time Left: ${minutes}:${formattedSeconds}`;
}

function submitQuiz() {
  clearInterval(timerInterval);

  const uid = localStorage.getItem('currentUID');
  if (!uid) {
    alert("No UID found. Please restart the quiz.");
    restart();
    return;
  }

  const formData = new FormData(quizForm);
  let score = 0;

  selectedQuestions.forEach((q, idx) => {
    const userAnswer = formData.get(`q${idx}`);
    if (userAnswer === q.answer) score++;
  });

  // Calculate elapsed time in seconds
  const elapsedTime = Math.round((Date.now() - quizStartTimestamp) / 1000);

  const savedResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
  const prevAttempt = savedResults[uid];

  // If previous attempt exists and time is less or equal, block update
  if (prevAttempt && prevAttempt.time <= elapsedTime) {
    alert(`You previously completed the quiz faster (${formatTime(prevAttempt.time)}). Your new time: ${formatTime(elapsedTime)}. Try again to beat your best time!`);
    restart();
    return;
  }

  // Save or update the score and time for this UID
  savedResults[uid] = { score, time: elapsedTime };
  localStorage.setItem('quizResults', JSON.stringify(savedResults));

  showResult(score, elapsedTime);
}

function showResult(score, time) {
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');
  leaderboardSection.classList.add('hidden');

  scoreDisplay.textContent = `${score} / ${selectedQuestions.length} (Time: ${formatTime(time)})`;
}

function showLeaderboard() {
  resultSection.classList.add('hidden');
  leaderboardSection.classList.remove('hidden');

  leaderboardList.innerHTML = "";

  const savedResults = JSON.parse(localStorage.getItem('quizResults') || '{}');
  const sortedEntries = Object.entries(savedResults)
    .sort((a, b) => {
      // Sort by score DESC, then time ASC (better score, then faster time)
      if (b[1].score !== a[1].score) {
        return b[1].score - a[1].score;
      }
      return a[1].time - b[1].time;
    })
    .slice(0, 10); // top 10

  if (sortedEntries.length === 0) {
    leaderboardList.innerHTML = "<li>No results yet.</li>";
    return;
  }

  sortedEntries.forEach(([uid, data]) => {
    const li = document.createElement('li');
    li.textContent = `UID: ${uid} — Score: ${data.score} / ${selectedQuestions.length} — Time: ${formatTime(data.time)}`;
    leaderboardList.appendChild(li);
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function restart() {
  clearInterval(timerInterval);

  localStorage.removeItem('currentUID');

  leaderboardSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  quizSection.classList.add('hidden');
  loginSection.classList.remove('hidden');

  uidInput.value = "";
  loginError.textContent = "";
  quizForm.innerHTML = "";
  timerDisplay.textContent = "Time Left: 10:00";
}