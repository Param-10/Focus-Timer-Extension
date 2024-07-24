let focusDurationInput = document.getElementById('focusDuration');
let breakDurationInput = document.getElementById('breakDuration');
let saveButton = document.getElementById('save');

chrome.storage.sync.get(['focusDuration', 'breakDuration'], (data) => {
  focusDurationInput.value = data.focusDuration / 60;
  breakDurationInput.value = data.breakDuration / 60;
});

saveButton.addEventListener('click', () => {
  chrome.storage.sync.set({
    focusDuration: focusDurationInput.value * 60,
    breakDuration: breakDurationInput.value * 60
  }, () => {
    alert('Settings saved!');
  });
});