let questions = [];
let currentIndex = 0 ;
let timerInterval = null ;
let timeLeft = 15 ;
let score = 0 ;
let correctCount = 0 ;
let totalTime = 0;
let currentDiff = 'easy' ; 
let lastPlayedDiff = 'easy';
function afficherScreen(name){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    window.scrollTo(0, 0);
    if (name === 'ranking') afficherClassement();
}
function theme(){
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    if(current == 'dark'){
        html.setAttribute('data-theme','light');
    }else{
        html.setAttribute('data-theme','dark');
    }
}
function sectionCategories(){
    afficherScreen('home');
    setTimeout(() => {
        document.getElementById('cats-section').scrollIntoView({ behavior: 'smooth' });
    },100);
}
function allerVersDebut() {
    afficherScreen('home');
    setTimeout(() => {
        document.getElementById('start-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const pseudo = document.getElementById('pseudo-input').value.trim();
    if (pseudo !== '') {
        commencerQuiz();
    }
}
async function commencerQuiz(){
    const pseudo = document.getElementById("pseudo-input").value;
    const categorie = document.getElementById("category-select").value;
    if(pseudo===''){
        alert('Entre ton pseudo !');
        return;
    }
    questions =[];
    currentIndex = 0; 
    score = 0; 
    correctCount = 0;
    totalTime = 0;
    currentDiff = 'easy';
    lastPlayedDiff = 'easy';
    afficherScreen('quiz');
    await chargerQuestion();
}
function selectionnerCategorie(val) {
    document.getElementById('category-select').value = val;
    allerVersDebut();
}
async function chargerQuestion() {
    if (questions[currentIndex]) {
        afficherQuestion();
        return;
    }
    const categorie = document.getElementById("category-select").value;
    const url = `https://opentdb.com/api.php?amount=5&category=${categorie}&difficulty=${currentDiff}&type=multiple`;
    try {
        const reponse = await fetch(url);
        const data = await reponse.json();

        if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            if (data.response_code === 5) {
                afficherErreurAPI('Trop de requêtes envoyées à l\'API. Patiente quelques secondes...');
                setTimeout(() => chargerQuestion(), 3000);
                return;
            }
            currentDiff = 'easy';
            await chargerQuestion();
            return;
        }
        data.results.forEach((q, i) => {
            if (!questions[currentIndex + i]) {
                questions[currentIndex + i] = {
                    ...q,
                    question: decodeHtml(q.question),
                    correct_answer: decodeHtml(q.correct_answer),
                    incorrect_answers: q.incorrect_answers.map(decodeHtml)
                };
            }
        });
        afficherQuestion();
    } catch (e) {
        afficherErreurAPI('Erreur de chargement. Vérifie ta connexion.');
    }
}
function afficherErreurAPI(message) {
    let banniere = document.getElementById('api-error-banner');
    if (!banniere) {
        banniere = document.createElement('div');
        banniere.id = 'api-error-banner';
        banniere.className = 'api-error-banner';
        document.getElementById('screen-quiz').prepend(banniere);
    }
    banniere.textContent = message;
    banniere.classList.add('visible');
    setTimeout(() => banniere.classList.remove('visible'), 4000);
}
function afficherQuestion() {
    const q = questions[currentIndex];

    document.getElementById('question-current').textContent = currentIndex + 1;
    document.getElementById('progress-bar').style.width = ((currentIndex + 1) / 10 * 100) + '%';
    document.getElementById('question-text').textContent = q.question;

    const feedbackZone = document.getElementById('feedback-zone');
    if (feedbackZone) {
        feedbackZone.textContent = '';
        feedbackZone.className = 'feedback-zone';
    }

    const reponses = shuffle([...q.incorrect_answers, q.correct_answer]);
    const container = document.getElementById('answers-container');
    container.innerHTML = '';
    reponses.forEach(reponse => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = reponse;
        btn.addEventListener('click', () => verifierReponse(reponse));
        container.appendChild(btn);
    });
    startTimer();
}
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function startTimer() {
    timeLeft = 15;
    document.getElementById('timer-count').textContent = timeLeft;
    const timerCircle = document.getElementById('timer-circle-fill');
    timerCircle.classList.remove('timer-urgent');
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-count').textContent = timeLeft;
        
        const pct = timeLeft / 15;
        timerCircle.style.strokeDashoffset = 201 - (201 * pct);

        if (timeLeft <= 5 && timeLeft > 0) {
            timerCircle.classList.add('timer-urgent');
        } else {
            timerCircle.classList.remove('timer-urgent');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            verifierReponse(null); 
        }
    }, 1000);
}

