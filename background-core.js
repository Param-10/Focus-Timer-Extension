// Timer functionality
let currentTimer;

function startFocusSession(duration) {
  clearTimeout(currentTimer);
  let endTime = Date.now() + duration * 1000;

  function updateTimer() {
    let timeLeft = Math.round((endTime - Date.now()) / 1000);

    if (timeLeft <= 0) {
      notifyTimerComplete("Focus Session Complete", "Time for a break!");
      updateStats(10); // Add points for completed focus session
      // Ensure to update timer display to show 00:00
      chrome.runtime.sendMessage({
        action: "updateTimer",
        time: "0:00"
      });
    } else {
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      let display = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // Debugging output
      console.log(`Focus Timer - Minutes: ${minutes}, Seconds: ${seconds}`);
      
      // Send message to update popup
      chrome.runtime.sendMessage({
        action: "updateTimer",
        time: display
      });

      currentTimer = setTimeout(updateTimer, 1000);
    }
  }

  updateTimer();
}

function startBreak(duration) {
  clearTimeout(currentTimer);
  let endTime = Date.now() + duration * 1000;

  function updateTimer() {
    let timeLeft = Math.round((endTime - Date.now()) / 1000);

    if (timeLeft <= 0) {
      notifyTimerComplete("Break Time Over", "Back to work!");
      // Ensure to update timer display to show 00:00
      chrome.runtime.sendMessage({
        action: "updateTimer",
        time: "0:00"
      });
    } else {
      let minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      let display = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // Debugging output
      console.log(`Break Timer - Minutes: ${minutes}, Seconds: ${seconds}`);
      
      // Send message to update popup
      chrome.runtime.sendMessage({
        action: "updateTimer",
        time: display
      });

      currentTimer = setTimeout(updateTimer, 1000);
    }
  }

  updateTimer();
}

function notifyTimerComplete(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: title,
    message: message
  });
}

// Gamification functionality
const POINTS_PER_FOCUS = 10;
const POINTS_PER_LEVEL = 100;

function updateStats(points) {
  chrome.storage.sync.get(['points', 'level'], (data) => {
    let currentPoints = data.points || 0;
    let newPoints = currentPoints + points;
    let newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;
    
    chrome.storage.sync.set({points: newPoints, level: newLevel}, () => {
      checkAchievements(newPoints, newLevel);
    });
  });
}

function checkAchievements(points, level) {
  const achievements = [
    {name: "Focus Novice", requirement: 50},
    {name: "Focus Intermediate", requirement: 200},
    {name: "Focus Expert", requirement: 500},
    {name: "Focus Master", requirement: 1000}
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
    chrome.storage.sync.get('focusDuration', (data) => {
      startFocusSession(data.focusDuration || 25 * 60);
      sendResponse({status: "Focus session started"});
    });
    return true;  // Indicates that the response is sent asynchronously
  } else if (request.action === "startBreak") {
    chrome.storage.sync.get('breakDuration', (data) => {
      startBreak(data.breakDuration || 5 * 60);
      sendResponse({status: "Break started"});
    });
    return true;  // Indicates that the response is sent asynchronously
  }
});

console.log("Background script loaded successfully");