const questionText = document.getElementById('question-text');
const optionBtns = document.querySelectorAll('.option-btn');
const feedbackText = document.getElementById('feedback-text');
const progressText = document.getElementById('progress-text');
const reviewModeBtn = document.getElementById('review-mode-btn');
const completionContainer = document.getElementById('completion-container');

let words = [];
let unseenIndices = [];
let incorrectIndices = [];
let currentQuestionIndex;
let isReviewMode = false;

// CSVファイルを読み込む
fetch('english_expressions_b1_words.csv')
    .then(response => response.text())
    .then(data => {
        words = data.trim().split('\n').slice(1).map(line => {
            const [english, japanese] = line.split(',');
            return { english: english.slice(1, -1), japanese: japanese.slice(1, -1) };
        });
        startQuiz();
    });

function startQuiz() {
    loadProgress();
    if (unseenIndices.length === 0 && incorrectIndices.length === 0) {
        unseenIndices = Array.from({ length: words.length }, (_, i) => i);
    }
    nextQuestion();
}

function saveProgress() {
    const progress = {
        unseenIndices,
        incorrectIndices,
        isReviewMode
    };
    document.cookie = `progress=${JSON.stringify(progress)};max-age=31536000`;
}

function loadProgress() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('progress='));
    if (cookie) {
        const progress = JSON.parse(cookie.split('=')[1]);
        unseenIndices = progress.unseenIndices;
        incorrectIndices = progress.incorrectIndices;
        isReviewMode = progress.isReviewMode;
    }
}

function nextQuestion() {
    saveProgress();
    feedbackText.textContent = '';
    if (isReviewMode) {
        if (incorrectIndices.length === 0) {
            completionContainer.style.display = 'block';
            return;
        }
        currentQuestionIndex = incorrectIndices.shift();
    } else {
        if (unseenIndices.length === 0) {
            reviewModeBtn.style.display = 'block';
            return;
        }
        const randomIndex = Math.floor(Math.random() * unseenIndices.length);
        currentQuestionIndex = unseenIndices.splice(randomIndex, 1)[0];
    }

    const currentWord = words[currentQuestionIndex];
    questionText.textContent = currentWord.english;

    const correctAnswer = currentWord.japanese;
    const options = [correctAnswer];
    while (options.length < 8) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (!options.includes(randomWord.japanese)) {
            options.push(randomWord.japanese);
        }
    }

    shuffleArray(options);

    optionBtns.forEach((btn, i) => {
        btn.textContent = options[i];
        btn.onclick = () => checkAnswer(options[i], correctAnswer);
    });

    updateProgress();
}

function checkAnswer(selectedAnswer, correctAnswer) {
    if (selectedAnswer === correctAnswer) {
        feedbackText.textContent = '正解！';
    } else {
        feedbackText.textContent = `不正解。正しい訳は「${correctAnswer}」です。`;
        if (!isReviewMode) {
            incorrectIndices.push(currentQuestionIndex);
        }
    }
    setTimeout(nextQuestion, 2000);
}

function updateProgress() {
    const total = isReviewMode ? incorrectIndices.length + 1 : words.length;
    const remaining = isReviewMode ? incorrectIndices.length : unseenIndices.length;
    progressText.textContent = `進捗状況: ${total - remaining} / ${total}`;
}

reviewModeBtn.addEventListener('click', () => {
    isReviewMode = true;
    reviewModeBtn.style.display = 'none';
    nextQuestion();
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
