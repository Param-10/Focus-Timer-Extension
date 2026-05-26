// Mindful Focus Timer - Popup Client Script

// UI Elements
const timerDisplay = document.getElementById('timer');
const stateLabel = document.getElementById('timerStateLabel');
const container = document.getElementById('container');
const controlsContainer = document.getElementById('controls');
const messageDisplay = document.getElementById('message');

// Control Buttons
const startFocusBtn = document.getElementById('startFocus');
const startBreakBtn = document.getElementById('startBreak');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const resetRunningBtn = document.getElementById('resetRunning');
const resetPausedBtn = document.getElementById('resetPaused');

// Settings Elements
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const settingsDrawer = document.getElementById('settingsDrawer');
const focusDurationInput = document.getElementById('focusDuration');
const focusDurationVal = document.getElementById('focusDurationVal');
const breakDurationInput = document.getElementById('breakDuration');
const breakDurationVal = document.getElementById('breakDurationVal');
const soundAlertsCheckbox = document.getElementById('soundAlerts');
const mindfulnessCheckbox = document.getElementById('mindfulnessReminders');

// Tips Section
const tipSection = document.getElementById('tipSection');
const tipText = document.getElementById('tipText');

// Progress Ring Configuration
const progressRingBar = document.getElementById('progressRingBar');
const CIRCUMFERENCE = 527.79; // 2 * Math.PI * 84

// Local state cache
let currentInterval = null;
let currentTimerState = 'idle'; // 'idle' | 'running' | 'paused'
let currentTimerType = 'focus'; // 'focus' | 'break'
let cachedEndTime = 0;
let cachedDuration = 0;
let cachedRemainingTime = 0;

let isPopupInitiatingChange = false; // Flag: we triggered this storage change ourselves

const BREAK_TIPS = [
  "Take 3 deep, slow breaths. Relax your abdominal muscles.",
  "Look away from the screen! Focus on an object 20 feet away.",
  "Roll your shoulders backward 5 times, then forward 5 times.",
  "Stand up and gently stretch your back and arms.",
  "Hydration time! Take a slow sip of fresh water.",
  "Close your eyes and let your eyelids relax fully.",
  "Massage the temple muscles on the side of your head gently."
];

const FOCUS_QUOTES = [
  "Focus on being productive, not busy.",
  "Your mind is for having ideas, not holding them.",
  "One step at a time. Stay present, stay mindful.",
  "Deep focus yields high-quality creation.",
  "Eliminate distractions to invite clarity."
];

// Helper: Format seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Draw percentage on the circular progress ring
function setProgress(percent) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
  progressRingBar.style.strokeDashoffset = offset;
}

// Toggle control state classes
function updateControlsUI(state) {
  controlsContainer.className = `state-${state}`;
  
  if (state === 'idle') {
    stateLabel.textContent = 'READY';
  } else if (state === 'paused') {
    stateLabel.textContent = 'PAUSED';
  } else {
    stateLabel.textContent = currentTimerType === 'focus' ? 'FOCUSING' : 'BREAK';
  }
}

