let correctAnswer; // Răspunsul corect al exercițiului curent
let attempts = 0; // Numărul de încercări pentru exercițiul curent
let bonusTracker = {
    adunare: 0,
    scadere: 0,
    numere: 0,
    precizie: 0, // Pentru bonusul "Maestru al Preciziei"
    viteza: 0,
    persistenta: 0,
    lantulSuccesului: 0,
    vartejulIntelepciunii: 0

}; // Urmărește progresul pentru bonusuri specifice
let numbersUsed = new Set(); // Pentru a urmări numerele utilizate în exerciții
let exerciseCount = 0;
let speedChallengeTimer; // Cronometru pentru provocarea de viteză
let speedChallengeStart; // Timpul de start al provocării curente
let exercisesSolvedInChallenge = 0; // Numărul de exerciții rezolvate în provocarea curentă
let bonusStatus = {
    adunare: false,
    scadere: false,
    numere: false,
    precizie: false, // Pentru bonusul "Maestru al Preciziei"
    viteza: false,
    persitenta: false,
    lantulSuccesului: 0,
    vartejulIntelepciunii: 0
};
let exercisesHistory = []; // Inițializăm lista de istoric a exercițiilor
const historyContainer = document.getElementById("exerciseList");
let soundEnabled = true;
let minNumber = 1;
let maxNumber = 20;
let bonusCounters = {
    adunare: 0,
    scadere: 0,
    numere: 0,
    precizie: 0, // Pentru bonusul "Maestru al Preciziei"
    viteza: 0,
    persitenta: 0,
    lantulSuccesului: 0,
    vartejulIntelepciunii: 0
};
let lastProblems = []; // Va stoca ultimele probleme generate sub forma de string-uri
let operationType = 'all'
let lastResults = []; // Inițializează o nouă listă pentru a urmări ultimele rezultate
const historyLimit = 3; // Numărul de rezultate unice pe care dorim să le urmărim

function generateExercise() {
    let num1, num2, exerciseType, problemString, newResult;
    const operationType = localStorage.getItem('operationType') || 'all'; // Citește tipul de operație din localStorage sau folosește 'all' ca valoare implicită

    do {
        // Ajustează selecția tipului de exercițiu bazat pe selecția utilizatorului
        if (operationType === 'all') {
            exerciseType = Math.random() > 0.5 ? "addition" : "subtraction";
        } else {
            exerciseType = operationType; // 'addition' sau 'subtraction', conform selecției
        }

        if (exerciseType === "addition") {
            num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
            let maxForNum2 = maxNumber - num1;
            num2 = Math.floor(Math.random() * (maxForNum2)) + 1;
        } else { // subtraction
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
        }

        newResult = exerciseType === "addition" ? num1 + num2 : num1 - num2;
        problemString = `${num1} ${exerciseType === "addition" ? "+" : "-"} ${num2}`;
    } while (lastProblems.includes(problemString) || lastResults.includes(newResult)); // Verifică dacă rezultatul a fost generat în ultimele 3 iterații

    correctAnswer = newResult;
    document.getElementById("exercise").innerHTML = problemString + " = ";
    document.getElementById("answer").value = '';
    document.getElementById("answer").classList.remove("incorrect");
    document.getElementById("answer").disabled = false;
    document.getElementById("answer").focus();
    attempts = 0; // Resetăm încercările pentru noul exercițiu

    // Actualizează istoricul rezultatelor, menținând doar ultimele 3 rezultate unice
    lastResults.push(newResult);
    if (lastResults.length > historyLimit) {
        lastResults.shift(); // Elimină cel mai vechi rezultat din istoric
    }
}

function updateRange() {
    // Actualizează valorile minime și maxime bazate pe inputul utilizatorului
    maxNumber = parseInt(document.getElementById('maxNumberSelect').value, 10) || maxNumber;
    operationType = document.getElementById('operationTypeSelect').value || operationType;


    // Resetează localStorage și salvează doar valorile min și max
    localStorage.clear();
    localStorage.setItem('maxNumber', maxNumber);
    localStorage.setItem('operationType', operationType);
    localStorage.setItem('soundEnabled', soundEnabled);

    // Reîncărcăm pagina pentru a aplica schimbările
    window.location.reload();
}

