let currentTimer;
let paused = false;
let remainingTime = 0;
let timerName = ""; // To keep track of which timer is currently running
let startTime; // Variable to track when the timer started
let pausedTime; // Variable to track when the timer was paused

let FOCUS_DURATION = 25 * 60 * 1000; // Default 25 minutes in milliseconds
let BREAK_DURATION = 5 * 60 * 1000; // Default 5 minutes in milliseconds

function updateDurations() {
    chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
        FOCUS_DURATION = (data.focusDuration || 25 * 60) * 1000; // Convert to milliseconds
        BREAK_DURATION = (data.breakDuration || 5 * 60) * 1000; // Convert to milliseconds
    });
}

// Call this function when the background script starts
updateDurations();

function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png', // Ensure you have an icon.png in your extension directory
        title: title,
        message: message,
        priority: 2,
        silent: false // Play default notification sound
    });
}

function startFocusSession(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000; // Convert to milliseconds
    timerName = "focusTimer";
    startTime = Date.now();
    let endTime = startTime + remainingTime;

    function updateTimer() {
        if (paused) {
            return;
        }

        let timeLeft = Math.round((endTime - Date.now()) / 1000);

        if (timeLeft <= 0) {
            chrome.runtime.sendMessage({
                action: "timerComplete",
                message: "Focus Session Complete! Time for a break!"
            });
            remainingTime = BREAK_DURATION / 1000; // Prepare for the break timer
            showNotification("Focus Session Complete!", "Time for a break!");
            startBreak(BREAK_DURATION / 1000); // Start break timer
        } else {
            chrome.runtime.sendMessage({
                action: "updateTimer",
                time: formatTime(timeLeft)
            });
            currentTimer = setTimeout(updateTimer, 1000);
        }
    }

    updateTimer();
}

function startBreak(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000; // Convert to milliseconds
    timerName = "breakTimer";
    startTime = Date.now();
    let endTime = startTime + remainingTime;

    function updateTimer() {
        if (paused) {
            return;
        }

        let timeLeft = Math.round((endTime - Date.now()) / 1000);

        if (timeLeft <= 0) {
            chrome.runtime.sendMessage({
                action: "timerComplete",
                message: "Break Time Over! Back to work!"
            });
            remainingTime = FOCUS_DURATION / 1000; // Prepare for the focus timer
            showNotification("Break Time Over!", "Back to work!");
            startFocusSession(FOCUS_DURATION / 1000); // Start focus timer
        } else {
            chrome.runtime.sendMessage({
                action: "updateTimer",
                time: formatTime(timeLeft)
            });
            currentTimer = setTimeout(updateTimer, 1000);
        }
    }

    updateTimer();
}

function pauseTimer() {
    paused = true;
    clearTimeout(currentTimer);
    pausedTime = Date.now();
    remainingTime = Math.max(0, remainingTime - (pausedTime - startTime));
}

function resumeTimer() {
    if (!paused) return; // Don't resume if not paused

    paused = false;
    let pauseDuration = Date.now() - pausedTime;
    startTime = Date.now();

    if (remainingTime > 0) {
        if (timerName === "focusTimer") {
            startFocusSession(Math.ceil(remainingTime / 1000));
        } else if (timerName === "breakTimer") {
            startBreak(Math.ceil(remainingTime / 1000));
        }
    }
}

function resetTimer() {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = 0;

    updateDurations(); // Update durations before resetting

    if (timerName === "focusTimer") {
        remainingTime = FOCUS_DURATION / 1000;
        chrome.runtime.sendMessage({ action: 'updateTimer', time: formatTime(FOCUS_DURATION / 1000) });
    } else if (timerName === "breakTimer") {
        remainingTime = BREAK_DURATION / 1000;
        chrome.runtime.sendMessage({ action: 'updateTimer', time: formatTime(BREAK_DURATION / 1000) });
    }

    timerName = ""; // Clear the timer name to indicate no active timer
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startFocus') {
        startFocusSession(request.duration);
        sendResponse({ status: 'Focus session started' });
    } else if (request.action === 'startBreak') {
        startBreak(request.duration);
        sendResponse({ status: 'Break started' });
    } else if (request.action === 'pause') {
        pauseTimer();
        sendResponse({ status: 'Timer paused' });
    } else if (request.action === 'resume') {
        resumeTimer();
        sendResponse({ status: 'Timer resumed' });
    } else if (request.action === 'reset') {
        resetTimer();
        sendResponse({ status: 'Timer reset' });
    } else if (request.action === 'getTimerStatus') {
        let timeLeft = Math.round(remainingTime);
        sendResponse({ time: formatTime(timeLeft) });
    }
    return true; // Keep the message channel open for asynchronous response
});

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.focusDuration || changes.breakDuration)) {
        updateDurations();
    }
});