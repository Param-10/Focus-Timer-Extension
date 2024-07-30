let currentTimer;
let paused = false;
let remainingTime = 0;
let timerName = ""; // To keep track of which timer is currently running

function startFocusSession(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000;
    timerName = "focusTimer";
    let endTime = Date.now() + remainingTime;

    function updateTimer() {
        if (paused) {
            remainingTime = endTime - Date.now();
            currentTimer = setTimeout(updateTimer, 1000);
            return;
        }

        let timeLeft = Math.round((endTime - Date.now()) / 1000);

        if (timeLeft <= 0) {
            notifyTimerComplete("Focus Session Complete", "Time for a break!");
            updateStats(10); // Add points for completed focus session
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

function startBreak(duration) {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = duration * 1000;
    timerName = "breakTimer";
    let endTime = Date.now() + remainingTime;

    function updateTimer() {
        if (paused) {
            remainingTime = endTime - Date.now();
            currentTimer = setTimeout(updateTimer, 1000);
            return;
        }

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

function pauseTimer() {
    paused = true;
}

function resumeTimer() {
    paused = false;
    let endTime = Date.now() + remainingTime;
    currentTimer = setTimeout(() => {
        if (remainingTime > 0) {
            if (timerName === "focusTimer") {
                startFocusSession(Math.round(remainingTime / 1000));
            } else if (timerName === "breakTimer") {
                startBreak(Math.round(remainingTime / 1000));
            }
        }
    }, remainingTime);
}

function resetTimer() {
    clearTimeout(currentTimer);
    paused = false;
    remainingTime = 0;
    timerName = ""; // Clear the timer name to indicate no active timer
    chrome.runtime.sendMessage({ action: 'updateTimer', time: '00:00' }); // Reset timer display
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function notifyTimerComplete(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: title,
        message: message
    });
}

function updateStats(points) {
    chrome.storage.sync.get(['points', 'level'], (data) => {
        let newPoints = data.points + points;
        let newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;

        chrome.storage.sync.set({ points: newPoints, level: newLevel }, () => {
            checkAchievements(newPoints, newLevel);
        });
    });
}

function checkAchievements(points, level) {
    const achievements = [
        { name: "Focus Novice", requirement: 50, achieved: false },
        { name: "Focus Intermediate", requirement: 200, achieved: false },
        { name: "Focus Expert", requirement: 500, achieved: false },
        { name: "Focus Master", requirement: 1000, achieved: false }
    ];

    chrome.storage.sync.get(['achievements'], (data) => {
        let userAchievements = data.achievements || [];

        achievements.forEach(achievement => {
            if (points >= achievement.requirement && !userAchievements.includes(achievement.name)) {
                userAchievements.push(achievement.name);
                notifyAchievement(achievement.name);
            }
        });

        chrome.storage.sync.set({ achievements: userAchievements });
    });
}

function notifyAchievement(achievementName) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: "New Achievement!",
        message: `You've earned the "${achievementName}" achievement!`
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startFocus') {
        startFocusSession(request.duration);
    } else if (request.action === 'startBreak') {
        startBreak(request.duration);
    } else if (request.action === 'pause') {
        pauseTimer();
    } else if (request.action === 'resume') {
        resumeTimer();
    } else if (request.action === 'reset') {
        resetTimer();
    }
});