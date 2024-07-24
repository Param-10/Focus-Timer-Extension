const POINTS_PER_FOCUS = 10;
const POINTS_PER_LEVEL = 100;

function addPoints(points) {
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
    iconUrl: 'images/icon48.svg',
    title: 'New Achievement Unlocked!',
    message: `You've earned the "${achievementName}" badge!`
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "focusComplete") {
    addPoints(POINTS_PER_FOCUS);
  }
});