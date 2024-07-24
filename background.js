import './scripts/timer.js';
import './scripts/gamification.js';
import './scripts/mindfulness.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    points: 0,
    level: 1,
    achievements: []
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "images/icon48.svg",
      title: "Focus Session Complete",
      message: "Time for a break!"
    });
    chrome.runtime.sendMessage({action: "focusComplete"});
  } else if (alarm.name === "breakTimer") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "images/icon48.svg",
      title: "Break Over",
      message: "Ready to focus again?"
    });
    chrome.runtime.sendMessage({action: "breakComplete"});
  }
});