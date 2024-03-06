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
let bonusStatus = {
    adunare: false,
    scadere: false,
    numere: false,
    precizie: false,
    viteza: false
};
let exercisesHistory = []; // Inițializăm lista de istoric a exercițiilor
const historyContainer = document.getElementById("exerciseList");
let soundEnabled = false;

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
        document.getElementById("answer").placeholder = '?'; // Resetează placeholder-ul dacă răspunsul este corect
    } else if (attempts < 2) {
        playErrorSound();
        document.getElementById("message").textContent = "Incorect. Mai încearcă!";
        document.getElementById("answer").placeholder = userAnswer; // Setează răspunsul greșit ca placeholder
        document.getElementById("answer").value = ''; // Golește câmpul de input pentru o nouă încercare
    } else {
        playErrorSound();
        document.getElementById("message").textContent = "Incorect. Vei avea mai mult succes data viitoare!";
        addExerciseToHistory(false); // Adaugă exercițiul cu indicarea că este incorect
        consecutiveCorrect = 0; // Resetează contorul pentru corecte consecutive
        generateExercise(); // Generează un nou exercițiu
        correctConsecutive = 0; // Resetează contorul pentru răspunsuri corecte consecutive
        updateProgress('Precizie', correctConsecutive);
        document.getElementById("answer").placeholder = '?'; // Resetează placeholder-ul pentru următoarea întrebare
    }
    saveToLocalStorage(); // Salvăm starea curentă după fiecare răspuns verificat
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
        bonusStatus.precizie = true;
        createFallingEffect();
        document.getElementById("bonusPrecizie").style.opacity = 1;
        correctConsecutive = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Resetarea tracker-ului la completarea bonusului
    if (bonusTracker.adunare >= maxAdunare) {
        bonusStatus.adunare = true;
        createFallingEffect();
        bonusTracker.adunare = 0;
    }
    if (bonusTracker.scadere >= maxScadere) {
        bonusStatus.scadere =true;
        createFallingEffect();
        bonusTracker.scadere = 0;
    }
    if (numbersUsed.size >= maxNumere) {
        bonusStatus.numere = true;
        createFallingEffect();
        numbersUsed.clear();
    }
    saveToLocalStorage(); // Salvăm starea curentă după verificarea bonusurilor
}

function addExerciseToHistory(isCorrect) {
    const exerciseText = document.getElementById("exercise").textContent;
    const userAnswer = document.getElementById("answer").value;

    const listItem = document.createElement("li");
    listItem.textContent = `${exerciseText} ${userAnswer} - ${isCorrect ? "Corect" : "Incorect"}`;

    if (isCorrect) {
        listItem.style.color = "green"; // Oferă feedback vizual pentru răspunsurile corecte
    } else {
        listItem.style.color = "red"; // Oferă feedback vizual pentru răspunsurile greșite
    }

    historyContainer.prepend(listItem); // Adaugă elementul la lista de istoric

    // Actualizăm istoricul exercițiilor și salvăm în localStorage
    exercisesHistory.unshift({question: exerciseText, userAnswer, isCorrect}); // Adaugă la începutul listei pentru a menține ordinea cronologică
    saveToLocalStorage();
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
            applyGlowEffect(bonusId);
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

function playErrorSound() {
    var errorSound = document.getElementById('errorSound');
    if (errorSound) {
        errorSound.play();
    }
}

function applyGlowEffect(bonusId) {
    const bonusImage = document.getElementById(bonusId);
    bonusImage.classList.add('glowEffect');

    // Oprirea efectului de licărire după 5 secunde
    setTimeout(() => {
        bonusImage.classList.remove('glowEffect');
    }, 5000); // 5000ms = 5 secunde
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

        bonusStatus.viteza = true;
        applyGlowEffect('bonusViteza');
        createFallingEffect();

        // Opțional: Resetăm provocarea imediat sau lăsăm cronometrul să expire
        // Resetăm manual aici deoarece utilizatorul a completat provocarea
        clearInterval(speedChallengeTimer);
        startSpeedChallenge();
    }
}

function saveToLocalStorage() {
    const appData = {
        soundEnabled,
        bonusTracker,
        numbersUsed: Array.from(numbersUsed),
        exerciseCount,
        consecutiveCorrect,
        correctConsecutive,
        exercisesSolvedInChallenge,
        bonusStatus,
        exercisesHistory
    };
    localStorage.setItem('mathAppData', JSON.stringify(appData));
}

