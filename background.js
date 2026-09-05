// Local state survives popup closure and service-worker suspension.
const DEFAULTS = { focusDuration: 1500, breakDuration: 300, soundAlerts: true, autoCycle: false, mindfulnessReminders: false, timerState: 'idle', timerType: 'focus', endTime: 0, duration: 0, remainingTime: 0, lastMessage: '' };
let queue = Promise.resolve();
function serial(task) { const next = queue.then(task); queue = next.catch(() => { }); return next; }
async function initialize() {
    const existing = await chrome.storage.local.get(null);
    const missing = Object.fromEntries(Object.entries(DEFAULTS).filter(([key]) => existing[key] === undefined));
    if (Object.keys(missing).length)
        await chrome.storage.local.set(missing);
    await reconcile();
}
async function syncReminder() {
    const state = await chrome.storage.local.get(null);
    const enabled = state.mindfulnessReminders && state.timerState === 'running' && state.timerType === 'focus';
    if (enabled) {
        if (!await chrome.alarms.get('mindfulnessAlarm'))
            await chrome.alarms.create('mindfulnessAlarm', { periodInMinutes: 20 });
    }
    else
        await chrome.alarms.clear('mindfulnessAlarm');
}
async function badge() {
    const state = await chrome.storage.local.get(null);
    await chrome.action.setBadgeBackgroundColor({ color: '#1f1e1b' });
    await chrome.action.setBadgeText({ text: state.timerState === 'paused' ? 'Ⅱ' : state.timerState === 'running' ? (state.timerType === 'focus' ? '•' : 'B') : '' });
    await chrome.action.setTitle({ title: state.timerState === 'idle' ? 'Focus' : `${state.timerType === 'focus' ? 'Focus' : 'Break'} · ${state.timerState}` });
}
async function start(type) {
    const state = await chrome.storage.local.get(null);
    const duration = type === 'focus' ? state.focusDuration : state.breakDuration;
    await chrome.alarms.clear('sessionAlarm');
    const endTime = Date.now() + duration * 1000;
    await chrome.storage.local.set({ timerState: 'running', timerType: type, endTime, duration, remainingTime: 0, lastMessage: '' });
    await chrome.alarms.create('sessionAlarm', { when: endTime });
    await syncReminder();
    await badge();
}
async function playSound() {
    const state = await chrome.storage.local.get('soundAlerts');
    if (!state.soundAlerts)
        return;
    try {
        if (await chrome.offscreen.hasDocument())
            return;
        await chrome.offscreen.createDocument({ url: 'offscreen/offscreen.html', reasons: ['AUDIO_PLAYBACK'], justification: 'Play a short chime when a session ends.' });
    }
    catch { /* Sound availability must never block the timer transition. */ }
}
async function notify(title, message) {
    try {
        await chrome.notifications.create({ type: 'basic', iconUrl: chrome.runtime.getURL('icons/icon128.png'), title, message, priority: 0 });
    }
    catch { /* System notification preferences may suppress alerts. */ }
}
async function complete() {
    const state = await chrome.storage.local.get(null);
    if (state.timerState !== 'running' || state.endTime > Date.now())
        return;
    const wasFocus = state.timerType === 'focus';
    const nextType = wasFocus ? 'break' : 'focus';
    const message = wasFocus ? 'Focus complete. Take a break.' : 'Break complete. Ready when you are.';
    await chrome.alarms.clear('sessionAlarm');
    await chrome.storage.local.set({ timerState: 'idle', timerType: nextType, endTime: 0, remainingTime: 0, duration: 0, lastMessage: message });
    // A late alarm after sleep should not start an unattended chain of sessions.
    if (state.autoCycle && Date.now() - state.endTime < 60000)
        await start(nextType);
    await syncReminder();
    await badge();
    await notify(wasFocus ? 'Focus complete' : 'Break complete', wasFocus ? 'Take a moment away from the screen.' : 'Start again when you’re ready.');
    await playSound();
}
async function reconcile() {
    const state = await chrome.storage.local.get(null);
    if (state.timerState === 'running') {
        if (state.endTime <= Date.now())
            await complete();
        else if (!await chrome.alarms.get('sessionAlarm'))
            await chrome.alarms.create('sessionAlarm', { when: state.endTime });
    }
    else
        await chrome.alarms.clear('sessionAlarm');
    await syncReminder();
    await badge();
}
async function control(request) {
    if (request.action === 'sync') {
        await initialize();
        return;
    }
    const state = await chrome.storage.local.get(null);
    switch (request.action) {
        case 'startFocus':
        case 'startBreak':
            if (state.timerState !== 'idle')
                return;
            await start(request.action === 'startFocus' ? 'focus' : 'break');
            break;
        case 'selectMode':
            if (state.timerState !== 'idle' || !['focus', 'break'].includes(request.mode))
                return;
            await chrome.storage.local.set({ timerType: request.mode, lastMessage: '' });
            break;
        case 'pause':
            if (state.timerState !== 'running')
                return;
            if (state.endTime <= Date.now()) {
                await complete();
                return;
            }
            await chrome.alarms.clear('sessionAlarm');
            await chrome.storage.local.set({ timerState: 'paused', remainingTime: Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000)), endTime: 0 });
            break;
        case 'resume':
            if (state.timerState !== 'paused')
                return;
            {
                const endTime = Date.now() + state.remainingTime * 1000;
                await chrome.storage.local.set({ timerState: 'running', endTime, remainingTime: 0 });
                await chrome.alarms.create('sessionAlarm', { when: endTime });
            }
            break;
        case 'reset':
            await chrome.alarms.clear('sessionAlarm');
            await chrome.storage.local.set({ timerState: 'idle', endTime: 0, remainingTime: 0, duration: 0, lastMessage: '' });
            break;
        case 'saveSettings': {
            const value = request.settings;
            if (!value || !Number.isInteger(value.focusDuration) || value.focusDuration < 60 || value.focusDuration > 7200 || value.focusDuration % 60 || !Number.isInteger(value.breakDuration) || value.breakDuration < 60 || value.breakDuration > 1800 || value.breakDuration % 60 || ['soundAlerts', 'autoCycle', 'mindfulnessReminders'].some(k => typeof value[k] !== 'boolean'))
                throw new Error('Invalid settings');
            await chrome.storage.local.set(Object.fromEntries(['focusDuration', 'breakDuration', 'soundAlerts', 'autoCycle', 'mindfulnessReminders'].map(k => [k, value[k]])));
            break;
        }
        default: throw new Error('Unknown action');
    }
    await syncReminder();
    await badge();
}
chrome.runtime.onInstalled.addListener(() => { serial(initialize).catch(() => { }); });
chrome.runtime.onStartup.addListener(() => { serial(initialize).catch(() => { }); });
chrome.alarms.onAlarm.addListener((alarm) => {
    serial(async () => {
        if (alarm.name === 'sessionAlarm')
            await complete();
        if (alarm.name === 'mindfulnessAlarm') {
            const state = await chrome.storage.local.get(null);
            if (state.mindfulnessReminders && state.timerState === 'running' && state.timerType === 'focus')
                await notify('A moment to stretch', 'Relax your shoulders and look away from the screen.');
        }
    }).catch(() => { });
});
chrome.runtime.onMessage.addListener((request, sender, respond) => {
    if (sender.id !== chrome.runtime.id)
        return false;
    if (request.action === 'offscreenAudioComplete') {
        chrome.offscreen.closeDocument().catch(() => { });
        return false;
    }
    serial(async () => {
        try {
            await control(request);
            respond({ ok: true });
        }
        catch {
            respond({ ok: false });
        }
    });
    return true;
});
// Recreate an alarm if the browser dropped it while this worker was inactive.
serial(initialize).catch(() => { });
