import { auth, db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js"

const questions = [
  {
    eyebrow: "Find Your Pen Pal",
    question: "Are you more energized by being alone or with others?",
    options: ["Alone", "With others", "Depends on my mood"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "How do you like to spend your weekends?",
    options: ["Hang out with friends", "Stay at home", "A mix of both"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "What’s your favorite hobby?",
    options: ["Creative arts", "Sports or just being outdoors", "Gaming"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "What kind of pet do you prefer?",
    options: ["Dog", "Cat", "Other"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "When making decisions, you rely more on…",
    options: ["Logic", "Emotions", "A mix of both"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "What is your favorite vacation spot?",
    options: ["The beach", "The city", "Nature or Mountains"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "How would you describe your communication style?",
    options: ["I love long letters", "Short notes are fine", "It depends on my mood"]
  },
  {
    eyebrow: "Find Your Pen Pal",
    question: "How often would you like to exchange letters?",
    options: ["Weekly", "Monthly", "Whenever inspiration strikes!"]
  }
];

const colorMap = [
    ["blue", "yellow", "red"],
    ["red", "blue", "yellow"],
    ["yellow", "red", "blue"],
    ["red", "blue", "yellow"],
    ["blue", "red", "yellow"],
    ["yellow", "red", "blue"],
    ["red", "blue", "yellow"],
    ["red", "blue", "yellow"]
];

let current = 0;
let answers = Array(questions.length).fill(null);
let isAnimating = false;

const viewport = document.getElementById("quizViewport");
const progressFill = document.getElementById("progressFill");

const optionHTML = (opt, i, saved) => `
  <button class="option-btn ${saved === i ? "selected" : ""}" data-idx="${i}">
    <span class="option-num">0${i + 1}</span>
    <span>${opt}</span>
  </button>
`;

function findColor() {
  const counts = {};

  answers.forEach((answer, i) => {
    const color = colorMap[i][answer];
    counts[color] = (counts[color] || 0) + 1;
  });

  //look for the most repeated color and return
  let maxColor = null;
  let maxCount = 0;

  for (const color in counts) {
    if (counts[color] > maxCount) {
      maxColor = color;
      maxCount = counts[color];
    }
  }

  return maxColor;
}

async function saveUserColor(color){
  const user = auth.currentUser;
  
  if(!user){
    console.error("No user logged in");
    return;
  }

  try{
    //save the users info including answers - create new doc if it doesn't exist
    await setDoc(doc(db, "users", user.uid),{
      color: color,
      answers: answers,
      email: user.email,
      createdAt: new Date()
    }, {merge:true});
  } catch(error){
    console.error("error saving to database (firestore)", error);
  }
}

function buildStage(index) {
  const { eyebrow, question, options } = questions[index];
  const saved = answers[index];

  const stage = document.createElement("div");
  stage.className = "quiz-stage";

  stage.innerHTML = `
    <p class="eyebrow">${eyebrow} · ${index + 1} / ${questions.length}</p>
    <h2 class="question-title">${question}</h2>

    <div class="options">
      ${options.map((o, i) => optionHTML(o, i, saved)).join("")}
    </div>

    <button class="btn-next ${saved !== null ? "active" : ""}" id="nextBtn">
      ${index < questions.length - 1 ? "Next Question" : "See My Matches"}
    </button>
  `;

  return stage;
}

function buildResultStage() {
  const color = findColor();
  
  const stage = document.createElement("div");
  stage.className = "quiz-stage";
  

  stage.innerHTML = `
    <div class="result-screen">
      <p class="eyebrow">Your results are in...</p>
      <h2>We've identitifed your group assignment! You are in the <span class="color-${color}">${color}</span> group!</h2>
      <p>Based on your answers, blah blah blah.</p>
      <button class="btn-restart">Start Over</button>
    </div>
  `;

  saveUserColor(color);
  return stage;
}

function navigate(to, dir) {
  if (isAnimating) return;
  isAnimating = true;

  const oldStage = viewport.querySelector(".quiz-stage");
  const newStage = to === questions.length ? buildResultStage() : buildStage(to);

  const enter = dir === "forward" ? "enter-right" : "enter-left";
  const exit = dir === "forward" ? "exit-left" : "exit-right";

  newStage.classList.add(enter);
  viewport.appendChild(newStage);

  oldStage?.classList.add(exit);
  oldStage?.addEventListener("animationend", () => oldStage.remove(), { once: true });

  newStage.addEventListener("animationend", () => {
    newStage.classList.remove(enter);
    isAnimating = false;
  }, { once: true });

  current = to;
  updateProgress();
}

function updateProgress() {
  const pct = current >= questions.length
    ? 100
    : ((current + 1) / questions.length) * 100;

  progressFill.style.width = pct + "%";
}

function restartQuiz() {
  answers.fill(null);
  navigate(0, "back");
}

viewport.addEventListener("click", e => {

  const option = e.target.closest(".option-btn");
  if (option) {
    const stage = option.closest(".quiz-stage");

    stage.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
    option.classList.add("selected");

    answers[current] = +option.dataset.idx;
    stage.querySelector(".btn-next").classList.add("active");
  }

  if (e.target.closest(".btn-next")) {
    if (answers[current] === null) return;

    if (current < questions.length - 1) {
      navigate(current + 1, "forward");
    } 
    else {
      navigate(questions.length, "forward");
    }
  }

  if (e.target.closest(".btn-restart")) {
    restartQuiz();
  }

});

const first = buildStage(0);
first.classList.add("enter-right");
viewport.appendChild(first);

first.addEventListener("animationend", () =>
  first.classList.remove("enter-right"), { once: true }
);

updateProgress();

document.getElementById("modeToggle").addEventListener("change", e => {
  document.documentElement.style.setProperty(
    "--parchement-paper",
    e.target.checked ? "#f0ece6" : "#fdf3e7"
  );
});