function loadFromLocalStorage() {
    const appData = JSON.parse(localStorage.getItem('mathAppData'));
    if (appData) {
        // Restaurarea stării variabilelor
        soundEnabled = appData?.soundEnabled ?? false;
        bonusTracker = appData?.bonusTracker ?? { adunare: 0, scadere: 0, numere: 0, precizie: 0, viteza: 0 };
        numbersUsed = new Set(appData?.numbersUsed ?? []);
        exerciseCount = appData?.exerciseCount ?? 0;
        consecutiveCorrect = appData?.consecutiveCorrect ?? 0;
        correctConsecutive = appData?.correctConsecutive ?? 0;
        exercisesSolvedInChallenge = appData?.exercisesSolvedInChallenge ?? 0;
        bonusStatus = appData.bonusStatus || {
            adunare: false,
            scadere: false,
            numere: false,
            precizie: false,
            viteza: false
        };
        exercisesHistory = appData.exercisesHistory || []; // Încarcă istoricul sau inițializează-l ca listă goală

        // Restaurează UI-ul bazat pe bonusStatus
        Object.keys(bonusStatus).forEach(key => {
            if (bonusStatus[key]) {
                document.getElementById(`bonus${key.charAt(0).toUpperCase() + key.slice(1)}`).style.opacity = 1;
            }
        });

        // Restaurează istoricul exercițiilor în UI
        historyContainer.innerHTML = ''; // Curăță conținutul actual
        exercisesHistory.forEach(exercise => {
            const listItem = document.createElement("li");
            listItem.textContent = `${exercise.question} ${exercise.userAnswer} - ${exercise.isCorrect ? "Corect" : "Incorect"}`;
            listItem.style.color = exercise.isCorrect ? "green" : "red";
            historyContainer.prepend(listItem); // Asigură că cele mai recente intrări sunt la început
        });

        // Actualizează contorul exercițiilor
        document.getElementById("exerciseCount").textContent = exerciseCount;

        const soundButton = document.getElementById("soundToggleButton");
        soundButton.classList.toggle('soundOn', soundEnabled);
        soundButton.classList.toggle('soundOff', !soundEnabled);
        soundButton.textContent = soundEnabled ? 'Cu sunet' : 'Fără sunet';

        updateProgress('Adunare', bonusTracker.adunare); // pentru adunare
        updateProgress('Scadere', bonusTracker.scadere); // pentru scădere
        updateProgress('Numere', numbersUsed.size); // pentru numere utilizate
        updateProgress('Precizie', correctConsecutive);

        // Restaurează opacitatea elementelor bonus dacă progresele corespunzătoare au fost atinse
        if (bonusTracker.adunare >= 10) {
            document.getElementById("bonusAdunare").style.opacity = 1;
        }
        if (bonusTracker.scadere >= 10) {
            document.getElementById("bonusScadere").style.opacity = 1;
        }
        if (numbersUsed.size >= 20) {
            document.getElementById("bonusNumere").style.opacity = 1;
        }

        // Restaurează istoricul exercițiilor
        historyContainer.innerHTML = ''; // Curăță lista curentă
        appData.exercisesHistory.forEach(exercise => {
            const listItem = document.createElement("li");
            listItem.textContent = `${exercise.question} ${exercise.userAnswer} - ${exercise.isCorrect ? "Corect" : "Incorect"}`;
            listItem.style.color = exercise.isCorrect ? "green" : "red";
            historyContainer.appendChild(listItem);
        });
    }
}

function updateSoundButton() {
    const soundButton = document.getElementById('soundToggleButton');
    if (soundEnabled) {
        soundButton.classList.remove('soundOff');
        soundButton.classList.add('soundOn');
        soundButton.textContent = 'Cu sunet';
    } else {
        soundButton.classList.remove('soundOn');
        soundButton.classList.add('soundOff');
        soundButton.textContent = 'Fără sunet';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    startSpeedChallenge(); // Asigurați-vă că aceasta este apelată după încărcarea datelor

    // Listener pentru butonul de resetare
    document.getElementById('resetButton').addEventListener('click', function() {
        localStorage.clear(); // Șterge localStorage
        window.location.reload(); // Reîncarcă pagina pentru a reseta aplicația
    });

    // Listener pentru butonul de sunet
    document.getElementById('soundToggleButton').addEventListener('click', function() {
        soundEnabled = !soundEnabled; // Comutăm starea sunetului
        saveToLocalStorage(); // Salvăm noua stare a sunetului în localStorage
        updateSoundButton(); // Actualizăm aspectul butonului de sunet
    });
});

// Apelăm funcția la încărcarea paginii pentru a începe prima provocare
document.addEventListener("DOMContentLoaded", startSpeedChallenge);
document.getElementById("answer").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});


generateExercise();
