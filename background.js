// Mindful Focus Timer - Background Service Worker (Stateless)

const MINDFULNESS_TIPS = [
  "Take 3 deep, slow breaths. Notice the sensation of air entering and leaving.",
  "Stand up and stretch for 15 seconds. Roll your shoulders and release tension.",
  "Look away from the screen! Focus on an object at least 20 feet away for 20 seconds (20-20-20 rule).",
  "Do a quick body scan. Soften your jaw, drop your shoulders, and relax your hands.",
  "Hydration check! Take a sip of water and enjoy the refreshing taste.",
  "Take a moment to feel the weight of your feet firmly grounded on the floor.",
  "Close your eyes and listen to the sounds in your environment for 15 seconds.",
  "Acknowledge one thing you are grateful for in this present moment."
];

// ─── Installation / Startup ─────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get([
    'focusDuration', 'breakDuration', 'soundAlerts', 'mindfulnessReminders', 'autoCycle'
  ]);

  // Only set defaults for keys that don't already exist (preserves user prefs across updates)
  const toSet = {};
  if (existing.focusDuration === undefined) toSet.focusDuration = 25 * 60;
  if (existing.breakDuration === undefined) toSet.breakDuration = 5 * 60;
  if (existing.soundAlerts === undefined) toSet.soundAlerts = true;
  if (existing.mindfulnessReminders === undefined) toSet.mindfulnessReminders = false;
  if (existing.autoCycle === undefined) toSet.autoCycle = true; // Default: auto-cycle on

  // Always reset timer state on install/update to prevent stale "running" state
  toSet.timerState = 'idle';
  toSet.timerType = 'focus';
  toSet.remainingTime = 0;
  toSet.endTime = 0;
  toSet.duration = 0;

  await chrome.storage.local.set(toSet);

  // Clear any leftover alarms from previous install
  await chrome.alarms.clearAll();

  // Read the FINAL mindfulness value (after set) and set up alarm if needed
  const finalData = await chrome.storage.local.get('mindfulnessReminders');
  if (finalData.mindfulnessReminders) {
    chrome.alarms.create('mindfulnessAlarm', { periodInMinutes: 20 });
  }
});

// ─── Mindfulness Alarm Setup ────────────────────────────────────────────────

async function setupMindfulnessAlarm() {
  await chrome.alarms.clear('mindfulnessAlarm');
  const { mindfulnessReminders } = await chrome.storage.local.get('mindfulnessReminders');
  if (mindfulnessReminders) {
    chrome.alarms.create('mindfulnessAlarm', { periodInMinutes: 20 });
  }
}

// ─── Offscreen Document Audio ────────────────────────────────────────────────

// Pending audio URL, held until the offscreen document signals it's ready
let pendingAudioUrl = null;

async function hasOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  return existingContexts.length > 0;
}

async function playAlertSound() {
  const { soundAlerts = true } = await chrome.storage.local.get('soundAlerts');
  if (!soundAlerts) return;

  // Don't try to spawn another if one is already open
  if (await hasOffscreenDocument()) return;

  pendingAudioUrl = chrome.runtime.getURL('sounds/alert.mp3');

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen/offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Alert sounds for completed focus or break periods.'
    });
    // The offscreen document will send 'offscreenReady' when its listener is registered.
    // We respond with 'playAudio' in the onMessage handler below.
  } catch (err) {
    console.error('Failed to create offscreen document:', err);
    pendingAudioUrl = null;
  }
}

// ─── Notifications ───────────────────────────────────────────────────────────

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: title,
    message: message,
    priority: 2
  });
}

// ─── Alarm Handler ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sessionAlarm') {
    const state = await chrome.storage.local.get([
      'timerType',
      'timerState',
      'focusDuration',
      'breakDuration',
      'autoCycle'
    ]);

    // Guard: only process if we were actually running (not paused/reset)
    if (state.timerState !== 'running') return;

    if (state.timerType === 'focus') {
      showNotification('Focus Session Complete!', 'Time for a well-deserved break!');
      await playAlertSound();

      if (state.autoCycle !== false) {
        // Auto-cycle to break
        const duration = state.breakDuration || 5 * 60;
        const endTime = Date.now() + duration * 1000;
        await chrome.storage.local.set({
          timerState: 'running',
          timerType: 'break',
          endTime: endTime,
          duration: duration
        });
        chrome.alarms.create('sessionAlarm', { when: endTime });
        chrome.runtime.sendMessage({
          action: 'timerComplete',
          timerType: 'break',
          message: 'Focus complete! Break started automatically.'
        }).catch(() => {});
      } else {
        // Stop after focus session
        await chrome.storage.local.set({ timerState: 'idle', endTime: 0 });
        chrome.runtime.sendMessage({
          action: 'timerComplete',
          timerType: null,
          message: 'Focus session complete!'
        }).catch(() => {});
      }

    } else if (state.timerType === 'break') {
      showNotification('Break Time Over!', 'Let\'s get back to work and focus!');
      await playAlertSound();

      if (state.autoCycle !== false) {
        // Auto-cycle back to focus
        const duration = state.focusDuration || 25 * 60;
        const endTime = Date.now() + duration * 1000;
        await chrome.storage.local.set({
          timerState: 'running',
          timerType: 'focus',
          endTime: endTime,
          duration: duration
        });
        chrome.alarms.create('sessionAlarm', { when: endTime });
        chrome.runtime.sendMessage({
          action: 'timerComplete',
          timerType: 'focus',
          message: 'Break complete! Focus session started.'
        }).catch(() => {});
      } else {
        // Stop after break
        await chrome.storage.local.set({ timerState: 'idle', endTime: 0 });
        chrome.runtime.sendMessage({
          action: 'timerComplete',
          timerType: null,
          message: 'Break complete!'
        }).catch(() => {});
      }
    }

  } else if (alarm.name === 'mindfulnessAlarm') {
    const { mindfulnessReminders } = await chrome.storage.local.get('mindfulnessReminders');
    if (mindfulnessReminders) {
      const tip = MINDFULNESS_TIPS[Math.floor(Math.random() * MINDFULNESS_TIPS.length)];
      showNotification('Mindful Pause', tip);
    }
  }
});

