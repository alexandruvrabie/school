let correctAnswer; // Răspunsul corect al exercițiului curent
let attempts = 0; // Numărul de încercări pentru exercițiul curent
let numbersUsed = new Set(); // Pentru a urmări numerele utilizate în exerciții
let exerciseCount = 0;
let exercisesHistory = []; // Inițializăm lista de istoric a exercițiilor
const historyContainer = document.getElementById("exerciseList");
let soundEnabled = true;
let maxNumber = 20;
let lastProblems = []; // Va stoca ultimele probleme generate sub forma de string-uri
let operationType = 'addition_subtraction'
let lastResults = []; // Inițializează o nouă listă pentru a urmări ultimele rezultate
const historyLimit = 3; // Numărul de rezultate unice pe care dorim să le urmărim
let bonusElements = {}; // Obiect pentru a stoca referințele la elementele bonusurilor
let isFirstExercise = true;
let bonusData = {};
let speedChallenges = {
    bonusCursaCrocodilului: {
        timeLimit: 60000,
        maxExercises: 10,
        exercisesSolved: 0,
        timer: null,
        progressElementId: 'bonusCursaCrocodilului',
    },
    bonusFulgerAlbastru: {
        timeLimit: 100000,
        maxExercises: 20,
        exercisesSolved: 0,
        timer: null,
        progressElementId: 'bonusFulgerAlbastru',
    },
    bonusVitezaLuminii: {
        timeLimit: 200000,
        maxExercises: 50,
        exercisesSolved: 0,
        timer: null,
        progressElementId: 'bonusVitezaLuminii',
    }
};
let complexitySettings = 'standard';

