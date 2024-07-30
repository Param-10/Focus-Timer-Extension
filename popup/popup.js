let timerDisplay = document.getElementById('timer');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let pauseBtn = document.getElementById('pause');
let resumeBtn = document.getElementById('resume');
let resetBtn = document.getElementById('reset');
let levelDisplay = document.getElementById('level');
let pointsDisplay = document.getElementById('points');
let achievementList = document.getElementById('achievementList');
let alertSound = document.getElementById('alertSound');

let timerName = ""; // To keep track of which timer is currently running

function updateStats() {
    chrome.storage.sync.get(['level', 'points', 'achievements'], (data) => {
        levelDisplay.textContent = data.level || 1;
        pointsDisplay.textContent = data.points || 0;
        updateAchievements(data.achievements || []);
    });
}

function updateAchievements(achievements) {
    achievementList.innerHTML = '';
    if (Array.isArray(achievements) && achievements.length > 0) {
        achievements.forEach(achievement => {
            let li = document.createElement('li');
            li.textContent = achievement;
            achievementList.appendChild(li);
        });
    } else {
        let li = document.createElement('li');
        li.textContent = 'No achievements yet';
        achievementList.appendChild(li);
    }
}

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
    updateStats();
    chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
        let defaultFocusTime = formatTime(data.focusDuration || 25 * 60);
        let defaultBreakTime = formatTime(data.breakDuration || 5 * 60);
        timerDisplay.textContent = (timerName === 'focusTimer') ? defaultFocusTime : defaultBreakTime;
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateTimer") {
        timerDisplay.textContent = request.time;
    } else if (request.action === "timerComplete") {
        alertSound.play();
        chrome.notifications.create('timerComplete', {
            type: 'basic',
            iconUrl: 'icon128.png',
            title: 'Time is up!',
            message: request.message
        });
    }
});