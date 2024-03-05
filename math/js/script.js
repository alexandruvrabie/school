let correctAnswer; // Răspunsul corect al exercițiului curent
let attempts = 0; // Numărul de încercări pentru exercițiul curent
let bonusTracker = {adunare: 0, scadere: 0}; // Urmărește progresul pentru bonusuri specifice
let numbersUsed = new Set(); // Pentru a urmări numerele utilizate în exerciții
let exerciseCount = 0;
let consecutiveCorrect = 0; // Contor pentru exerciții rezolvate corect consecutiv
let correctConsecutive = 0; // Pentru bonusul "Maestru al Preciziei"
let speedChallengeTimer; // Cronometru pentru provocarea de viteză
let speedChallengeStart; // Timpul de start al provocării curente
let exercisesSolvedInChallenge = 0; // Numărul de exerciții rezolvate în provocarea curentă

function generateExercise() {
    let num1 = Math.floor(Math.random() * 20) + 1;
    let num2 = Math.floor(Math.random() * 20) + 1;
    let exerciseType = Math.random() > 0.5 ? "addition" : "subtraction";
    if (exerciseType === "subtraction") {
        if (num1 < num2) {
            [num1, num2] = [num2, num1]; // Asigură că num1 este mereu mai mare sau egal cu num2
        }
        correctAnswer = num1 - num2;
    } else {
        correctAnswer = num1 + num2;
        if (correctAnswer > 20) { // Regenerare numere dacă suma depășește 20
            generateExercise();
            return;
        }
    }
    document.getElementById("exercise").innerHTML = `${num1} ${exerciseType === "addition" ? "+" : "-"} ${num2} = `;
    document.getElementById("answer").value = '';
    document.getElementById("answer").classList.remove("incorrect");
    document.getElementById("answer").disabled = false;
    document.getElementById("answer").focus();
    document.getElementById("message").textContent = '';
    attempts = 0; // Resetăm încercările pentru noul exercițiu
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value, 10);
    const exerciseText = document.getElementById("exercise").textContent;
    const exerciseType = exerciseText.includes("+") ? "adunare" : "scadere";
    if (isNaN(userAnswer)) {
        document.getElementById("message").textContent = "Te rog să introduci un răspuns valid.";
        return;
    }
    attempts++; // Incrementăm numărul de încercări

    if (userAnswer === correctAnswer) {
        bonusTracker[exerciseType]++;
        consecutiveCorrect++;
        exerciseCount++;
        incrementExercisesSolvedInChallenge();
        document.getElementById("exerciseCount").textContent = exerciseCount;
        updateNumbersUsed(document.getElementById("exercise").textContent);
        document.getElementById("message").textContent = "Corect! Felicitări.";
        addExerciseToHistory(true); // Adaugă exercițiul cu indicarea că este corect
        checkAndDisplayBonus();
        generateExercise(); // Generează un nou exercițiu
        correctConsecutive++;
        updateProgress('Precizie', correctConsecutive);
    } else if (attempts < 2) {
        document.getElementById("message").textContent = "Incorect. Mai ai o încercare!";
    } else {
        document.getElementById("message").textContent = "Incorect. Vei avea mai mult succes data viitoare!";
        addExerciseToHistory(false); // Adaugă exercițiul cu indicarea că este incorect
        consecutiveCorrect = 0; // Resetează contorul pentru corecte consecutive
        generateExercise(); // Generează un nou exercițiu
        correctConsecutive = 0; // Resetează contorul pentru răspunsuri corecte consecutive
        updateProgress('Precizie', correctConsecutive);
    }
}

