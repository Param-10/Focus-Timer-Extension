let timerDisplay = document.getElementById('timer');
let startFocusBtn = document.getElementById('startFocus');
let startBreakBtn = document.getElementById('startBreak');
let pauseBtn = document.getElementById('pause');
let resumeBtn = document.getElementById('resume');
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
      timerDisplay.textContent = 'Error starting timer';
    } else {
      console.log('Timer started:', timerName);
      timerDisplay.textContent = `${Math.floor(duration / 60)}:00`;
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

// Call updateStats when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
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