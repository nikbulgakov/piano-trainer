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

// Настройки для скрипичного ключа
const trebleClefSettings = {
    baseY: 110,  // Базовая Y-координата для C4
    firstLineY: 60,  // Y-координата первой линейки
    lastLineY: 100,  // Y-координата последней линейки
    lineSpacing: 10,  // Расстояние между линейками
    noteOffsets: {
        'C': 0,     // До - на первой добавочной линейке снизу (C4)
        'D': -5,    // Ре - между первой основной и первой добавочной
        'E': -10,   // Ми - на первой линейке
        'F': -15,   // Фа - между первой и второй линейками
        'G': -20,   // Соль - на второй линейке
        'A': -25,   // Ля - между второй и третьей линейками
        'B': -30    // Си - на третьей линейке
    }
};

// Настройки для басового ключа
const bassClefSettings = {
    firstLineY: 30,  // Первая линейка (Ля малой октавы)
    lastLineY: 70,   // Пятая линейка
    lineSpacing: 10, // Расстояние между линейками
    baseY: 25,       // Базовая Y-координата для Си малой октавы (над первой линейкой)
    noteOffsets: {   // Смещения для каждой ноты относительно базовой позиции
        'B': 0,      // Си малой октавы (над первой линейкой)
        'A': 5,      // Ля малой октавы (на первой линейке)
        'G': 10,     // Соль малой октавы (между первой и второй линейками)
        'F': 15,     // Фа малой октавы (на второй линейке)
        'E': 20,     // Ми малой октавы (между второй и третьей линейками)
        'D': 25,     // Ре малой октавы (на третьей линейке)
        'C': 30      // До малой октавы (между третьей и четвертой линейками)
    }
};

// Функция для определения диапазона октав в зависимости от активного ключа
function getOctaveRange() {
    const isTrebleClef = document.getElementById('treble-clef').classList.contains('active');
    if (isTrebleClef) {
        return [4, 5, 6]; // Первая, вторая и третья октавы для скрипичного ключа
    } else {
        return [1, 2, 3]; // Контр, большая и малая октавы для басового ключа
    }
}

// Функция для генерации случайной ноты
function generateRandomNote() {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const availableOctaves = getOctaveRange();
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const randomOctave = availableOctaves[Math.floor(Math.random() * availableOctaves.length)];
    return { note: randomNote, octave: randomOctave };
}

function positionNoteOnStave(note, octave) {
    const noteElement = document.querySelector('.note');
    const additionalLinesContainer = document.getElementById('additional-lines');
    
    // Очищаем предыдущие дополнительные линейки
    additionalLinesContainer.innerHTML = '';
    
    const isTrebleClef = document.getElementById('treble-clef').classList.contains('active');
    
    if (isTrebleClef) {
        positionNoteInTrebleClef(note, octave, noteElement, additionalLinesContainer);
    } else {
        positionNoteInBassClef(note, octave, noteElement, additionalLinesContainer);
    }
}

function positionNoteInTrebleClef(note, octave, noteElement, additionalLinesContainer) {
    const settings = trebleClefSettings;
    
    // Смещение для диезов - остаются на той же высоте, что и их натуральные ноты
    settings.noteOffsets['C#'] = settings.noteOffsets['C'];
    settings.noteOffsets['D#'] = settings.noteOffsets['D'];
    settings.noteOffsets['F#'] = settings.noteOffsets['F'];
    settings.noteOffsets['G#'] = settings.noteOffsets['G'];
    settings.noteOffsets['A#'] = settings.noteOffsets['A'];
    
    // Смещение для разных октав (35 = 3.5 линейки)
    const octaveOffset = (octave - 4) * -35;
    
    const noteOffset = settings.noteOffsets[note] || 0;
    const totalOffset = settings.baseY + noteOffset + octaveOffset;
    
    // Позиционируем ноту с сохранением поворота
    noteElement.setAttribute('cy', totalOffset);
    noteElement.setAttribute('transform', `rotate(-15, 100, ${totalOffset})`);
    
    // Координаты для дополнительных линеек (чуть длиннее ноты)
    const noteWidth = 15.2; // Ширина ноты (rx * 2)
    const lineExtension = 4; // Дополнительная длина с каждой стороны
    const lineX1 = 100 - (noteWidth/2 + lineExtension);
    const lineX2 = 100 + (noteWidth/2 + lineExtension);
    
    // Если нота выше первой линейки, добавляем линейки сверху
    if (totalOffset < settings.firstLineY) {
        let y = settings.firstLineY - settings.lineSpacing;
        while (y > totalOffset - settings.lineSpacing/2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", lineX1.toString());
            line.setAttribute("y1", y.toString());
            line.setAttribute("x2", lineX2.toString());
            line.setAttribute("y2", y.toString());
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            additionalLinesContainer.appendChild(line);
            y -= settings.lineSpacing;
        }
    }
    
    // Если нота ниже последней линейки, добавляем линейки снизу
    if (totalOffset > settings.lastLineY) {
        let y = settings.lastLineY + settings.lineSpacing;
        while (y < totalOffset + settings.lineSpacing/2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", lineX1.toString());
            line.setAttribute("y1", y.toString());
            line.setAttribute("x2", lineX2.toString());
            line.setAttribute("y2", y.toString());
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            additionalLinesContainer.appendChild(line);
            y += settings.lineSpacing;
        }
    }
}