// Adăugați listeneri pentru inputuri pentru a actualiza intervalul la schimbare
document.getElementById('maxNumberSelect').addEventListener('change', updateRange);
document.getElementById('operationTypeSelect').addEventListener('change', updateRange);

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value, 10);
    const exerciseText = document.getElementById("exercise").textContent;
    const exerciseType = exerciseText.includes("+") ? "adunare" : "scadere";

    // Verifică dacă răspunsul este un număr
    if (isNaN(userAnswer)) {
        displayMessage("Te rog să introduci un număr.", "error");
        return;
    }

    attempts++; // Incrementăm numărul de încercări

    if (userAnswer === correctAnswer) {
        bonusTracker[exerciseType]++;
        bonusTracker.persistenta++;
        bonusTracker.precizie++;
        bonusTracker.lantulSuccesului++;
        bonusTracker.vartejulIntelepciunii++;
        exerciseCount++;
        incrementExercisesSolvedInChallenge();
        document.getElementById("exerciseCount").textContent = exerciseCount;
        updateNumbersUsed(document.getElementById("exercise").textContent);
        displayRandomMessage(true);
        addExerciseToHistory(true); // Adaugă exercițiul cu indicarea că este corect
        document.getElementById("answer").placeholder = '?'; // Resetează placeholder-ul dacă răspunsul este corect
        checkAndDisplayBonus();
        generateExercise(); // Generează un nou exercițiu
    } else if (attempts < 2) {
        playErrorSound();
        displayRandomMessage(false);
        document.getElementById("answer").placeholder = userAnswer; // Setează răspunsul greșit ca placeholder
        document.getElementById("answer").value = ''; // Golește câmpul de input pentru o nouă încercare
    } else {
        playErrorSound();
        displayMessage("Incorect. Vei avea mai mult succes data viitoare!", 'error');
        addExerciseToHistory(false); // Adaugă exercițiul cu indicarea că este incorect
        generateExercise(); // Generează un nou exercițiu
        bonusTracker.precizie = 0;
        bonusTracker.lantulSuccesului = 0;
        bonusTracker.vartejulIntelepciunii = 0;
        updateProgress('Precizie', bonusTracker.precizie);
        updateProgress('LantulSuccesului', bonusTracker.lantulSuccesului);
        updateProgress('VartejulIntelepciunii', bonusTracker.vartejulIntelepciunii);
        document.getElementById("answer").placeholder = '?'; // Resetează placeholder-ul pentru următoarea întrebare
    }
    saveToLocalStorage(); // Salvăm starea curentă după fiecare răspuns verificat
}

let messageTimeout;
const successMessages = [
    "Excelent!",
    "Corect! Felicitări.",
    "Bravo! Ai răspuns corect.",
    "Perfect! Continuă așa.",
    "Foarte bine!",
    "Răspuns corect! Ești un geniu.",
    "Exact ceea ce ne așteptam!",
    "Extraordinar, exact așa este!",
    "Super! Ai găsit răspunsul corect.",
    "Incredibil! Răspuns corect."
];

const errorMessages = [
    "Oops! Încearcă din nou.",
    "Aproape, dar nu chiar. Mai încearcă!",
    "Greșit. Fii atent la detalii.",
    "Nu e corect. Poți mai bine.",
    "Continuă să încerci!",
    "Nu e răspunsul corect, dar nu renunța.",
    "Eroare. Gândește-te mai bine.",
    "Răspuns greșit, dar nu te descuraja.",
    "Mai încearcă! Ești aproape de răspunsul corect.",
    "Nu e corect, dar efortul contează."
];

