let timerDisplay = document.getElementById('timer');
let messageDisplay = document.getElementById('message');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let pauseBtn = document.getElementById('pause');
let resumeBtn = document.getElementById('resume');
let resetBtn = document.getElementById('reset');

let alertSound = new Audio(chrome.runtime.getURL('sounds/alert.mp3'));
let timerName = ""; // To keep track of which timer is currently running

function startTimer(duration, timerNameParam) {
    timerName = timerNameParam; // Set the timerName to keep track of which timer is running
    chrome.runtime.sendMessage({
        action: timerNameParam === 'focusTimer' ? 'startFocus' : 'startBreak',
        duration: duration
    }, response => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
            if (timerDisplay) timerDisplay.textContent = 'Error starting timer';
        } else {
            console.log('Timer started:', timerNameParam);
            if (timerDisplay) timerDisplay.textContent = formatTime(duration);
        }
    });
}

function pauseTimer() {
    chrome.runtime.sendMessage({ action: 'pause' }, response => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
        } else {
            console.log('Timer paused');
        }
    });
}

function resumeTimer() {
    chrome.runtime.sendMessage({ action: 'resume' }, response => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
        } else {
            console.log('Timer resumed');
        }
    });
}

function resetTimer() {
    chrome.runtime.sendMessage({ action: 'reset' }, response => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
        } else {
            console.log('Timer reset');
            chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
                let defaultFocusTime = formatTime(data.focusDuration || 25 * 60);
                let defaultBreakTime = formatTime(data.breakDuration || 5 * 60);
                if (timerDisplay) timerDisplay.textContent = (timerName === 'focusTimer') ? defaultFocusTime : defaultBreakTime;
            });
        }
    });
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

startFocusBtn.addEventListener('click', () => {
    chrome.storage.sync.get('focusDuration', (data) => {
        startTimer(data.focusDuration || 25 * 60, 'focusTimer');
        if (messageDisplay) messageDisplay.textContent = ''; // Clear any existing message
    });
});

startBreakBtn.addEventListener('click', () => {
    chrome.storage.sync.get('breakDuration', (data) => {
        startTimer(data.breakDuration || 5 * 60, 'breakTimer');
        if (messageDisplay) messageDisplay.textContent = ''; // Clear any existing message
    });
});

pauseBtn.addEventListener('click', () => {
    pauseTimer();
});

resumeBtn.addEventListener('click', () => {
    resumeTimer();
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
        let defaultFocusTime = formatTime(data.focusDuration || 25 * 60);
        let defaultBreakTime = formatTime(data.breakDuration || 5 * 60);
        if (timerDisplay) {
            timerDisplay.textContent = (timerName === 'focusTimer') ? defaultFocusTime : defaultBreakTime;
        }
    });
});

// Function to play sound
function playSound() {
    alertSound.play();
}

// Listen for messages from background script to update the timer and play sound
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'playSound') {
        playSound();
        sendResponse({ status: 'sound played' });
    } else if (request.action === "updateTimer") {
        if (timerDisplay) {
            timerDisplay.textContent = request.time;
        }
    } else if (request.action === "timerComplete") {
        if (messageDisplay) {
            messageDisplay.textContent = request.message;
        }
        playSound();

        // Automatically start the next timer (focus or break)
        if (timerName === 'focusTimer') {
            startTimer(5 * 60, 'breakTimer'); // Start a 5-minute break
        } else if (timerName === 'breakTimer') {
            startTimer(25 * 60, 'focusTimer'); // Start a 25-minute focus session
        }
    }
});