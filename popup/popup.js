let timerDisplay = document.getElementById('timer');
let messageDisplay = document.getElementById('message');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let pauseBtn = document.getElementById('pause');
let resumeBtn = document.getElementById('resume');
let resetBtn = document.getElementById('reset');
let focusDurationInput = document.getElementById('focusDuration');
let breakDurationInput = document.getElementById('breakDuration');
let saveSettingsBtn = document.getElementById('saveSettings');

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

function saveSettings() {
    let focusDuration = parseInt(focusDurationInput.value) * 60; // Convert to seconds
    let breakDuration = parseInt(breakDurationInput.value) * 60; // Convert to seconds

    chrome.storage.sync.set({
        focusDuration: focusDuration,
        breakDuration: breakDuration
    }, function() {
        console.log('Settings saved');
        // Update the timer display
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(focusDuration);
        }
    });
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

saveSettingsBtn.addEventListener('click', saveSettings);

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
        let defaultFocusTime = data.focusDuration || 25 * 60;
        let defaultBreakTime = data.breakDuration || 5 * 60;

        focusDurationInput.value = Math.floor(defaultFocusTime / 60);
        breakDurationInput.value = Math.floor(defaultBreakTime / 60);

        if (timerDisplay) {
            timerDisplay.textContent = formatTime(defaultFocusTime);
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
        chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
            if (timerName === 'focusTimer') {
                startTimer(data.breakDuration || 5 * 60, 'breakTimer');
            } else if (timerName === 'breakTimer') {
                startTimer(data.focusDuration || 25 * 60, 'focusTimer');
            }
        });
    }
});