// ─── Message Handler ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Offscreen document signaled it is ready — now send the pending audio URL
  if (request.action === 'offscreenReady') {
    if (pendingAudioUrl) {
      const urlToPlay = pendingAudioUrl;
      pendingAudioUrl = null;
      chrome.runtime.sendMessage({
        action: 'playAudio',
        source: urlToPlay,
        volume: 0.8
      }).catch((err) => {
        console.warn('Could not deliver playAudio to offscreen doc:', err);
        chrome.offscreen.closeDocument().catch(() => {});
      });
    }
    return false;
  }

  // Offscreen document finished playing audio — clean it up
  if (request.action === 'offscreenAudioComplete') {
    pendingAudioUrl = null;
    chrome.offscreen.closeDocument().catch(() => {});
    return false;
  }

  // ── Timer Control Messages ────────────────────────────────────────────────

  if (request.action === 'startFocus') {
    (async () => {
      const { focusDuration } = await chrome.storage.local.get('focusDuration');
      const duration = request.duration || focusDuration || 25 * 60;
      const endTime = Date.now() + duration * 1000;

      await chrome.alarms.clear('sessionAlarm');
      await chrome.storage.local.set({
        timerState: 'running',
        timerType: 'focus',
        endTime: endTime,
        duration: duration,
        remainingTime: 0
      });
      chrome.alarms.create('sessionAlarm', { when: endTime });
      sendResponse({ status: 'Focus started', endTime });
    })();
    return true;
  }

  if (request.action === 'startBreak') {
    (async () => {
      const { breakDuration } = await chrome.storage.local.get('breakDuration');
      const duration = request.duration || breakDuration || 5 * 60;
      const endTime = Date.now() + duration * 1000;

      await chrome.alarms.clear('sessionAlarm');
      await chrome.storage.local.set({
        timerState: 'running',
        timerType: 'break',
        endTime: endTime,
        duration: duration,
        remainingTime: 0
      });
      chrome.alarms.create('sessionAlarm', { when: endTime });
      sendResponse({ status: 'Break started', endTime });
    })();
    return true;
  }

  if (request.action === 'pause') {
    (async () => {
      const state = await chrome.storage.local.get(['endTime', 'timerState']);
      if (state.timerState !== 'running') {
        sendResponse({ status: 'Not running' });
        return;
      }
      await chrome.alarms.clear('sessionAlarm');
      const remainingTime = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
      await chrome.storage.local.set({ timerState: 'paused', remainingTime });
      sendResponse({ status: 'Paused', remainingTime });
    })();
    return true;
  }

  if (request.action === 'resume') {
    (async () => {
      const state = await chrome.storage.local.get(['remainingTime', 'timerState']);
      if (state.timerState !== 'paused') {
        sendResponse({ status: 'Not paused' });
        return;
      }
      const remainingMs = (state.remainingTime || 60) * 1000;
      const endTime = Date.now() + remainingMs;
      await chrome.storage.local.set({ timerState: 'running', endTime, remainingTime: 0 });
      chrome.alarms.create('sessionAlarm', { when: endTime });
      sendResponse({ status: 'Resumed', endTime });
    })();
    return true;
  }

  if (request.action === 'reset') {
    (async () => {
      await chrome.alarms.clear('sessionAlarm');
      await chrome.storage.local.set({
        timerState: 'idle',
        remainingTime: 0,
        endTime: 0
      });
      sendResponse({ status: 'Reset' });
    })();
    return true;
  }

  if (request.action === 'syncMindfulness') {
    (async () => {
      await setupMindfulnessAlarm();
      sendResponse({ status: 'Mindfulness synced' });
    })();
    return true;
  }
});
