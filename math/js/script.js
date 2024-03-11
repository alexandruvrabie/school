let correctAnswer; // Răspunsul corect al exercițiului curent
let attempts = 0; // Numărul de încercări pentru exercițiul curent
let bonusTracker = {}; // Urmărește progresul pentru bonusuri specifice
let numbersUsed = new Set(); // Pentru a urmări numerele utilizate în exerciții
let exerciseCount = 0;
let speedChallengeTimer; // Cronometru pentru provocarea de viteză
let speedChallengeStart; // Timpul de start al provocării curente
let exercisesSolvedInChallenge = 0; // Numărul de exerciții rezolvate în provocarea curentă
let bonusStatus = {};
let exercisesHistory = []; // Inițializăm lista de istoric a exercițiilor
const historyContainer = document.getElementById("exerciseList");
let soundEnabled = true;
let maxNumber = 20;
let bonusCounters = {};
let lastProblems = []; // Va stoca ultimele probleme generate sub forma de string-uri
let operationType = 'addition_subtraction'
let lastResults = []; // Inițializează o nouă listă pentru a urmări ultimele rezultate
const historyLimit = 3; // Numărul de rezultate unice pe care dorim să le urmărim
let bonusElements = {}; // Obiect pentru a stoca referințele la elementele bonusurilor

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

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value, 10);
    const exerciseText = document.getElementById("exercise").textContent;
    const exerciseType = exerciseText.includes("+") ? "bonusMaestruAdunarii" : "bonusVirtuozulScaderii";

    // Verifică dacă răspunsul este un număr
    if (isNaN(userAnswer)) {
        displayMessage("Te rog să introduci un număr.", "error");
        return;
    }

    attempts++; // Incrementăm numărul de încercări

    if (userAnswer === correctAnswer) {
        bonusTracker[exerciseType]++;
        bonusTracker.bonusPersistentaAbsoluta++;
        bonusTracker.bonusMaestruPreciziei++;
        bonusTracker.bonusLantulSuccesului++;
        bonusTracker.bonusVartejulIntelepciunii++;
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
        bonusTracker.bonusMaestruPreciziei = 0;
        bonusTracker.bonusLantulSuccesului = 0;
        bonusTracker.bonusVartejulIntelepciunii = 0;
        updateProgress('bonusMaestruPreciziei', bonusTracker.bonusMaestruPreciziei);
        updateProgress('bonusLantulSuccesului', bonusTracker.bonusLantulSuccesului);
        updateProgress('bonusVartejulIntelepciunii', bonusTracker.bonusVartejulIntelepciunii);
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
    updateProgress('bonusMaestruAdunarii', bonusTracker.bonusMaestruAdunarii); // pentru adunare
    updateProgress('bonusVirtuozulScaderii', bonusTracker.bonusVirtuozulScaderii); // pentru scădere
    updateProgress('bonusAventurierNumeric', numbersUsed.size); // pentru numere utilizate
    updateProgress('bonusMaestruPreciziei', bonusTracker.bonusMaestruPreciziei);
    updateProgress('bonusLantulSuccesului', bonusTracker.bonusLantulSuccesului);
    updateProgress('bonusVartejulIntelepciunii', bonusTracker.bonusVartejulIntelepciunii);
    updateProgress('bonusPersistentaAbsoluta', bonusTracker.bonusPersistentaAbsoluta);

    // Maestru al Preciziei
    if (bonusTracker.bonusMaestruPreciziei >= 20) {
        bonusStatus.bonusMaestruPreciziei = true;
        bonusCounters.bonusMaestruPreciziei++;
        createFallingEffect();
        showBonusCompletedPopup('bonusMaestruPreciziei');
        bonusTracker.bonusMaestruPreciziei = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Lantul Succesului
    if (bonusTracker.bonusLantulSuccesului >= 50) {
        bonusStatus.bonusLantulSuccesului = true;
        bonusCounters.bonusLantulSuccesului++;
        createFallingEffect();
        showBonusCompletedPopup('bonusLantulSuccesului');
        bonusTracker.bonusLantulSuccesului = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Vartejul Intelepciunii
    if (bonusTracker.bonusVartejulIntelepciunii >= 100) {
        bonusStatus.bonusVartejulIntelepciunii = true;
        bonusCounters.bonusVartejulIntelepciunii++;
        createFallingEffect();
        showBonusCompletedPopup('bonusVartejulIntelepciunii');
        bonusTracker.bonusVartejulIntelepciunii = 0; // Resetează contorul după ce bonusul este acordat
    }
    // Resetarea tracker-ului la completarea bonusului
    if (bonusTracker.bonusMaestruAdunarii >= maxAdunare) {
        bonusStatus.bonusMaestruAdunarii = true;
        bonusCounters.bonusMaestruAdunarii++;
        createFallingEffect();
        showBonusCompletedPopup('bonusMaestruAdunarii');
        bonusTracker.bonusMaestruAdunarii = 0;
    }
    if (bonusTracker.bonusVirtuozulScaderii >= maxScadere) {
        bonusStatus.bonusVirtuozulScaderii = true;
        bonusCounters.bonusVirtuozulScaderii++;
        createFallingEffect();
        showBonusCompletedPopup('bonusVirtuozulScaderii');
        bonusTracker.bonusVirtuozulScaderii = 0;
    }
    if (bonusTracker.bonusPersistentaAbsoluta >= 500) {
        bonusStatus.bonusPersistentaAbsoluta = true;
        bonusCounters.bonusPersistentaAbsoluta++;
        createFallingEffect();
        showBonusCompletedPopup('bonusPersistentaAbsoluta');
        bonusTracker.bonusPersistentaAbsoluta = 0;
    }
    if (numbersUsed.size >= maxNumber) {
        bonusStatus.bonusAventurierNumeric = true;
        bonusCounters.bonusAventurierNumeric++;
        createFallingEffect();
        showBonusCompletedPopup('bonusAventurierNumeric');
        bonusTracker.bonusAventurierNumeric = 0;
        numbersUsed.clear();
    }
    saveToLocalStorage(); // Salvăm starea curentă după verificarea bonusurilor
    updateUIForCounters();
}

function updateUIForCounters() {
    // Iterează prin obiectul bonusElements pentru a actualiza contoarele
    Object.keys(bonusElements).forEach(bonusId => {
        // Asigură că avem un counter pentru acest tip de bonus înainte de a încerca să actualizăm UI-ul
        if (bonusCounters.hasOwnProperty(bonusId)) {
            const counterValue = bonusCounters[bonusId];
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
    bonusTracker.bonusAventurierNumeric = numbersUsed.size;
}

function updateProgress(bonusId, progress) {
    // Identifică elementul bonus direct folosind bonusId
    const bonusItem = document.getElementById(bonusId);

    if (bonusItem) {
        // Folosește querySelector pentru a găsi elementul progress și imaginea în cadrul containerului bonusului
        const progressElement = bonusItem.querySelector('.bonusProgress');
        const image = bonusItem.querySelector('.bonusImage');

        if (progressElement) {
            progressElement.value = progress ?? 0; // Actualizează progresul

            // Verifică dacă progresul este complet.
            if (progress >= progressElement.max) {
                // Înlătură opacitatea pentru bonus completat
                if (image) {
                    image.style.opacity = 1;
                    applyGlowEffect(image); // Aplică efectul de licărire pe imagine
                }
            }
        }
    }
}

function updateAllProgress() {
    // Iterează prin toate elementele de bonus și actualizează progresul
    Object.keys(bonusTracker).forEach(bonusId => {
        // Presupunând că există o corespondență directă între ID-ul bonusului în bonusTracker și ID-ul elementului în DOM
        updateProgress(bonusId, bonusTracker[bonusId]);
    });
}

// Funcția pentru a începe sau a reporni provocarea de viteză
function startSpeedChallenge() {
    // Resetăm contorul de exerciții și barul de progres la începutul fiecărei provocări
    exercisesSolvedInChallenge = 0;
    updateProgress('bonusVitezaLuminii', 0);

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
    const errorSound = document.getElementById('errorSound');
    if (errorSound) {
        errorSound.play();
    }
}

function applyGlowEffect(element) {
    if (element && element.classList) {
        element.classList.add('glowEffect');
        setTimeout(() => {
            element.classList.remove('glowEffect');
        }, 5000); // 5000ms = 5 secunde
    } else {
        console.error('Elementul nu a fost găsit sau nu este valid:', element);
    }
}

// Funcția care este apelată la fiecare răspuns corect al utilizatorului
function incrementExercisesSolvedInChallenge() {
    const maxExercises = 10;
    exercisesSolvedInChallenge++;
    // Găsește containerul bonusului pentru Viteza Luminii
    const bonusVitezaLuminii = document.getElementById("bonusVitezaLuminii");

    if (bonusVitezaLuminii) {
        // Folosește querySelector pentru a găsi elementul progress în cadrul containerului bonusului
        const progressElement = bonusVitezaLuminii.querySelector('.bonusProgress');
        if (progressElement) {
            progressElement.value = exercisesSolvedInChallenge;

            if (exercisesSolvedInChallenge >= maxExercises) {
                console.log("Provocarea Viteza Luminii completată cu succes!");

                // Găsește imaginea în cadrul containerului bonusului și actualizează-i opacitatea
                const bonusImage = bonusVitezaLuminii.querySelector('.bonusImage');
                if (bonusImage) {
                    applyGlowEffect(bonusImage);
                    bonusImage.style.opacity = 1;
                }

                bonusStatus.bonusVitezaLuminii = true;
                bonusCounters.bonusVitezaLuminii++;
                createFallingEffect();
                showBonusCompletedPopup('bonusVitezaLuminii');

                clearInterval(speedChallengeTimer);
                startSpeedChallenge();
                // Resetează contorul pentru a începe din nou provocarea
                exercisesSolvedInChallenge = 0;
                progressElement.value = 0;
            }
        }
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
        Object.assign(bonusTracker, appData.bonusTracker);
        Object.assign(bonusStatus, appData.bonusStatus);
        Object.assign(bonusCounters, appData.bonusCounters);
        bonusStatus = appData.bonusStatus || bonusStatus;
        numbersUsed = new Set(appData.numbersUsed ?? []);
        exerciseCount = appData.exerciseCount ?? 0;
        exercisesSolvedInChallenge = appData.exercisesSolvedInChallenge ?? 0;

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
    Object.keys(bonusStatus).forEach(bonusId => {
        if (bonusStatus[bonusId]) {
            const bonusElement = document.getElementById(bonusId);
            if (bonusElement) {
                bonusElement.querySelector('.bonusImage').style.opacity = 1;
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
    const bonusAventurierNumeric = document.querySelector('#bonusAventurierNumeric .bonusProgress');
    if (bonusAventurierNumeric) {
        bonusAventurierNumeric.max = maxNumber;
    }
}

function showBonusCompletedPopup(bonusId) {
    // Identifică elementul bonusItem folosind ID-ul primit
    const bonusItem = document.getElementById(bonusId);
    if (!bonusItem) {
        console.error('Bonus item not found for ID:', bonusId);
        return;
    }

    // Extrage titlul bonusului și sursa imaginii direct din elementul bonusItem
    const title = bonusItem.querySelector('.bonusTitle').textContent;
    const imageSrc = bonusItem.querySelector('.bonusImage').src;

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
// Adăugați listeneri pentru inputuri pentru a actualiza intervalul la schimbare
document.getElementById('maxNumberSelect').addEventListener('change', updateRange);
document.getElementById('operationTypeSelect').addEventListener('change', updateRange);

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
        const counterSpan = item.querySelector('span');
        const image = item.querySelector('img');

        // Stochează referințele la elementele necesare în obiectul bonusElements, folosind ID-ul bonusului ca cheie
        bonusElements[bonusId] = { counterSpan, image };
        bonusTracker[bonusId] = 0;
        bonusCounters[bonusId] = 0;
        bonusStatus[bonusId] = false;
    });

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
