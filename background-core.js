let currentTimer;
let paused = false;
let remainingTime = 0;
let timerName = ""; // To keep track of which timer is currently running
let startTime; // Variable to track when the timer started

const FOCUS_DURATION = 25 * 60 * 1000; // 25 minutes in milliseconds
const BREAK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to start a focus session
function startFocusSession(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000;
    timerName = "focusTimer";
    startTime = Date.now();
    let endTime = startTime + remainingTime;

    function updateTimer() {
        if (paused) return;

        let timeLeft = Math.round((endTime - Date.now()) / 1000);

        if (timeLeft <= 0) {
            notifyTimerComplete("Focus Session Complete", "Time for a break!");
            startBreak(5 * 60); // Start a 5-minute break automatically
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

// Function to start a break session
function startBreak(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000;
    timerName = "breakTimer";
    startTime = Date.now();
    let endTime = startTime + remainingTime;

    function updateTimer() {
        if (paused) return;

        let timeLeft = Math.round((endTime - Date.now()) / 1000);

        if (timeLeft <= 0) {
            notifyTimerComplete("Break Time Over", "Back to work!");
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

// Function to pause the timer
function pauseTimer() {
    paused = true;
    clearTimeout(currentTimer);
    remainingTime = Math.max(0, remainingTime - (Date.now() - startTime));
}

// Function to resume the timer
function resumeTimer() {
    if (!paused) return; // Don't resume if not paused

    paused = false;
    startTime = Date.now();

    if (remainingTime > 0) {
        if (timerName === "focusTimer") {
            startFocusSession(Math.round(remainingTime / 1000));
        } else if (timerName === "breakTimer") {
            startBreak(Math.round(remainingTime / 1000));
        }
    }
}

// Function to reset the timer
function resetTimer() {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = 0;

    // Determine which timer was running and reset to its default
    if (timerName === "focusTimer") {
        remainingTime = FOCUS_DURATION;
        chrome.runtime.sendMessage({ action: 'updateTimer', time: formatTime(FOCUS_DURATION / 1000) });
    } else if (timerName === "breakTimer") {
        remainingTime = BREAK_DURATION;
        chrome.runtime.sendMessage({ action: 'updateTimer', time: formatTime(BREAK_DURATION / 1000) });
    }

    timerName = ""; // Clear the timer name to indicate no active timer
}

// Function to format time into MM:SS format
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Function to send a notification when the timer completes
function notifyTimerComplete(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png", // Make sure this path is correct
        title: title,
        message: message
    });
    // Send a message to content script or popup to play sound
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'playSound' });
    });
}

// Listener for messages from other parts of the extension
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
    }
    // Ensure that sendResponse is called
    return true; // Keep the message channel open for asynchronous response
});