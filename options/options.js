// Mindful Focus Timer - Standalone Options Script

// Settings keys we care about in this page
const SETTINGS_KEYS = ['focusDuration', 'breakDuration', 'soundAlerts', 'mindfulnessReminders', 'autoCycle'];

// UI Elements
const focusDurationInput = document.getElementById('focusDuration');
const focusDurationVal = document.getElementById('focusDurationVal');
const breakDurationInput = document.getElementById('breakDuration');
const breakDurationVal = document.getElementById('breakDurationVal');
const soundAlertsCheckbox = document.getElementById('soundAlerts');
const mindfulnessCheckbox = document.getElementById('mindfulnessReminders');
const autoCycleCheckbox = document.getElementById('autoCycle');
const toastMessage = document.getElementById('toastMessage');

let toastTimeout = null;
let isPageInitiatingChange = false;

// Display a brief non-disruptive toast alert
function showToast() {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.className = 'toast-visible';
  toastTimeout = setTimeout(() => {
    toastMessage.className = 'toast-hidden';
  }, 2000);
}

// Read settings from storage and populate the inputs
async function loadSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEYS);

  focusDurationInput.value = Math.floor((data.focusDuration || 25 * 60) / 60);
  focusDurationVal.textContent = focusDurationInput.value;

  breakDurationInput.value = Math.floor((data.breakDuration || 5 * 60) / 60);
  breakDurationVal.textContent = breakDurationInput.value;

  soundAlertsCheckbox.checked = data.soundAlerts !== false;
  mindfulnessCheckbox.checked = !!data.mindfulnessReminders;
  if (autoCycleCheckbox) autoCycleCheckbox.checked = data.autoCycle !== false;
}

// Save a setting and show the toast. Flags the change as page-initiated.
function saveSetting(data, callback) {
  isPageInitiatingChange = true;
  chrome.storage.local.set(data, () => {
    isPageInitiatingChange = false;
    showToast();
    if (callback) callback();
  });
}

// Bind interactive event listeners for instant storage saving
focusDurationInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  focusDurationVal.textContent = val;
  saveSetting({ focusDuration: val * 60 });
});

breakDurationInput.addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  breakDurationVal.textContent = val;
  saveSetting({ breakDuration: val * 60 });
});

soundAlertsCheckbox.addEventListener('change', (e) => {
  saveSetting({ soundAlerts: e.target.checked });
});

mindfulnessCheckbox.addEventListener('change', (e) => {
  saveSetting({ mindfulnessReminders: e.target.checked }, () => {
    chrome.runtime.sendMessage({ action: 'syncMindfulness' }).catch(() => {});
  });
});

if (autoCycleCheckbox) {
  autoCycleCheckbox.addEventListener('change', (e) => {
    saveSetting({ autoCycle: e.target.checked });
  });
}

// React to storage changes made elsewhere (e.g. inside the popup settings)
// Only reload if it's a settings key that changed AND the change came from outside this page
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (isPageInitiatingChange) return;
  const hasSettingChange = SETTINGS_KEYS.some(k => k in changes);
  if (hasSettingChange) loadSettings();
});

// Initial Load
document.addEventListener('DOMContentLoaded', loadSettings);