const $ = (id) => document.getElementById(id);
let data = {}, pending = false, showingSettings = false, available = false;
const isOptions = document.body.classList.contains('options-page');
function showError(message) { $('error').textContent = message; $('error').hidden = !message; }
function setText(id, text) {
    if ($(id).textContent !== text) $(id).textContent = text;
}
function formatTime(seconds) {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
function render() {
    if (isOptions)
        return;
    const running = data.timerState === 'running', paused = data.timerState === 'paused';
    const type = data.timerType === 'break' ? 'break' : 'focus';
    const duration = type === 'focus' ? (data.focusDuration || 1500) : (data.breakDuration || 300);
    const seconds = running ? Math.max(0, Math.ceil((data.endTime - Date.now()) / 1000)) : paused ? data.remainingTime : duration;
    setText('timer', formatTime(seconds));
    setText('stateLabel', paused ? 'Paused' : (!running && data.lastMessage) ? 'Done' : '');
    setText('primary', running ? 'Pause' : paused ? 'Resume' : 'Start');
    $('primary').disabled = pending || !available;
    $('reset').hidden = !(running || paused);
    $('reset').disabled = pending;
    $('progressTrack').classList.toggle('active', running);
    setText('footer', running ? 'Keeps running if you close this.' : '');
    $('progress').style.width = `${running || paused ? Math.min(100, Math.max(0, 100 * (1 - seconds / (data.duration || duration)))) : 0}%`;
    for (const mode of ['focus', 'break']) {
        $(`${mode}Mode`).setAttribute('aria-pressed', String(type === mode));
        $(`${mode}Mode`).disabled = running || paused || pending || !available;
    }
}
function fillSettings() {
    $('focusDuration').value = (data.focusDuration || 1500) / 60;
    $('breakDuration').value = (data.breakDuration || 300) / 60;
    $('soundAlerts').checked = data.soundAlerts !== false;
    $('autoCycle').checked = data.autoCycle === true;
}
async function refresh() { data = await chrome.storage.local.get(null); render(); }
async function action(actionName, extra = {}) {
    pending = true;
    showError('');
    render();
    try {
        const response = await chrome.runtime.sendMessage({ action: actionName, ...extra });
        if (!response?.ok)
            throw new Error('Action failed');
        await refresh();
    }
    catch {
        showError('Couldn’t update the timer. Close and reopen Focus to try again.');
    }
    finally {
        pending = false;
        render();
        if (actionName === 'reset') $('primary').focus();
    }
}
function toggleSettings(open) {
    showingSettings = open;
    $('settings').hidden = !open;
    $('timerView').hidden = open;
    setText('heading', open ? 'Settings' : 'Focus');
    setText('settingsButton', open ? 'Done' : 'Settings');
    $('settingsButton').setAttribute('aria-expanded', String(open));
    if (open)
        fillSettings();
    else
        $('settingsButton').focus();
}
async function persistSettings() {
    if (!$('settingsForm').reportValidity())
        return;
    showError('');
    try {
        const settings = {
            focusDuration: Number($('focusDuration').value) * 60,
            breakDuration: Number($('breakDuration').value) * 60,
            soundAlerts: $('soundAlerts').checked,
            autoCycle: $('autoCycle').checked,
            mindfulnessReminders: false
        };
        const result = await chrome.runtime.sendMessage({ action: 'saveSettings', settings });
        if (!result?.ok)
            throw new Error('Save failed');
        await refresh();
        if (isOptions)
            $('saved').textContent = 'Saved.';
    }
    catch {
        showError('Couldn’t save settings. Please try again.');
    }
}
$('settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    persistSettings();
});
$('settingsForm').addEventListener('change', persistSettings);
if (!isOptions) {
    $('settingsButton').addEventListener('click', () => toggleSettings(!showingSettings));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && showingSettings) {
        e.preventDefault();
        toggleSettings(false);
    } });
    for (const mode of ['focus', 'break'])
        $(`${mode}Mode`).addEventListener('click', () => action('selectMode', { mode }));
    $('primary').addEventListener('click', () => action(data.timerState === 'running' ? 'pause' : data.timerState === 'paused' ? 'resume' : data.timerType === 'break' ? 'startBreak' : 'startFocus'));
    $('reset').addEventListener('click', () => action('reset'));
    setInterval(render, 250);
}
async function initialize() {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
        fillSettings();
        if (!isOptions)
            render();
        return;
    }
    try {
        const response = await chrome.runtime.sendMessage({ action: 'sync' });
        if (!response?.ok)
            throw new Error('Unavailable');
        available = true;
        await refresh();
        fillSettings();
        chrome.storage.onChanged.addListener((_changes, area) => { if (area === 'local')
            refresh().catch(() => showError('Couldn’t refresh. Reopen Focus to try again.')); });
    }
    catch {
        showError('Open Focus from your browser’s Extensions menu to use the timer.');
    }
}
initialize();
