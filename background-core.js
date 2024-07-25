let currentTimer;
let paused = false;
let remainingTime = 0;

function startFocusSession(duration) {
  clearTimeout(currentTimer);
  paused = false;
  remainingTime = duration * 1000;
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
      startFocusSession(Math.round(remainingTime / 1000));
    }
  }, remainingTime);
}

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function notifyTimerComplete(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: title,
    message: message
  });
}

function updateStats(points) {
  chrome.storage.sync.get(['points', 'level'], (data) => {
    let newPoints = data.points + points;
    let newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
    
    chrome.storage.sync.set({points: newPoints, level: newLevel}, () => {
      checkAchievements(newPoints, newLevel);
    });
  });
}

function checkAchievements(points, level) {
  const achievements = [
    {name: "Focus Novice", requirement: 50, achieved: false},
    {name: "Focus Intermediate", requirement: 200, achieved: false},
    {name: "Focus Expert", requirement: 500, achieved: false},
    {name: "Focus Master", requirement: 1000, achieved: false}
  ];

  chrome.storage.sync.get(['achievements'], (data) => {
    let userAchievements = data.achievements || [];

    achievements.forEach(achievement => {
      if (points >= achievement.requirement && !userAchievements.includes(achievement.name)) {
        userAchievements.push(achievement.name);
        notifyAchievement(achievement.name);
      }
    });

    chrome.storage.sync.set({achievements: userAchievements});
  });
}

function notifyAchievement(achievementName) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: 'New Achievement Unlocked!',
    message: `You've earned the "${achievementName}" badge!`
  });
}

// Mindfulness functionality
const MINDFULNESS_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

function setupMindfulnessReminders() {
  chrome.alarms.create("mindfulnessReminder", {
    periodInMinutes: MINDFULNESS_INTERVAL / 60000
  });
}

function getMindfulnessTip() {
  const tips = [
    "Take a deep breath and focus on the present moment.",
    "Stretch your body and release any tension you feel.",
    "Look away from your screen and focus on a distant object for 20 seconds.",
    "Notice five things you can see, four things you can touch, three things you can hear, two things you can smell, and one thing you can taste.",
    "Take a moment to appreciate something positive in your environment."
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function showMindfulnessNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon48.png',
    title: 'Mindfulness Reminder',
    message: getMindfulnessTip()
  });
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    points: 0,
    level: 1,
    achievements: []
  });
  setupMindfulnessReminders();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "mindfulnessReminder") {
    showMindfulnessNotification();
  }
});

// In background-core.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startFocus") {
    startFocusSession(request.duration);
    sendResponse({status: "Focus session started"});
  } else if (request.action === "startBreak") {
    startBreak(request.duration);
    sendResponse({status: "Break started"});
  } else if (request.action === "pause") {
    pauseTimer();
    sendResponse({status: "Timer paused"});
  } else if (request.action === "resume") {
    resumeTimer();
    sendResponse({status: "Timer resumed"});
  }
});

console.log("Background script loaded successfully");