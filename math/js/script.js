let correctAnswer; // Răspunsul corect al exercițiului curent
let attempts = 0; // Numărul de încercări pentru exercițiul curent
let bonusTracker = { adunare: 0, scadere: 0 }; // Urmărește progresul pentru bonusuri specifice
let numbersUsed = new Set(); // Pentru a urmări numerele utilizate în exerciții
let exerciseCount = 0;
let consecutiveCorrect = 0; // Contor pentru exerciții rezolvate corect consecutiv

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
    if (isNaN(userAnswer)) {
        document.getElementById("message").textContent = "Te rog să introduci un răspuns valid.";
        return;
    }
    attempts++; // Incrementăm numărul de încercări

    if (userAnswer === correctAnswer) {
        consecutiveCorrect++;
        exerciseCount++;
        document.getElementById("exerciseCount").textContent = exerciseCount;
        updateNumbersUsed(document.getElementById("exercise").textContent);
        document.getElementById("message").textContent = "Corect! Felicitări.";
        addExerciseToHistory(true); // Adaugă exercițiul cu indicarea că este corect
        checkAndDisplayBonus();
        generateExercise(); // Generează un nou exercițiu
    } else if (attempts < 2) {
        document.getElementById("message").textContent = "Incorect. Mai ai o încercare!";
    } else {
        document.getElementById("message").textContent = "Incorect. Vei avea mai mult succes data viitoare!";
        addExerciseToHistory(false); // Adaugă exercițiul cu indicarea că este incorect
        consecutiveCorrect = 0; // Resetează contorul pentru corecte consecutive
        generateExercise(); // Generează un nou exercițiu
    }
}

function checkAndDisplayBonus() {
    // Această funcție verifică dacă condițiile pentru bonusuri sunt îndeplinite și afișează bonusurile corespunzătoare
    const exerciseType = document.getElementById("exercise").textContent.includes("+") ? "adunare" : "scadere";
    if (bonusTracker[exerciseType] === 10) {
        displayBonus(exerciseType); // Afișează bonusul corespunzător
        bonusTracker[exerciseType] = 0; // Resetează tracker-ul după acordarea bonusului
    }
    if (numbersUsed.size === 20) {
        displayBonus("aventurierNumeric");
        numbersUsed.clear(); // Resetează setul după acordarea bonusului
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

    historyContainer.appendChild(listItem); // Adaugă elementul la lista de istoric
}

function updateNumbersUsed(exerciseText) {
    const numbers = exerciseText.match(/\d+/g).map(Number);
    numbers.forEach(number => numbersUsed.add(number));
}

function displayBonus(bonusType) {
    let imagePath;
    switch (bonusType) {
        case "adunare":
            imagePath = "images/maestrul-adunarii.webp";
            bonusTracker["adunare"] = 0; // Resetează contorul pentru adunare
            break;
        case "scadere":
            imagePath = "images/virtuozul-scaderii.webp";
            bonusTracker["scadere"] = 0; // Resetează contorul pentru scădere
            break;
        case "aventurierNumeric":
            imagePath = "images/aventurier-numeric.webp";
            numbersUsed.clear(); // Resetează numerele utilizate
            break;
    }

    if (imagePath) {
        const imgElement = document.createElement("img");
        imgElement.src = imagePath;
        imgElement.alt = "Bonus";
        imgElement.classList.add("bonusImage");
        document.getElementById("bonusContainer").appendChild(imgElement);
    }
}

document.getElementById("answer").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

generateExercise();
