// Conținutul fișierului win.js

function playWinSound() {
    if (soundEnabled) {
        const winSound = document.getElementById('winSound');
        if (winSound) {
            winSound.currentTime = 0; // Resetăm sunetul la început
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