function positionNoteInBassClef(note, octave, noteElement, additionalLinesContainer) {
    const settings = bassClefSettings;
    
    // Смещение для диезов - остаются на той же высоте, что и их натуральные ноты
    settings.noteOffsets['C#'] = settings.noteOffsets['C'];
    settings.noteOffsets['D#'] = settings.noteOffsets['D'];
    settings.noteOffsets['F#'] = settings.noteOffsets['F'];
    settings.noteOffsets['G#'] = settings.noteOffsets['G'];
    settings.noteOffsets['A#'] = settings.noteOffsets['A'];
    
    // Смещение для разных октав (35 = 3.5 линейки)
    const octaveOffset = (octave - 3) * -35;
    
    const noteOffset = settings.noteOffsets[note] || 0;
    const totalOffset = settings.baseY + noteOffset + octaveOffset;
    
    // Позиционируем ноту с сохранением поворота
    noteElement.setAttribute('cy', totalOffset);
    noteElement.setAttribute('transform', `rotate(-15, 100, ${totalOffset})`);
    
    // Координаты для дополнительных линеек (чуть длиннее ноты)
    const noteWidth = 15.2; // Ширина ноты (rx * 2)
    const lineExtension = 4; // Дополнительная длина с каждой стороны
    const lineX1 = 100 - (noteWidth/2 + lineExtension);
    const lineX2 = 100 + (noteWidth/2 + lineExtension);
    
    // Если нота выше первой линейки, добавляем линейки сверху
    if (totalOffset < settings.firstLineY) {
        let y = settings.firstLineY - settings.lineSpacing;
        while (y > totalOffset - settings.lineSpacing/2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", lineX1.toString());
            line.setAttribute("y1", y.toString());
            line.setAttribute("x2", lineX2.toString());
            line.setAttribute("y2", y.toString());
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            additionalLinesContainer.appendChild(line);
            y -= settings.lineSpacing;
        }
    }
    
    // Если нота ниже последней линейки, добавляем линейки снизу
    if (totalOffset > settings.lastLineY) {
        let y = settings.lastLineY + settings.lineSpacing;
        while (y < totalOffset + settings.lineSpacing/2) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", lineX1.toString());
            line.setAttribute("y1", y.toString());
            line.setAttribute("x2", lineX2.toString());
            line.setAttribute("y2", y.toString());
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            additionalLinesContainer.appendChild(line);
            y += settings.lineSpacing;
        }
    }
}

function updateCurrentNote() {
    const { note, octave } = generateRandomNote();
    currentNote = note;
    currentOctave = octave;
    const noteDisplay = document.querySelector('.current-note');
    const octaveName = octaves.find(o => o.number === octave).name;
    const noteRussian = notes.find(n => n.latin === note).russian;
    noteDisplay.textContent = `${note}${octave} (${noteRussian}) - ${octaveName}`;
    positionNoteOnStave(note, octave);
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
    
    const currentNoteDisplay = document.querySelector('.current-note');
    const pressedNote = note + octave;
    
    if (pressedNote === currentNote + currentOctave) {
        score++;
        correctAnswers++;
        updateStats();
        currentNoteDisplay.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
            currentNoteDisplay.style.backgroundColor = '';
        }, 500);
        updateCurrentNote();
    } else {
        wrongAnswers++;
        updateStats();
        currentNoteDisplay.style.backgroundColor = '#f44336';
        setTimeout(() => {
            currentNoteDisplay.style.backgroundColor = '';
        }, 500);
    }
    document.querySelector('.score').textContent = `Счет: ${score}`;
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
    piano.style.transform = `translateX(-50%) scaleX(${scale})`;
    piano.classList.add('visible');
}

