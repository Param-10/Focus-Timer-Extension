let currentTimer;

function startFocusSession(duration) {
  clearTimeout(currentTimer);
  let endTime = Date.now() + duration * 1000;

  function updateTimer() {
    let timeLeft = Math.round((endTime - Date.now()) / 1000);
    
    if (timeLeft <= 0) {
      chrome.runtime.sendMessage({action: "focusComplete"});
    } else {
      updateTimerDisplay(timeLeft);
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
      chrome.runtime.sendMessage({action: "breakComplete"});
    } else {
      updateTimerDisplay(timeLeft);
      currentTimer = setTimeout(updateTimer, 1000);
    }
  }

  updateTimer();
}

function updateTimerDisplay(timeLeft) {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  let display = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  chrome.runtime.sendMessage({action: "updateTimerDisplay", display: display});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startFocus") {
    startFocusSession(request.duration);
  } else if (request.action === "startBreak") {
    startBreak(request.duration);
  }
});