// Refresh local UI elements based on state read from storage
async function refreshUI() {
  const data = await chrome.storage.local.get([
    'timerState',
    'timerType',
    'endTime',
    'duration',
    'remainingTime',
    'focusDuration',
    'breakDuration',
    'soundAlerts',
    'mindfulnessReminders'
  ]);

  currentTimerState = data.timerState || 'idle';
  currentTimerType = data.timerType || 'focus';
  cachedEndTime = data.endTime || 0;
  cachedDuration = data.duration || 0;
  cachedRemainingTime = data.remainingTime || 0;

  // Sync settings panel fields
  focusDurationInput.value = Math.floor((data.focusDuration || 25 * 60) / 60);
  focusDurationVal.textContent = focusDurationInput.value;
  breakDurationInput.value = Math.floor((data.breakDuration || 5 * 60) / 60);
  breakDurationVal.textContent = breakDurationInput.value;
  soundAlertsCheckbox.checked = data.soundAlerts !== false;
  mindfulnessCheckbox.checked = !!data.mindfulnessReminders;

  // Theme application
  if (currentTimerType === 'break') {
    container.classList.add('theme-break');
  } else {
    container.classList.remove('theme-break');
  }

  // Clear running tick loop
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  // Handle different timer states
  if (currentTimerState === 'running') {
    updateControlsUI('running');
    
    // Immediately calculate first tick
    tick();
    currentInterval = setInterval(tick, 1000);
    
    // Hide tip card during focus, show nice quote
    if (currentTimerType === 'focus') {
      tipSection.classList.remove('hidden');
      // Set random quote
      if (tipText.dataset.mode !== 'focus') {
        tipText.textContent = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)];
        tipText.dataset.mode = 'focus';
      }
    } else {
      // Break tips
      tipSection.classList.remove('hidden');
      if (tipText.dataset.mode !== 'break') {
        tipText.textContent = BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)];
        tipText.dataset.mode = 'break';
      }
    }
  } else if (currentTimerState === 'paused') {
    updateControlsUI('paused');
    timerDisplay.textContent = formatTime(cachedRemainingTime);
    
    // Visual progress ratio
    const ratio = cachedDuration > 0 ? (cachedRemainingTime / cachedDuration) * 100 : 100;
    setProgress(ratio);
    
    tipSection.classList.remove('hidden');
    tipText.textContent = "Timer paused. Take a breath and resume when ready.";
    tipText.dataset.mode = 'paused';
  } else {
    // IDLE
    updateControlsUI('idle');
    const defaultSecs = currentTimerType === 'focus' 
      ? (data.focusDuration || 25 * 60) 
      : (data.breakDuration || 5 * 60);
    timerDisplay.textContent = formatTime(defaultSecs);
    setProgress(100);
    
    tipSection.classList.add('hidden');
    tipText.dataset.mode = 'idle';
  }
}

// Time tick function for local countdown rendering
function tick() {
  const timeLeftMs = cachedEndTime - Date.now();
  const timeLeftSec = Math.max(0, Math.round(timeLeftMs / 1000));

  timerDisplay.textContent = formatTime(timeLeftSec);

  // Compute visual circle progress
  if (cachedDuration > 0) {
    const ratio = (timeLeftSec / cachedDuration) * 100;
    setProgress(ratio);
  } else {
    setProgress(0);
  }

  // When local countdown reaches zero, stop the interval and wait.
  // DO NOT call refreshUI() here — the background alarm hasn't fired yet.
  // The storage.onChanged listener will trigger refreshUI() when the background
  // updates timerState/endTime after the alarm fires.
  if (timeLeftSec <= 0) {
    clearInterval(currentInterval);
    currentInterval = null;
    // Show 0:00 and full ring at rest position while waiting for background
    timerDisplay.textContent = '0:00';
    setProgress(0);
  }
}

// Helper: send action to background service worker (async/await, chrome MV3 style)
async function sendAction(msg) {
  try {
    return await chrome.runtime.sendMessage(msg);
  } catch (err) {
    // 'Could not establish connection' is expected when SW is idle — not a real error
    if (!err.message?.includes('Could not establish connection')) {
      console.error('sendAction error:', err.message);
    }
  }
}

// Click Handlers for Alarms / Control triggers
startFocusBtn.addEventListener('click', async () => {
  const data = await chrome.storage.local.get('focusDuration');
  const dur = data.focusDuration || 25 * 60;
  await sendAction({ action: 'startFocus', duration: dur });
  refreshUI();
});

startBreakBtn.addEventListener('click', async () => {
  const data = await chrome.storage.local.get('breakDuration');
  const dur = data.breakDuration || 5 * 60;
  await sendAction({ action: 'startBreak', duration: dur });
  refreshUI();
});