function getRandomMessage(messages) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}
function displayRandomMessage(isCorrect) {
    const message = isCorrect ? getRandomMessage(successMessages) : getRandomMessage(errorMessages);
    const messageType = isCorrect ? "success" : "error";
    displayMessage(message, messageType);
}
function displayMessage(message, type) {
    const messageElement = document.getElementById("message");
    clearTimeout(messageTimeout); // Anulează orice temporizator anterior

    // Setăm mesajul și clasificăm tipul de mesaj
    messageElement.textContent = message;
    messageElement.className = type === "error" ? "errorMessage" : "successMessage";
    messageElement.style.opacity = 1; // Asigură că mesajul este vizibil
    messageElement.style.animation = 'none'; // Întrerupe și resetează animația

    // Asigură-te că resetarea și repornirea animației sunt aplicate
    setTimeout(() => {
        messageElement.style.animation = ''; // Resetează animația
    }, 10); // O mică întârziere este necesară pentru a asigura resetarea animației

    // Setează un nou temporizator pentru a gestiona dispariția treptată
    messageTimeout = setTimeout(() => {
        messageElement.style.opacity = 0; // Inițiază dispariția treptată
    }, 10000); // Începe efectul de dispariție după 4 secunde
}


function checkAndDisplayBonus() {
    // Presupunând că avem 10 exerciții pentru adunare și scădere și 20 pentru aventurierNumeric
    const maxAdunare = 10, maxScadere = 10;

    // Actualizează progresul pentru fiecare tip de exercițiu
    updateProgress('Adunare', bonusTracker.adunare); // pentru adunare
    updateProgress('Scadere', bonusTracker.scadere); // pentru scădere
    updateProgress('Numere', numbersUsed.size); // pentru numere utilizate
    updateProgress('Precizie', bonusTracker.precizie);
    updateProgress('LantulSuccesului', bonusTracker.lantulSuccesului);
    updateProgress('VartejulIntelepciunii', bonusTracker.vartejulIntelepciunii);
    updateProgress('Persistenta', bonusTracker.persistenta);

    // Maestru al Preciziei
    if (bonusTracker.precizie >= 20) {
        bonusStatus.precizie = true;
        bonusCounters.precizie++;
        createFallingEffect();
        showBonusCompletedPopup('Maestru al Preciziei', 'images/precision-master.webp');
        document.getElementById("bonusPrecizie").style.opacity = 1;
        bonusTracker.precizie = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Lantul Succesului
    if (bonusTracker.lantulSuccesului >= 50) {
        bonusStatus.lantulSuccesului = true;
        bonusCounters.lantulSuccesului++;
        createFallingEffect();
        showBonusCompletedPopup('Lanțul Succesului', 'images/lantul-succesului.webp');
        document.getElementById("bonusLantulSuccesului").style.opacity = 1;
        bonusTracker.lantulSuccesului = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Vartejul Intelepciunii
    if (bonusTracker.vartejulIntelepciunii >= 100) {
        bonusStatus.vartejulIntelepciunii = true;
        bonusCounters.vartejulIntelepciunii++;
        createFallingEffect();
        showBonusCompletedPopup('Vârtejul Înțelepciunii', 'images/vartejul-intelepciunii.webp');
        document.getElementById("bonusVartejulIntelepciunii").style.opacity = 1;
        bonusTracker.vartejulIntelepciunii = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Resetarea tracker-ului la completarea bonusului
    if (bonusTracker.adunare >= maxAdunare) {
        bonusStatus.adunare = true;
        bonusCounters.adunare++;
        createFallingEffect();
        showBonusCompletedPopup('Maestru Adunării', 'images/maestrul-adunarii.webp');
        bonusTracker.adunare = 0;
    }
    if (bonusTracker.scadere >= maxScadere) {
        bonusStatus.scadere = true;
        bonusCounters.scadere++;
        createFallingEffect();
        showBonusCompletedPopup('Virtuozul Scăderii', 'images/virtuozul-scaderii.webp');
        bonusTracker.scadere = 0;
    }
    if (bonusTracker.persistenta >= 500) {
        bonusStatus.persistenta = true;
        bonusCounters.persitenta++;
        createFallingEffect();
        showBonusCompletedPopup('Persistență absolută', 'images/persistenta-absoluta.webp');
        bonusTracker.persistenta = 0;
    }
    if (numbersUsed.size >= maxNumber) {
        bonusStatus.numere = true;
        bonusCounters.numere++;
        createFallingEffect();
        showBonusCompletedPopup('Aventurier Numeric', 'images/aventurier-numeric.webp');
        numbersUsed.clear();
    }
    saveToLocalStorage(); // Salvăm starea curentă după verificarea bonusurilor
    updateUIForCounters();
}

function updateUIForCounters() {
    document.getElementById("counterAdunare").textContent = bonusCounters.adunare ?? 0;
    document.getElementById("counterScadere").textContent = bonusCounters.scadere ?? 0;
    document.getElementById("counterNumere").textContent = bonusCounters.numere ?? 0;
    document.getElementById("counterPrecizie").textContent = bonusCounters.precizie ?? 0;
    document.getElementById("counterLantulSuccesului").textContent = bonusCounters.lantulSuccesului ?? 0;
    document.getElementById("counterVartejulIntelepciunii").textContent = bonusCounters.vartejulIntelepciunii ?? 0;
    document.getElementById("counterViteza").textContent = bonusCounters.viteza ?? 0;
    document.getElementById("counterPersistenta").textContent = bonusCounters.persitenta ?? 0;
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
        progressElement.value = progress ?? 0; // Actualizează progresul

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
        bonusCounters.viteza++;
        applyGlowEffect('bonusViteza');
        createFallingEffect();
        showBonusCompletedPopup('Viteza Luminii', 'images/speed-light.webp');


        // Opțional: Resetăm provocarea imediat sau lăsăm cronometrul să expire
        // Resetăm manual aici deoarece utilizatorul a completat provocarea
        clearInterval(speedChallengeTimer);
        startSpeedChallenge();
    }
}

function saveToLocalStorage() {
    soundEnabled = document.getElementById('soundToggleButton').getAttribute('data-enabled') === 'true';
    const appData = {
        soundEnabled,
        bonusTracker,
        numbersUsed: Array.from(numbersUsed),
        exerciseCount,
        exercisesSolvedInChallenge,
        bonusStatus,
        exercisesHistory,
        maxNumber,
        bonusCounters,
        operationType
    };
    localStorage.setItem('mathAppData', JSON.stringify(appData));
}

function loadFromLocalStorage() {
    const savedMaxNumber = localStorage.getItem('maxNumber');
    if (savedMaxNumber !== null) maxNumber = parseInt(savedMaxNumber, 10);

    document.getElementById('maxNumberSelect').value = maxNumber;

    const savedOperationType = localStorage.getItem('operationType');
    if (savedOperationType !== null) operationType = savedOperationType;

    document.getElementById('operationTypeSelect').value = operationType;

    soundEnabled = localStorage.getItem('soundEnabled') ?? soundEnabled;
    document.getElementById('soundToggleButton').setAttribute('data-enabled', soundEnabled.toString());
    updateSoundButton();

    const appData = JSON.parse(localStorage.getItem('mathAppData')) || {};
    if (appData) {
        // Restaurarea stării variabilelor
        bonusTracker = appData?.bonusTracker ?? bonusTracker;
        numbersUsed = new Set(appData?.numbersUsed ?? []);
        exerciseCount = appData?.exerciseCount ?? 0;
        exercisesSolvedInChallenge = appData?.exercisesSolvedInChallenge ?? 0;
        bonusStatus = appData.bonusStatus || bonusStatus;
        bonusCounters = appData.bonusCounters || bonusCounters;
        exercisesHistory = appData.exercisesHistory || []; // Încarcă istoricul sau inițializează-l ca listă goală

        // Actualizarea UI-ului pentru a reflecta valorile contoarelor
        updateUIForCounters();

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

        updateProgress('Adunare', bonusTracker.adunare); // pentru adunare
        updateProgress('Scadere', bonusTracker.scadere); // pentru scădere
        updateProgress('Numere', numbersUsed.size); // pentru numere utilizate
        updateProgress('Precizie', bonusTracker.precizie);
        updateProgress('LantulSuccesului', bonusTracker.lantulSuccesului);
        updateProgress('VartejulIntelepciunii', bonusTracker.vartejulIntelepciunii);
        updateProgress('Persistenta', bonusTracker.persistenta);

        // Restaurează opacitatea elementelor bonus dacă progresele corespunzătoare au fost atinse
        if (bonusTracker.adunare >= 10) {
            document.getElementById("bonusAdunare").style.opacity = 1;
        }
        if (bonusTracker.scadere >= 10) {
            document.getElementById("bonusScadere").style.opacity = 1;
        }
        if (bonusTracker.persistenta >= 500) {
            document.getElementById("bonusPersistenta").style.opacity = 1;
        }
        if (numbersUsed.size >= maxNumber) {
            document.getElementById("bonusNumere").style.opacity = 1;
        }

        // Restaurează istoricul exercițiilor
        historyContainer.innerHTML = ''; // Curăță lista curentă
        if (appData && appData.exercisesHistory) {
            appData.exercisesHistory.forEach(exercise => {
                const listItem = document.createElement("li");
                listItem.textContent = `${exercise.question} ${exercise.userAnswer} - ${exercise.isCorrect ? "Corect" : "Incorect"}`;
                listItem.style.color = exercise.isCorrect ? "green" : "red";
                historyContainer.appendChild(listItem);
            });
        } else {
            // Inițializați exercisesHistory cu o valoare implicită (de exemplu, un array gol)
            appData.exercisesHistory = [];
        }
    }
}

function updateSoundButton() {
    const button = document.getElementById('soundToggleButton');
    // Citim starea sunetului ca string și o convertim în boolean
    soundEnabled = button.getAttribute('data-enabled') === 'true';
    button.classList.toggle('soundOn', soundEnabled);
    button.classList.toggle('soundOff', !soundEnabled);
    button.textContent = soundEnabled ? 'Cu sunet' : 'Fără sunet';
}

function updateProgressMax() {
    const progressNumere = document.getElementById('progressNumere');
    if (progressNumere) {
        progressNumere.max = maxNumber - minNumber + 1; // Presupunând că vrei toate numerele între minNumber și maxNumber
    }
}

function showBonusCompletedPopup(bonusName, bonusIconPath) {
    // Crează elementul popup
    const popup = document.createElement('div');
    popup.id = 'bonusCompletedPopup';
    popup.innerHTML = `
        <img src="${bonusIconPath}" alt="${bonusName}" class="popupIcon">
        <p>${bonusName} completat!</p>
    `;
    document.body.appendChild(popup);

    // Afișează popup-ul și îl ascunde după 5 secunde
    setTimeout(() => {
        popup.style.opacity = 1; // Face popup-ul vizibil
    }, 100);

    setTimeout(() => {
        popup.style.opacity = 0; // Ascunde popup-ul
        setTimeout(() => document.body.removeChild(popup), 600); // Îl șterge după ce animația de opacitate s-a încheiat
    }, 5000);
}

document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
    }
});