function checkAndDisplayBonus() {
    // Presupunând că avem 10 exerciții pentru adunare și scădere și 20 pentru aventurierNumeric
    const maxAdunare = 10, maxScadere = 10, maxNumere = 20;

    // Actualizează progresul pentru fiecare tip de exercițiu
    updateProgress('Adunare', bonusTracker.adunare); // pentru adunare
    updateProgress('Scadere', bonusTracker.scadere); // pentru scădere
    updateProgress('Numere', numbersUsed.size); // pentru numere utilizate

    // Maestru al Preciziei
    if (correctConsecutive >= 20) {
        document.getElementById("bonusPrecizie").style.opacity = 1;
        correctConsecutive = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Resetarea tracker-ului la completarea bonusului
    if (bonusTracker.adunare >= maxAdunare) {
        bonusTracker.adunare = 0;
    }
    if (bonusTracker.scadere >= maxScadere) {
        bonusTracker.scadere = 0;
    }
    if (numbersUsed.size >= maxNumere) {
        numbersUsed.clear();
    }
}

function addExerciseToHistory(isCorrect) {
    const exerciseText = document.getElementById("exercise").textContent;
    const userAnswer = document.getElementById("answer").value;
    const historyContainer = document.getElementById("exerciseList");
    const listItem = document.createElement("li");
    listItem.textContent = `${exerciseText} ${userAnswer} - ${isCorrect ? "Corect" : "Incorect"}`;

    if (isCorrect) {
        listItem.style.color = "green"; // Oferă feedback vizual pentru răspunsurile corecte
    } else {
        listItem.style.color = "red"; // Oferă feedback vizual pentru răspunsurile greșite
    }

    historyContainer.prepend(listItem); // Adaugă elementul la lista de istoric
}

function updateNumbersUsed(exerciseText) {
    const numbers = exerciseText.match(/\d+/g).map(Number);
    numbers.forEach(number => numbersUsed.add(number));
}

function updateProgress(bonusType, progress) {
    const progressId = `progress${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}`; // Construiește ID-ul bazei de progres
    const progressElement = document.getElementById(progressId);
    if (progressElement) {
        progressElement.value = progress; // Actualizează progresul

        // Verifică dacă progresul este complet și înlătură opacitatea
        if (progress >= progressElement.max) {
            const bonusId = `bonus${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)}`;
            document.getElementById(bonusId).style.opacity = 1; // Înlătură opacitatea pentru bonus completat
        }
    }
}

// Funcția pentru a începe sau a reporni provocarea de viteză
function startSpeedChallenge() {
    // Resetăm contorul de exerciții și barul de progres la începutul fiecărei provocări
    exercisesSolvedInChallenge = 0;
    document.getElementById("speedBonusProgress").value = 0;

    // Setăm timpul de start al provocării curente
    speedChallengeStart = Date.now();

    // Dacă există deja un cronometru în execuție, îl oprim
    if (speedChallengeTimer) {
        clearInterval(speedChallengeTimer);
    }

    // Inițiem un nou cronometru pentru provocare
    speedChallengeTimer = setInterval(() => {
        const elapsedTime = Date.now() - speedChallengeStart;
        // Dacă au trecut 60 de secunde, resetăm provocarea
        if (elapsedTime >= 60000) {
            // Oprim cronometrul
            clearInterval(speedChallengeTimer);
            // Resetăm și pornim din nou provocarea
            startSpeedChallenge();
        }
    }, 1000); // Verificăm timpul la fiecare secundă
}

// Funcția care este apelată la fiecare răspuns corect al utilizatorului
function incrementExercisesSolvedInChallenge() {
    const maxExercises = 10;
    exercisesSolvedInChallenge++;
    // Actualizăm progresul în bara de progres
    document.getElementById("speedBonusProgress").value = exercisesSolvedInChallenge;

    // Verificăm dacă utilizatorul a completat provocarea
    if (exercisesSolvedInChallenge >= maxExercises) {
        // Utilizatorul a completat provocarea, putem afișa o notificare sau actualiza UI-ul corespunzător aici
        console.log("Provocare completată cu succes!");

        // Actualizăm opacitatea imaginii pentru a indica deblocarea bonusului
        document.getElementById("bonusViteza").style.opacity = 1;

        // Opțional: Resetăm provocarea imediat sau lăsăm cronometrul să expire
        // Resetăm manual aici deoarece utilizatorul a completat provocarea
        clearInterval(speedChallengeTimer);
        startSpeedChallenge();
    }
}

// Apelăm funcția la încărcarea paginii pentru a începe prima provocare
document.addEventListener("DOMContentLoaded", startSpeedChallenge);
document.getElementById("answer").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

generateExercise();
