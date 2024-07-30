let timerDisplay = document.getElementById('timer');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let pauseBtn = document.getElementById('pause');
let resumeBtn = document.getElementById('resume');
let resetBtn = document.getElementById('reset');

let timerName = ""; // To keep track of which timer is currently running

function startTimer(duration, timerNameParam) {
    timerName = timerNameParam; // Set the timerName to keep track of which timer is running
    chrome.runtime.sendMessage({
        action: timerNameParam === 'focusTimer' ? 'startFocus' : 'startBreak',
        duration: duration
    }, response => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
            timerDisplay.textContent = 'Error starting timer';
        } else {
            console.log('Timer started:', timerNameParam);
            timerDisplay.textContent = formatTime(duration);
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
                timerDisplay.textContent = (timerName === 'focusTimer') ? defaultFocusTime : defaultBreakTime;
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
    });
});

startBreakBtn.addEventListener('click', () => {
    chrome.storage.sync.get('breakDuration', (data) => {
        startTimer(data.breakDuration || 5 * 60, 'breakTimer');
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
        timerDisplay.textContent = (timerName === 'focusTimer') ? defaultFocusTime : defaultBreakTime;
    });
});
// popup.js
let alertSound = new Audio(chrome.runtime.getURL('sounds/alert.mp3'));

function playSound() {
    alertSound.play();
}

// Listen for messages from background script to play the sound
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'playSound') {
        playSound();
        sendResponse({ status: 'sound played' });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTimer") {
        timerDisplay.textContent = request.time;
    } else if (request.action === "timerComplete") {
        chrome.notifications.create('timerComplete', {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Time is up!',
            message: request.message
        });
    }
});