document.getElementById("toggleSettingsButton").addEventListener("click", function() {
    var settingsContainer = document.getElementById("settingsContainer");
    if (settingsContainer.style.display === "none") {
        settingsContainer.style.display = "block"; // Schimbă display-ul pentru a arăta setările
        this.textContent = "Ascunde Setările"; // Actualizează textul butonului
    } else {
        settingsContainer.style.display = "none"; // Ascunde setările
        this.textContent = "Arată Setările"; // Resetează textul butonului
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    updateProgressMax();
    startSpeedChallenge(); // Asigurați-vă că aceasta este apelată după încărcarea datelor

    // Listener pentru butonul de resetare
    document.getElementById('resetButton').addEventListener('click', function () {
        localStorage.clear(); // Șterge localStorage
        window.location.reload(); // Reîncarcă pagina pentru a reseta aplicația
    });

    // Listener pentru butonul de sunet
    document.getElementById('soundToggleButton').addEventListener('click', function () {
        // Comutăm starea sunetului bazându-ne pe atributul data-enabled actual, convertit în boolean
        soundEnabled = this.getAttribute('data-enabled') !== 'true';
        this.setAttribute('data-enabled', soundEnabled.toString()); // Salvăm ca string
        localStorage.setItem('soundEnabled', soundEnabled);
        saveToLocalStorage(); // Salvăm noua stare a sunetului în localStorage
        updateSoundButton(); // Actualizăm aspectul butonului de sunet
    });

    generateExercise(); // Generăm primul exercițiu după ce totul este încărcat
});