function generateExercise() {
    let num1, num2, exerciseType, problemString, newResult;
    const operationType = localStorage.getItem('operationType') || 'addition_subtraction'; // Citește tipul de operație din localStorage sau folosește 'addition_subtraction' ca valoare implicită

    do {
        // Ajustează selecția tipului de exercițiu bazat pe selecția utilizatorului
        if (operationType === 'addition_subtraction') {
            exerciseType = Math.random() > 0.5 ? "addition" : "subtraction";
        } else {
            exerciseType = operationType; // 'addition' sau 'subtraction', conform selecției
        }

        if (exerciseType === "multiplication") {
            // Generează numere pentru înmulțire
            num1 = Math.floor(Math.random() * 8) + 2; // Numere între 2 și 9 pentru a menține exercițiile prietenoase pentru clasele primare
            num2 = Math.floor(Math.random() * 8) + 2;
            newResult = num1 * num2;
            problemString = `${num1} × ${num2}`;
        } else if (exerciseType === "addition") {
            num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
            let maxForNum2 = maxNumber - num1;
            num2 = Math.floor(Math.random() * (maxForNum2)) + 1;
            newResult = num1 + num2;
            problemString = `${num1} + ${num2}`;
        } else { // subtraction
            num1 = Math.floor(Math.random() * maxNumber) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            newResult = num1 - num2;
            problemString = `${num1} - ${num2}`;
        }
    } while (lastProblems.includes(problemString) || lastResults.includes(newResult)); // Verifică dacă problema sau rezultatul a fost generat recent

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

function updateSettings() {
    // Actualizează valorile minime și maxime bazate pe inputul utilizatorului
    maxNumber = parseInt(document.getElementById('maxNumberSelect').value, 10) || maxNumber;
    operationType = document.getElementById('operationTypeSelect').value || operationType;
    complexitySettings = document.getElementById('complexitySelect').value || complexitySettings;

    // Resetează localStorage și salvează doar valorile min și max
    localStorage.clear();
    localStorage.setItem('maxNumber', maxNumber);
    localStorage.setItem('operationType', operationType);
    localStorage.setItem('soundEnabled', soundEnabled);
    localStorage.setItem('complexitySettings', complexitySettings);

    // Reîncărcăm pagina pentru a aplica schimbările
    window.location.reload();
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value, 10);
    const exerciseText = document.getElementById("exercise").textContent;
    const exerciseType = exerciseText.includes("+") ? "bonusMaestruAdunarii" :
        exerciseText.includes("-") ? "bonusVirtuozulScaderii" :
            "bonusPionieriiInmultirii"; // Asumăm că adaugi un ID corespunzător pentru bonusul de înmulțire

    // Verifică dacă răspunsul este un număr
    if (isNaN(userAnswer)) {
        displayMessage("Te rog să introduci un număr.", "error");
        return;
    }

    attempts++; // Incrementăm numărul de încercări

    if (userAnswer === correctAnswer) {
        bonusData[exerciseType].progress++;
        bonusData.bonusPersistentaAbsoluta.progress++;
        bonusData.bonusMaestruPreciziei.progress++;
        bonusData.bonusLantulSuccesului.progress++;
        bonusData.bonusVartejulIntelepciunii.progress++;
        exerciseCount++;
        incrementAllChallenges();
        document.getElementById("exerciseCount").textContent = exerciseCount;
        updateNumbersUsed(document.getElementById("exercise").textContent);
        displayRandomMessage(true);
        addExerciseToHistory(true); // Adaugă exercițiul cu indicarea că este corect
        document.getElementById("answer").placeholder = '?'; // Resetează placeholder-ul dacă răspunsul este corect
        checkAndDisplayBonus();
        if (isFirstExercise) {
            // Ascunde descrierea după rezolvarea corectă a primului exercițiu
            document.getElementById("exerciseDescription").style.display = "none";
            isFirstExercise = false; // Asigură-te că descrierea nu va fi ascunsă din nou la exercițiile următoare
        }
        generateExercise(); // Generează un nou exercițiu
    } else if (attempts < 2 && complexitySettings === 'standard') {
        playErrorSound();
        displayRandomMessage(false);
        document.getElementById("answer").placeholder = userAnswer; // Setează răspunsul greșit ca placeholder
        document.getElementById("answer").value = ''; // Golește câmpul de input pentru o nouă încercare
    } else {
        playErrorSound();
        displayRandomMessage(false);
        addExerciseToHistory(false); // Adaugă exercițiul cu indicarea că este incorect
        generateExercise(); // Generează un nou exercițiu
        bonusData.bonusMaestruPreciziei.progress = 0;
        bonusData.bonusLantulSuccesului.progress = 0;
        bonusData.bonusVartejulIntelepciunii.progress = 0;
        updateProgress('bonusMaestruPreciziei', bonusData.bonusMaestruPreciziei.progress);
        updateProgress('bonusLantulSuccesului', bonusData.bonusLantulSuccesului.progress);
        updateProgress('bonusVartejulIntelepciunii', bonusData.bonusVartejulIntelepciunii.progress);
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
    "Nu e corect, dar efortul contează.",
    "Incorect. Vei avea mai mult succes data viitoare!"
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
}


function checkAndDisplayBonus() {
    // Presupunând că avem 10 exerciții pentru adunare și scădere și 20 pentru aventurierNumeric
    const maxAdunare = 10, maxScadere = 10;
    bonusData.bonusAventurierNumeric.progress = numbersUsed.size;

    // Actualizează progresul pentru fiecare tip de exercițiu
    updateAllProgress();

    // Maestru al Preciziei
    if (bonusData.bonusMaestruPreciziei.progress >= 20) {
        bonusData.bonusMaestruPreciziei.status = true;
        bonusData.bonusMaestruPreciziei.counter++;
        bonusData.bonusMaestruPreciziei.progress = 0; // Resetează contorul după ce bonusul este acordat
        createFallingEffect();
        showBonusCompletedPopup('bonusMaestruPreciziei');
    }
    // Lantul Succesului
    if (bonusData.bonusLantulSuccesului.progress >= 50) {
        bonusData.bonusLantulSuccesului.status = true;
        bonusData.bonusLantulSuccesului.counter++;
        bonusData.bonusLantulSuccesului.progress = 0; // Resetează contorul după ce bonusul este acordat
        createFallingEffect();
        showBonusCompletedPopup('bonusLantulSuccesului');
    }
    // Vartejul Intelepciunii
    if (bonusData.bonusVartejulIntelepciunii.progress >= 100) {
        bonusData.bonusVartejulIntelepciunii.status = true;
        bonusData.bonusVartejulIntelepciunii.counter++;
        bonusData.bonusVartejulIntelepciunii.progress = 0; // Resetează contorul după ce bonusul este acordat
        createFallingEffect();
        showBonusCompletedPopup('bonusVartejulIntelepciunii');
    }
    // Resetarea tracker-ului la completarea bonusului
    if (bonusData.bonusMaestruAdunarii.progress >= maxAdunare) {
        bonusData.bonusMaestruAdunarii.status = true;
        bonusData.bonusMaestruAdunarii.counter++;
        bonusData.bonusMaestruAdunarii.progress = 0;
        createFallingEffect();
        showBonusCompletedPopup('bonusMaestruAdunarii');
    }
    if (bonusData.bonusVirtuozulScaderii.progress >= maxScadere) {
        bonusData.bonusVirtuozulScaderii.status = true;
        bonusData.bonusVirtuozulScaderii.counter++;
        bonusData.bonusVirtuozulScaderii.progress = 0;
        createFallingEffect();
        showBonusCompletedPopup('bonusVirtuozulScaderii');
    }
    if (bonusData.bonusPionieriiInmultirii.progress >= 50) {
        bonusData.bonusPionieriiInmultirii.status = true;
        bonusData.bonusPionieriiInmultirii.counter++;
        bonusData.bonusPionieriiInmultirii.progress = 0;
        createFallingEffect();
        showBonusCompletedPopup('bonusPionieriiInmultirii');
    }
    if (bonusData.bonusPersistentaAbsoluta.progress >= 500) {
        bonusData.bonusPersistentaAbsoluta.status = true;
        bonusData.bonusPersistentaAbsoluta.counter++;
        bonusData.bonusPersistentaAbsoluta.progress = 0;
        createFallingEffect();
        showBonusCompletedPopup('bonusPersistentaAbsoluta');
    }
    if (numbersUsed.size >= maxNumber) {
        bonusData.bonusAventurierNumeric.status = true;
        bonusData.bonusAventurierNumeric.counter++;
        bonusData.bonusAventurierNumeric.progress = 0;
        createFallingEffect();
        showBonusCompletedPopup('bonusAventurierNumeric');
        numbersUsed.clear();
    }
    saveToLocalStorage(); // Salvăm starea curentă după verificarea bonusurilor
    updateUIForCounters();
}

function updateUIForCounters() {
    // Iterează prin obiectul bonusElements pentru a actualiza contoarele
    Object.keys(bonusElements).forEach(bonusId => {
        // Asigură că avem un counter pentru acest tip de bonus înainte de a încerca să actualizăm UI-ul
        if (bonusData.hasOwnProperty(bonusId)) {
            const counterValue = bonusData[bonusId].counter;
            const { counterSpan } = bonusElements[bonusId];
            if (counterSpan) {
                counterSpan.textContent = counterValue ?? 0;
            }
        }
    });
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
    // Actualizează numărul de numere unice folosite
    bonusData.bonusAventurierNumeric.progress = numbersUsed.size;
}

function updateProgress(bonusId, progress) {
    // Verifică dacă există referințe pentru acest bonus în obiectul bonusElements
    if (bonusElements[bonusId]) {
        // Extrage elementele necesare din structura bonusElements
        const { progressElement, image } = bonusElements[bonusId];

        if (progressElement) {
            progressElement.value = progress ?? 0; // Actualizează progresul

            // Verifică dacă progresul este complet
            if (progress >= progressElement.max) {
                image.style.opacity = 1; // Înlătură opacitatea imaginii pentru bonus completat
                applyGlowEffect(image); // Aplică efectul de licărire pe imagine
            }
        }
    }
}

function updateAllProgress() {
    Object.keys(bonusData).forEach(bonusId => {
        const bonus = bonusData[bonusId];
        updateProgress(bonusId, bonus.progress);
    });
}

// Funcția pentru a începe sau a reporni provocarea de viteză
function startChallenge(challengeKey, timeLimit) {
    // Resetăm contorul de exerciții și barul de progres la începutul fiecărei provocări
    bonusData[challengeKey].progress = 0;
    updateProgress(challengeKey, 0);

    // Setăm timpul de start al provocării curente
    bonusData[challengeKey].startTime = Date.now();

    // Dacă există deja un cronometru în execuție, îl oprim
    if (bonusData[challengeKey].timer) {
        clearInterval(bonusData[challengeKey].timer);
    }

    // Inițiem un nou cronometru pentru provocare
    bonusData[challengeKey].timer = setInterval(() => {
        const elapsedTime = Date.now() - bonusData[challengeKey].startTime;
        if (elapsedTime >= timeLimit) {
            // Oprim cronometrul
            clearInterval(bonusData[challengeKey].timer);
            // Acțiuni la finalul timpului, de exemplu resetarea provocării sau afișarea unui mesaj
            console.log(`${challengeKey} a atins limita de timp.`);
            // Resetăm și pornim din nou provocarea
            startChallenge(challengeKey, timeLimit);
        }
    }, 1000); // Verificăm timpul la fiecare secundă
}

function playErrorSound() {
    const errorSound = document.getElementById('errorSound');
    if (errorSound) {
        errorSound.play();
    }
}

function applyGlowEffect(element) {
    if (element) {
        element.classList.add('glowEffect');
        setTimeout(() => {
            element.classList.remove('glowEffect');
        }, 5000); // 5000ms = 5 secunde
    }
}

// Funcția care este apelată la fiecare răspuns corect al utilizatorului
function incrementExerciseSolved(challengeKey, maxExercises, timeLimit) {
    // Verifică dacă provocarea este activă și actualizează progresul
    if (bonusData[challengeKey]) {
        bonusData[challengeKey].progress++;

        // Actualizează bara de progres în UI
        updateProgress(challengeKey, bonusData[challengeKey].progress);

        // Verifică dacă numărul de exerciții rezolvate a atins numărul maxim necesar
        if (bonusData[challengeKey].progress >= maxExercises) {
            console.log(`Provocarea ${challengeKey} completată cu succes!`);

            // Marchează provocarea ca fiind completată
            bonusData[challengeKey].status = true;
            bonusData[challengeKey].counter++;

            // Resetarea progresului pentru o nouă provocare, dacă este necesar
            bonusData[challengeKey].progress = 0;
            updateProgress(challengeKey, 0); // Resetează bara de progres în UI
            createFallingEffect();
            showBonusCompletedPopup(challengeKey);

            clearInterval(bonusData[challengeKey].timer);
            startChallenge(challengeKey, timeLimit);
        }
    }
}

function saveToLocalStorage() {
    soundEnabled = document.getElementById('soundToggleButton').getAttribute('data-enabled') === 'true';
    const appData = {
        soundEnabled,
        numbersUsed: Array.from(numbersUsed),
        exerciseCount,
        exercisesHistory,
        maxNumber,
        operationType,
        bonusData
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

    const savedComplexitySettings = localStorage.getItem('complexitySettings');
    if (savedComplexitySettings !== null) complexitySettings = savedComplexitySettings;

    document.getElementById('complexitySelect').value = complexitySettings;

    soundEnabled = localStorage.getItem('soundEnabled') ?? soundEnabled;
    document.getElementById('soundToggleButton').setAttribute('data-enabled', soundEnabled.toString());
    updateSoundButton();

    const appData = JSON.parse(localStorage.getItem('mathAppData')) || {};
    if (appData) {
        // Restaurarea stării variabilelor
        Object.assign(bonusData, appData.bonusData); // Asumând că ai salvat bonusData în localStorage
        numbersUsed = new Set(appData.numbersUsed ?? []);
        exerciseCount = appData.exerciseCount ?? 0;

        // Actualizează contoarele și statusul bonusurilor folosind noua structură
        updateUIForCounters();
        updateBonusStatusUI();

        // Restaurează istoricul exercițiilor în UI
        exercisesHistory = Array.isArray(appData.exercisesHistory) ? appData.exercisesHistory : [];
        refreshExerciseHistoryUI(exercisesHistory);
        // Actualizează contorul exercițiilor
        document.getElementById("exerciseCount").textContent = exerciseCount;

        updateAllProgress();
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

function updateBonusStatusUI() {
    // Iterate through all bonus entries to update their UI based on their status
    Object.keys(bonusData).forEach(bonusId => {
        if (bonusData[bonusId].status) {
            // If the bonus status is true, remove opacity from the image to indicate completion
            const imageElement = bonusElements[bonusId].image; // Assuming bonusElements stores DOM references
            if (imageElement) {
                imageElement.style.opacity = 1;
            }
        }
    });
}

function refreshExerciseHistoryUI(history) {
    // Asigură că istoricul este un array înainte de a continua
    if (!Array.isArray(history)) {
        console.error('Expected an array for exercise history, but received:', history);
        return; // Încetează execuția funcției dacă istoricul nu este un array
    }

    historyContainer.innerHTML = ''; // Curăță lista curentă
    history.forEach(exercise => {
        const listItem = document.createElement("li");
        listItem.textContent = `${exercise.question} ${exercise.userAnswer} - ${exercise.isCorrect ? "Corect" : "Incorect"}`;
        listItem.style.color = exercise.isCorrect ? "green" : "red";
        historyContainer.appendChild(listItem);
    });
}

function updateProgressMax() {
    // Identificăm elementul de progres prin ID-ul containerului specific bonusului
    if (bonusElements.bonusAventurierNumeric && bonusElements.bonusAventurierNumeric.progressElement) {
        bonusElements.bonusAventurierNumeric.progressElement.max = maxNumber;
    }
}

function showBonusCompletedPopup(bonusId) {
    // Identifică elementul bonusItem folosind ID-ul primit
    if (!bonusElements[bonusId]) {
        console.error('Bonus item not found for ID:', bonusId);
        return;
    }

    // Extrage titlul bonusului și sursa imaginii direct din elementul bonusItem
    const title = bonusElements[bonusId].title.textContent;
    const imageSrc = bonusElements[bonusId].image.src;

    // Implementează logica pentru a afișa popup-ul cu aceste detalii
    console.log(`Bonus completat: ${title}`);
    // Crează elementul popup
    const popup = document.createElement('div');
    popup.id = 'bonusCompletedPopup';
    popup.innerHTML = `
        <img src="${imageSrc}" alt="${title}" class="popupIcon">
        <p>${title} completat!</p>
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

function startAllChallenges() {
    Object.keys(speedChallenges).forEach(challengeKey => {
        const { timeLimit, maxExercises } = speedChallenges[challengeKey];
        startChallenge(challengeKey, timeLimit, maxExercises);
    });
}

function incrementAllChallenges() {
    Object.keys(speedChallenges).forEach(challengeKey => {
        incrementExerciseSolved(challengeKey, speedChallenges[challengeKey].maxExercises, speedChallenges[challengeKey].timeLimit);
    });
}

function updateBonusVisibility() {
    // Ascunde toate bonusurile
    bonusElements.bonusMaestruAdunarii.item.style.display = 'none';
    bonusElements.bonusVirtuozulScaderii.item.style.display = 'none';
    bonusElements.bonusPionieriiInmultirii.item.style.display = 'none';

    // Afișează doar bonusurile relevante pentru operația selectată
    if (operationType === 'addition_subtraction') {
        bonusElements.bonusMaestruAdunarii.item.style.display = 'block';
        bonusElements.bonusVirtuozulScaderii.item.style.display = 'block';
    } else if (operationType === 'addition') {
        bonusElements.bonusMaestruAdunarii.item.style.display = 'block';
    } else if (operationType === 'subtraction') {
        bonusElements.bonusVirtuozulScaderii.item.style.display = 'block';
    } else if (operationType === 'multiplication') {
        bonusElements.bonusPionieriiInmultirii.item.style.display = 'block';
    }
}

document.querySelectorAll('.bonusItem').forEach(item => {
    item.addEventListener('click', function() {
        let overlay = this.querySelector('.bonusOverlay');

        // Crearea overlay-ului dacă acesta nu există
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'bonusOverlay';
            overlay.style.display = 'flex'; // Se afișează initial

            const description = this.querySelector('img').getAttribute('title');
            overlay.innerHTML = `<p>${description}</p>`;
            this.appendChild(overlay);

            // Ascunderea overlay-ului la click
            overlay.addEventListener('click', function(e) {
                e.stopPropagation(); // Previne bubbling-ul către elementul părinte
                this.style.display = 'none';
            });
        } else {
            // Alternarea afișării overlay-ului
            overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
        }
    });
});

// Adăugați listeneri pentru inputuri pentru a actualiza intervalul la schimbare
document.getElementById('maxNumberSelect').addEventListener('change', updateSettings);
document.getElementById('operationTypeSelect').addEventListener('change', updateSettings);
document.getElementById('complexitySelect').addEventListener('change', updateSettings)
document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
    }
});

document.getElementById("toggleSettingsButton").addEventListener("click", function() {
    let settingsContainer = document.getElementById("settingsContainer");
    if (settingsContainer.style.display === "none") {
        settingsContainer.style.display = "block"; // Schimbă display-ul pentru a arăta setările
        this.textContent = "Ascunde Setările"; // Actualizează textul butonului
    } else {
        settingsContainer.style.display = "none"; // Ascunde setările
        this.textContent = "Arată Setările"; // Resetează textul butonului
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Caută toate elementele cu clasa "bonusItem" și extrage ID-urile
    const bonusItems = document.querySelectorAll('.bonusItem');
    bonusItems.forEach(item => {
        // Presupunem că fiecare "bonusItem" are un ID unic și conține un span pentru contor și un img pentru imagine
        const bonusId = item.id;
        const title = item.querySelector('.bonusTitle');
        const counterSpan = item.querySelector('span');
        const image = item.querySelector('img');
        const progressElement = item.querySelector('progress');

        // Populăm `bonusElements` cu referințele la elementele DOM
        bonusElements[bonusId] = { item, title, counterSpan, image, progressElement };

        // Inițializăm sau restaurăm `bonusData` cu valorile salvate sau cu valori implicite
        if (!bonusData[bonusId]) {
            bonusData[bonusId] = {
                progress: 0,
                counter: 0,
                status: false,
            };
        }
    });

    loadFromLocalStorage();
    updateProgressMax();
    updateBonusVisibility();
    startAllChallenges();

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