function toggleClef() {
    const trebleClef = document.getElementById('treble-clef');
    const bassClef = document.getElementById('bass-clef');
    const trebleLines = document.getElementById('treble-lines');
    const bassLines = document.getElementById('bass-lines');
    const mainLines = document.querySelectorAll('.stave line:not(.clef line)');
    const mainTexts = document.querySelectorAll('.stave text:not(.clef text)');
    
    if (trebleClef.classList.contains('active')) {
        // Переключаемся на басовый ключ
        trebleClef.classList.remove('active');
        bassClef.classList.add('active');
        trebleLines.classList.remove('active');
        bassLines.classList.add('active');
        
        // Скрываем основные линейки скрипичного ключа
        mainLines.forEach(line => {
            if (parseInt(line.getAttribute('y1')) >= 60) {
                line.style.display = 'none';
            }
        });
        mainTexts.forEach(text => {
            if (parseInt(text.getAttribute('y')) >= 65) {
                text.style.display = 'none';
            }
        });
        
        // Показываем основные линейки басового ключа
        mainLines.forEach(line => {
            if (parseInt(line.getAttribute('y1')) < 60) {
                line.style.display = 'block';
            }
        });
        mainTexts.forEach(text => {
            if (parseInt(text.getAttribute('y')) < 65) {
                text.style.display = 'block';
            }
        });
    } else {
        // Переключаемся на скрипичный ключ
        trebleClef.classList.add('active');
        bassClef.classList.remove('active');
        trebleLines.classList.add('active');
        bassLines.classList.remove('active');
        
        // Показываем основные линейки скрипичного ключа
        mainLines.forEach(line => {
            if (parseInt(line.getAttribute('y1')) >= 60) {
                line.style.display = 'block';
            }
        });
        mainTexts.forEach(text => {
            if (parseInt(text.getAttribute('y')) >= 65) {
                text.style.display = 'block';
            }
        });
        
        // Скрываем основные линейки басового ключа
        mainLines.forEach(line => {
            if (parseInt(line.getAttribute('y1')) < 60) {
                line.style.display = 'none';
            }
        });
        mainTexts.forEach(text => {
            if (parseInt(text.getAttribute('y')) < 65) {
                text.style.display = 'none';
            }
        });
    }
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

// Обработчики для кнопок скрипичного и басового ключей
document.getElementById('startBtn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('stopBtn').classList.remove('active');
    document.getElementById('treble-clef').classList.add('active');
    document.getElementById('bass-clef').classList.remove('active');
    // Генерируем новую ноту при переключении ключа
    const newNote = generateRandomNote();
    updateCurrentNote(newNote.note, newNote.octave);
});

document.getElementById('stopBtn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('startBtn').classList.remove('active');
    document.getElementById('bass-clef').classList.add('active');
    document.getElementById('treble-clef').classList.remove('active');
    // Генерируем новую ноту при переключении ключа
    const newNote = generateRandomNote();
    updateCurrentNote(newNote.note, newNote.octave);
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Активируем скрипичный ключ по умолчанию
    const trebleClef = document.getElementById('treble-clef');
    const bassClef = document.getElementById('bass-clef');
    const trebleLines = document.getElementById('treble-lines');
    const bassLines = document.getElementById('bass-lines');
    const mainLines = document.querySelectorAll('.stave line:not(.clef line)');
    const mainTexts = document.querySelectorAll('.stave text:not(.clef text)');
    
    // Активируем скрипичный ключ
    trebleClef.classList.add('active');
    bassClef.classList.remove('active');
    trebleLines.classList.add('active');
    bassLines.classList.remove('active');
    
    // Показываем основные линейки скрипичного ключа
    mainLines.forEach(line => {
        if (parseInt(line.getAttribute('y1')) >= 60) {
            line.style.display = 'block';
        }
    });
    mainTexts.forEach(text => {
        if (parseInt(text.getAttribute('y')) >= 65) {
            text.style.display = 'block';
        }
    });
    
    // Скрываем основные линейки басового ключа
    mainLines.forEach(line => {
        if (parseInt(line.getAttribute('y1')) < 60) {
            line.style.display = 'none';
        }
    });
    mainTexts.forEach(text => {
        if (parseInt(text.getAttribute('y')) < 65) {
            text.style.display = 'none';
        }
    });
    
    // Активируем кнопку скрипичного ключа
    document.getElementById('startBtn').classList.add('active');
    document.getElementById('stopBtn').classList.remove('active');
    
    // Ждем загрузки всех стилей
    requestAnimationFrame(() => {
        scalePiano();
        updateCurrentNote();
    });
});

window.addEventListener('resize', scalePiano); 