// Conținutul fișierului win.js

let soundEnabled = false;

document.addEventListener('DOMContentLoaded', function() {
    // Inițializarea stării butonului de sunet la încărcarea paginii
    var soundButton = document.getElementById('enableSoundButton');
    soundButton.src = 'images/sound-off-icon.png'; // Iconița pentru sunet dezactivat
    soundButton.style.display = 'block';

    soundButton.addEventListener('click', function() {
        soundEnabled = !soundEnabled; // Comută starea sunetului
        this.src = soundEnabled ? 'images/sound-on-icon.png' : 'images/sound-off-icon.png'; // Actualizează iconița în funcție de starea sunetului
    });
});

function playWinSound() {
    if (soundEnabled) {
        var winSound = document.getElementById('winSound');
        if (winSound) {
            winSound.play();
        }
    }
}

function createFallingEffect() {
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        document.body.appendChild(star);
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${-Math.random() * 100}px`; // Asigură că stelele încep deasupra viewport-ului
        star.style.animationDelay = `${Math.random() * 2}s`;
    }

    for (let i = 0; i < 10; i++) {
        const ribbon = document.createElement('div');
        ribbon.className = 'ribbon';
        document.body.appendChild(ribbon);
        ribbon.style.left = `${Math.random() * 100}vw`;
        ribbon.style.top = `${-Math.random() * 100}px`; // Asigură că panglicile încep deasupra viewport-ului
        ribbon.style.animationDelay = `${Math.random() * 2}s`;
    }

    let winSound = document.getElementById('winSound');
    if (winSound && soundEnabled) {
        playWinSound(); // Opțional: Redă un sunet imediat ca feedback
    }
}

