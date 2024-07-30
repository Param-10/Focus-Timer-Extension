const MINDFULNESS_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds

function setupMindfulnessReminders() {
    chrome.alarms.create("mindfulnessReminder", {
        periodInMinutes: MINDFULNESS_INTERVAL / 60000 // Convert milliseconds to minutes
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
        iconUrl: 'images/icon48.svg',
        title: 'Mindfulness Reminder',
        message: getMindfulnessTip()
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "mindfulnessReminder") {
        showMindfulnessNotification();
    }
});

chrome.runtime.onInstalled.addListener(() => {
    setupMindfulnessReminders();
});