pauseBtn.addEventListener('click', async () => {
  await sendAction({ action: 'pause' });
  refreshUI();
});

resumeBtn.addEventListener('click', async () => {
  await sendAction({ action: 'resume' });
  refreshUI();
});

const handleReset = async () => {
  await sendAction({ action: 'reset' });
  messageDisplay.textContent = '';
  refreshUI();
};

resetRunningBtn.addEventListener('click', handleReset);
resetPausedBtn.addEventListener('click', handleReset);

// Settings Drawer toggle
toggleSettingsBtn.addEventListener('click', () => {
  if (settingsDrawer.classList.contains('drawer-closed')) {
    settingsDrawer.classList.remove('drawer-closed');
    settingsDrawer.classList.add('drawer-open');
  } else {
    settingsDrawer.classList.remove('drawer-open');
    settingsDrawer.classList.add('drawer-closed');
  }
});

// Close drawer if clicking outside
document.addEventListener('click', (e) => {
  if (!settingsDrawer.contains(e.target) && !toggleSettingsBtn.contains(e.target)) {
    if (settingsDrawer.classList.contains('drawer-open')) {
      settingsDrawer.classList.remove('drawer-open');
      settingsDrawer.classList.add('drawer-closed');
    }
  }
});

// Input Slider Listeners (instant save to local storage)
// Flag changes as popup-initiated so onChanged doesn't restart the countdown
focusDurationInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  focusDurationVal.textContent = val;
  isPopupInitiatingChange = true;
  chrome.storage.local.set({ focusDuration: val * 60 }, () => {
    isPopupInitiatingChange = false;
    if (currentTimerState === 'idle' && currentTimerType === 'focus') {
      timerDisplay.textContent = formatTime(val * 60);
    }
  });
});

breakDurationInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  breakDurationVal.textContent = val;
  isPopupInitiatingChange = true;
  chrome.storage.local.set({ breakDuration: val * 60 }, () => {
    isPopupInitiatingChange = false;
    if (currentTimerState === 'idle' && currentTimerType === 'break') {
      timerDisplay.textContent = formatTime(val * 60);
    }
  });
});

soundAlertsCheckbox.addEventListener('change', (e) => {
  isPopupInitiatingChange = true;
  chrome.storage.local.set({ soundAlerts: e.target.checked }, () => {
    isPopupInitiatingChange = false;
  });
});

mindfulnessCheckbox.addEventListener('change', (e) => {
  isPopupInitiatingChange = true;
  chrome.storage.local.set({ mindfulnessReminders: e.target.checked }, () => {
    isPopupInitiatingChange = false;
    sendAction({ action: 'syncMindfulness' });
  });
});

// Sync from changes outside popup (e.g. from background transitions or options page)
// Only refresh when changes come from OUTSIDE the popup (background alarm completion, options page, etc.)
// Slider/toggle changes initiated by this popup are flagged and skipped to avoid restarting the tick loop
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (isPopupInitiatingChange) return;

  // Only trigger a full refresh if a timer-state-relevant key changed
  const timerKeys = ['timerState', 'timerType', 'endTime', 'duration', 'remainingTime'];
  const hasTimerChange = timerKeys.some(k => k in changes);
  const hasSettingChange = ['focusDuration', 'breakDuration', 'soundAlerts', 'mindfulnessReminders'].some(k => k in changes);

  if (hasTimerChange) {
    // Full refresh — timer state changed (background completed a session, etc.)
    refreshUI();
  } else if (hasSettingChange && currentTimerState === 'idle') {
    // Only update display values if idle (don't disturb a running countdown)
    refreshUI();
  }
});

// Listen for direct background completion messaging
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'timerComplete') {
    if (messageDisplay) {
      messageDisplay.textContent = request.message;
      setTimeout(() => {
        messageDisplay.textContent = '';
      }, 5000);
    }
    refreshUI();
  }
});

// Initial load
document.addEventListener('DOMContentLoaded', refreshUI);