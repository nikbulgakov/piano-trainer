let score = 0;
let currentNote = '';
let currentOctave = 0;
let hintTimeout = null;

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
    if (note === currentNote && octave === currentOctave) {
        score += 1;
        document.querySelector('.score').textContent = `Счет: ${score}`;
        updateCurrentNote();
    }
}

function resetScore() {
    // Сбрасываем подсказку при сбросе счета
    if (hintTimeout) {
        clearTimeout(hintTimeout);
        document.querySelectorAll('.key.hint').forEach(key => key.classList.remove('hint'));
    }
    
    score = 0;
    document.querySelector('.score').textContent = `Счет: ${score}`;
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