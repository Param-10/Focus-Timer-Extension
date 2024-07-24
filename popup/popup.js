let timerDisplay = document.getElementById('timer');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let levelDisplay = document.getElementById('level');
let pointsDisplay = document.getElementById('points');
let achievementList = document.getElementById('achievementList');

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

function startTimer(duration, timerName) {
  chrome.runtime.sendMessage({
    action: timerName === 'focusTimer' ? 'startFocus' : 'startBreak',
    duration: duration
  }, response => {
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      // Handle the error, maybe show a message to the user
      timerDisplay.textContent = 'Error starting timer';
    } else if (response && response.error) {
      console.error('Response error:', response.error);
      timerDisplay.textContent = 'Error: ' + response.error;
    } else {
      // Timer started successfully
      console.log('Timer started:', timerName);
      timerDisplay.textContent = `${Math.floor(duration / 60)}:00`;
    }
  });
}

startFocusBtn.addEventListener('click', () => {
  chrome.storage.sync.get('focusDuration', (data) => {
    startTimer(data.focusDuration, 'focusTimer');
  });
});

startBreakBtn.addEventListener('click', () => {
  chrome.storage.sync.get('breakDuration', (data) => {
    startTimer(data.breakDuration, 'breakTimer');
  });
});

// Call updateStats when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  // Initialize timer display
  chrome.storage.sync.get('focusDuration', (data) => {
    timerDisplay.textContent = `${Math.floor(data.focusDuration / 60)}:00`;
  });
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimer") {
    timerDisplay.textContent = request.time;
  }
});