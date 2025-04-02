let score = 0;
let currentNote = '';
let currentOctave = 0;
let hintTimeout = null;
let correctAnswers = 0;
let wrongAnswers = 0;

// Инициализация более реалистичного синтезатора фортепиано
const piano = new Tone.Sampler({
    urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
    },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
        console.log("Звуки фортепиано загружены");
    }
}).toDestination();

// Добавляем реверберацию для более реалистичного звучания
const reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.3
}).toDestination();
piano.connect(reverb);

const notes = [
    { latin: 'C', russian: 'До' },
    { latin: 'C#', russian: 'До-диез' },
    { latin: 'D', russian: 'Ре' },
    { latin: 'D#', russian: 'Ре-диез' },
    { latin: 'E', russian: 'Ми' },
    { latin: 'F', russian: 'Фа' },
    { latin: 'F#', russian: 'Фа-диез' },
    { latin: 'G', russian: 'Соль' },
    { latin: 'G#', russian: 'Соль-диез' },
    { latin: 'A', russian: 'Ля' },
    { latin: 'A#', russian: 'Ля-диез' },
    { latin: 'B', russian: 'Си' }
];

const octaves = [
    { number: 1, name: 'Контр-октава' },
    { number: 2, name: 'Большая октава' },
    { number: 3, name: 'Малая октава' },
    { number: 4, name: 'Первая октава' },
    { number: 5, name: 'Вторая октава' },
    { number: 6, name: 'Третья октава' },
    { number: 7, name: 'Четвертая октава' }
];

function generateRandomNote() {
    const note = notes[Math.floor(Math.random() * notes.length)];
    const octave = octaves[Math.floor(Math.random() * octaves.length)];
    return { note: note.latin, noteRussian: note.russian, octave: octave.number, octaveName: octave.name };
}

function updateCurrentNote() {
    // Сбрасываем предыдущую подсказку, если она есть
    if (hintTimeout) {
        clearTimeout(hintTimeout);
        document.querySelectorAll('.key.hint').forEach(key => key.classList.remove('hint'));
    }

    const { note, noteRussian, octave, octaveName } = generateRandomNote();
    currentNote = note;
    currentOctave = octave;
    document.querySelector('.current-note').textContent = `${note}${octave} (${noteRussian}) - ${octaveName}`;
}

function showHint() {
    // Сбрасываем предыдущую подсказку, если она есть
    if (hintTimeout) {
        clearTimeout(hintTimeout);
        document.querySelectorAll('.key.hint').forEach(key => key.classList.remove('hint'));
    }

    // Находим нужную клавишу
    const targetKey = document.querySelector(`.key[data-note="${currentNote}"][data-octave="${currentOctave}"]`);
    if (targetKey) {
        targetKey.classList.add('hint');
        
        // Убираем подсветку через 2 секунды
        hintTimeout = setTimeout(() => {
            targetKey.classList.remove('hint');
        }, 2000);
    }
}

function checkNote(note, octave) {
    // Воспроизводим звук при нажатии клавиши
    const noteName = note + octave;
    piano.triggerAttackRelease(noteName, "4n");

    if (note === currentNote && octave === currentOctave) {
        score += 1;
        correctAnswers += 1;
        document.querySelector('.score').textContent = `Счет: ${score}`;
        updateStats();
        updateCurrentNote();
    } else {
        wrongAnswers += 1;
        updateStats();
    }
}

function updateStats() {
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('wrong-answers').textContent = wrongAnswers;
    
    const totalAnswers = correctAnswers + wrongAnswers;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers * 100).toFixed(1) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function resetScore() {
    // Сбрасываем подсказку при сбросе счета
    if (hintTimeout) {
        clearTimeout(hintTimeout);
        document.querySelectorAll('.key.hint').forEach(key => key.classList.remove('hint'));
    }
    
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    document.querySelector('.score').textContent = `Счет: ${score}`;
    updateStats();
    updateCurrentNote();
}

function scalePiano() {
    const piano = document.querySelector('.piano');
    const container = document.querySelector('.container');
    const containerWidth = container.clientWidth - 40; // Учитываем padding
    const scale = Math.min(containerWidth / 4200, 1);
    piano.style.setProperty('--piano-scale', scale);
}

// Добавляем обработчики событий для клавиш
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => {
        key.classList.add('pressed');
    });

    key.addEventListener('mouseup', () => {
        key.classList.remove('pressed');
    });

    key.addEventListener('mouseleave', () => {
        key.classList.remove('pressed');
    });

    key.addEventListener('click', () => {
        const note = key.getAttribute('data-note');
        const octave = parseInt(key.getAttribute('data-octave'));
        checkNote(note, octave);
    });
});

// Масштабируем пианино при загрузке и изменении размера окна
window.addEventListener('load', () => {
    updateCurrentNote();
    scalePiano();
});

window.addEventListener('resize', scalePiano); 