function verifierReponse(reponseChoisie) {
    clearInterval(timerInterval);
    const q = questions[currentIndex];
    const boutons = document.querySelectorAll('.answer-btn');
    boutons.forEach(btn => btn.disabled = true);
    boutons.forEach(btn => {
        const texte = btn.textContent;
        if (texte === q.correct_answer) {
            btn.classList.add('correct');
        } else if (texte === reponseChoisie) {
            btn.classList.add('wrong');
        }
    });

    const estCorrect = reponseChoisie === q.correct_answer;
    const feedbackZone = document.getElementById('feedback-zone');

    if (estCorrect) {
        const bonus = timeLeft * 10;
        score += 100 + bonus;
        correctCount++;
        document.getElementById('current-score').textContent = score;
        if (feedbackZone) {
            feedbackZone.textContent = `Bonne réponse ! +${100 + bonus} points`;
            feedbackZone.className = 'feedback-zone feedback-correct';
        }
    } else {
        if (feedbackZone) {
            feedbackZone.textContent = reponseChoisie === null
                ? `Temps écoulé ! La bonne réponse était : ${q.correct_answer}`
                : `Dommage ! La bonne réponse était : ${q.correct_answer}`;
            feedbackZone.className = 'feedback-zone feedback-wrong';
        }
    }

    totalTime += (15 - timeLeft);
    lastPlayedDiff = currentDiff;
    adapterDifficulte();

    setTimeout(async () => {
    currentIndex++;
    if (currentIndex < 10) {
        await chargerQuestion();
    } else {
        finirQuiz();
    }
}, 1500);
}
function adapterDifficulte() {
    const taux = correctCount / (currentIndex + 1);
    if (taux >= 0.75 && currentDiff === 'easy') {
        currentDiff = 'medium';
    } else if (taux >= 0.75 && currentDiff === 'medium') {
        currentDiff = 'hard';
    } else if (taux <= 0.40 && currentDiff === 'hard') {
        currentDiff = 'medium';
    } else if (taux <= 0.40 && currentDiff === 'medium') {
        currentDiff = 'easy';
    }
    const badge = document.getElementById('difficulty-badge');
    const labels = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };
    const classes = { easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard' };
    badge.textContent = labels[currentDiff];
    badge.className = 'difficulty-badge ' + classes[currentDiff];
}
function finirQuiz() {
    clearInterval(timerInterval);
    console.log('DEBUG finirQuiz -> totalTime:', totalTime, '| questions.length:', questions.length, '| correctCount:', correctCount, '| currentIndex:', currentIndex);
    sauvegarderScore();
    afficherResult();
    afficherScreen('result');
}
function afficherResult() {
    const avg = Math.round(totalTime / 10);
    const pct = correctCount / 10;
    let emoji, titre, sous;
    if (pct >= 0.8) {
        emoji = `<i data-lucide="trophy"    style="color:#FFD700; width:64px; height:64px;"></i>`;
        titre = 'Excellent !';
        sous  = 'Tu maîtrises le sujet !';
    } else if (pct >= 0.5) {
        emoji = `<i data-lucide="thumbs-up" style="color:#4ADE80; width:64px; height:64px;"></i>`;
        titre = 'Bien joué !';
        sous  = 'Continue comme ça !';
    } 
    else {
        emoji = `<i data-lucide="dumbbell"  style="color:#FB923C; width:64px; height:64px;"></i>`;
        titre = 'Pas mal !';
        sous  = 'Entraîne-toi encore !';
    }
    lucide.createIcons();
    document.getElementById('result-emoji').innerHTML = emoji;
    document.getElementById('result-title').innerHTML = titre;
    document.getElementById('result-subtitle').innerHTML = sous;
    document.getElementById('stat-score').innerHTML = score;
    document.getElementById('stat-correct').innerHTML = correctCount + '/10';
    const labels = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };
    document.getElementById('stat-level').innerHTML = labels[lastPlayedDiff];
    document.getElementById('stat-time').innerHTML = avg + 's';
}
function refaireQuiz() {
    afficherScreen('home');
}
function partageResult() {
    const pseudo = document.getElementById('pseudo-input').value;
    const texte = ` ${pseudo} vient de scorer ${score} pts sur QuizAdaptif ! (${correctCount}/10 bonnes réponses)`;
    navigator.clipboard.writeText(texte);
    alert('Résultat copié ! Tu peux le coller où tu veux ');
}
function sauvegarderScore() {
    const pseudo = document.getElementById('pseudo-input').value;
    const entry = {pseudo: pseudo,score: score,correct: correctCount,diff: lastPlayedDiff,date: Date.now()};
    const scores = chargerScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const top20 = scores.slice(0, 20);
    localStorage.setItem('quizadaptif_scores', JSON.stringify(top20));
    fetch('scores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pseudo, score,
            correct: correctCount,
            difficulte: lastPlayedDiff,
            categorie: parseInt(document.getElementById('category-select').value)
        })  
    }).catch(() => {
        afficherToastErreurSauvegarde();
    });
}
function afficherToastErreurSauvegarde() {
    let toast = document.getElementById('save-error-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'save-error-toast';
        toast.className = 'save-error-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = "Ton score n'a pas pu être enregistré sur le classement global (serveur inaccessible). Il reste sauvegardé localement.";
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 5000);
}
function chargerScores() {
    try {
        return JSON.parse(localStorage.getItem('quizadaptif_scores')) || [];
    } catch {
        return [];
    }
}
function renderClassement(scores) {
    const podium = document.getElementById('podium-container');
    const liste  = document.getElementById('ranking-list');
    const vide   = document.getElementById('ranking-empty');

    podium.innerHTML = '';
    liste.innerHTML  = '';

    if (scores.length === 0) { vide.classList.remove('hidden'); return; }
    vide.classList.add('hidden');

    const medals = [
        `<i data-lucide="trophy" style="color:#FFD700; width:28px; height:28px;"></i>`,
        `<i data-lucide="award"  style="color:#C0C0C0; width:28px; height:28px;"></i>`,
        `<i data-lucide="star"   style="color:#CD7F32; width:28px; height:28px;"></i>`
    ];
    const ordre = [1, 0, 2];
    ordre.forEach(i => {
        if (!scores[i]) return;
        const slot = document.createElement('div');
        slot.className = `podium-slot p${i + 1}`;
        slot.innerHTML = `
            <div class="podium-avatar">${scores[i].pseudo.charAt(0).toUpperCase()}</div>
            <div class="podium-name">${scores[i].pseudo}</div>
            <div class="podium-block"><span class="medal">${medals[i]}</span></div>
            <div style="font-family:'Space Mono',monospace; font-size:0.85rem; color:var(--primary); font-weight:700;">
                ${scores[i].score} pts
            </div>
        `;
        podium.appendChild(slot);
    });
    lucide.createIcons();

    scores.slice(3).forEach((s, i) => {
        const li = document.createElement('li');
        li.className = 'ranking-item';
        li.innerHTML = `
            <div class="rank-num">${i + 4}</div>
            <div class="rank-pseudo">${s.pseudo}</div>
            <div class="rank-score">${s.score} pts</div>
        `;
        liste.appendChild(li);
    });
}
async function afficherClassement() {
    const local = chargerScores();
    renderClassement(local);

    try {
        const res = await fetch('scores.php');
        if (!res.ok) {
            afficherToastErreurSauvegarde();
            return;
        }
        const global = await res.json();
        const normalise = global.map(s => ({
            pseudo: s.pseudo,
            score: s.score,
            correct: s.correct,
            diff: s.difficulte
        }));
        renderClassement(normalise);
    } catch (e) {
        afficherToastErreurSauvegarde();
    }
}