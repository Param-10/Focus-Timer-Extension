let currentTimer;
let paused = false;
let remainingTime = 0;
let timerName = ""; // To keep track of which timer is currently running
let startTime; // Variable to track when the timer started

const FOCUS_DURATION = 25 * 60 * 1000; // 25 minutes in milliseconds
const BREAK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function startFocusSession(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000;
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
            // Set remaining time for break but do not start it automatically
            chrome.runtime.sendMessage({
                action: 'updateTimer',
                time: formatTime(5 * 60) // Show the break time
            });
            remainingTime = 5 * 60; // Set break time
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
    remainingTime = duration * 1000;
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
            // Set remaining time for focus but do not start it automatically
            chrome.runtime.sendMessage({
                action: 'updateTimer',
                time: formatTime(25 * 60) // Show the focus time
            });
            remainingTime = 25 * 60; // Set focus time
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

function startTimer(duration, name) {
    clearInterval(currentTimer);
    timerDuration = duration;
    timerName = name;
    isPaused = false;
    remainingTime = duration;

    currentTimer = setInterval(() => {
        if (!isPaused) {
            remainingTime--;
            chrome.runtime.sendMessage({
                action: 'updateTimer',
                time: formatTime(remainingTime)
            });

            if (remainingTime <= 0) {
                clearInterval(currentTimer);
                chrome.runtime.sendMessage({
                    action: 'timerComplete',
                    message: name === 'focusTimer' ? 'Focus session complete! Time for a break.' : 'Break time over! Time to focus.'
                });

                // Set remaining time for the other timer but do not start it automatically
                if (name === 'focusTimer') {
                    chrome.runtime.sendMessage({
                        action: 'updateTimer',
                        time: formatTime(5 * 60) // Show the break time
                    });
                    remainingTime = 5 * 60; // Set break time
                } else if (name === 'breakTimer') {
                    chrome.runtime.sendMessage({
                        action: 'updateTimer',
                        time: formatTime(25 * 60) // Show the focus time
                    });
                    remainingTime = 25 * 60; // Set focus time
                }
            }
        }
    }, 1000);
}

function pauseTimer() {
    paused = true;
}

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

function resetTimer() {
    clearInterval(currentTimer);
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
        let timeLeft = Math.round(remainingTime / 1000);
        sendResponse({ time: formatTime(timeLeft) });
    }
    return true; // Keep the message channel open for asynchronous response
});