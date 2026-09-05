const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../background.js'), 'utf8');
function engine(seed = {}) {
    let data = { ...seed }, now = 1000000, handler, alarmHandler;
    const alarms = new Map(), notices = [];
    const event = (set) => ({ addListener: set || (() => { }) });
    const chrome = { storage: { local: { get: async () => ({ ...data }), set: async (v) => Object.assign(data, v) } },
        alarms: { create: async (n, v) => alarms.set(n, v), get: async (n) => alarms.get(n), clear: async (n) => alarms.delete(n), onAlarm: event(f => alarmHandler = f) },
        action: { setBadgeText: async () => { }, setBadgeBackgroundColor: async () => { }, setTitle: async () => { } },
        notifications: { create: async (v) => notices.push(v) },
        offscreen: { hasDocument: async () => false, createDocument: async () => { }, closeDocument: async () => { } },
        runtime: { id: 'test', getURL: p => p, onInstalled: event(), onStartup: event(), onMessage: event(f => handler = f) } };
    const context = vm.createContext({ chrome, Date: { now: () => now } });
    vm.runInContext(source, context);
    const settle = () => vm.runInContext('queue', context);
    return { get data() { return data; }, alarms, notices, ready: settle, advance: s => { now += s * 1000; },
        send: async (action, extra = {}) => { await settle(); return new Promise(resolve => handler({ action, ...extra }, { id: 'test' }, resolve)); },
        alarm: async () => { alarmHandler({ name: 'sessionAlarm' }); await settle(); },
        suspend: () => { alarms.clear(); }, set: (values) => Object.assign(data, values) };
}
test('fresh defaults use manual cycling and preserve existing preferences', async () => { const e = engine(); await e.ready(); assert.equal(e.data.autoCycle, false); assert.equal(e.data.focusDuration, 1500); const old = engine({ focusDuration: 3000, autoCycle: true, timerState: 'paused', remainingTime: 71 }); await old.ready(); assert.equal(old.data.focusDuration, 3000); assert.equal(old.data.remainingTime, 71); assert.equal(old.data.timerState, 'paused'); });
test('start, pause and resume preserve elapsed time without popup', async () => { const e = engine(); await e.send('startFocus'); e.advance(123); await e.send('pause'); assert.equal(e.data.remainingTime, 1377); assert.ok(!e.alarms.has('sessionAlarm')); e.advance(400); await e.send('resume'); assert.equal(e.data.endTime, 1000000 + (523 + 1377) * 1000); assert.equal(e.data.timerState, 'running'); });
test('completion is processed once and offers the break', async () => { const e = engine(); await e.send('startFocus'); e.advance(1500); await e.alarm(); await e.alarm(); assert.equal(e.data.timerState, 'idle'); assert.equal(e.data.timerType, 'break'); assert.equal(e.notices.length, 1); });
test('early stale alarm cannot end a newer session', async () => { const e = engine(); await e.send('startFocus'); await e.alarm(); assert.equal(e.data.timerState, 'running'); assert.equal(e.notices.length, 0); });
test('reset clears alarm and stale completion does nothing', async () => { const e = engine(); await e.send('startFocus'); await e.send('reset'); e.advance(2000); await e.alarm(); assert.equal(e.data.timerState, 'idle'); assert.equal(e.notices.length, 0); });
test('auto-cycle starts the next period but long sleep does not', async () => { const e = engine({ autoCycle: true }); await e.send('startFocus'); e.advance(1500); await e.alarm(); assert.equal(e.data.timerType, 'break'); assert.equal(e.data.timerState, 'running'); e.advance(500); await e.alarm(); assert.equal(e.data.timerType, 'focus'); assert.equal(e.data.timerState, 'idle'); });
test('lost browser alarm is recovered and overdue session completed', async () => { const e = engine(); await e.send('startFocus'); e.suspend(); await e.send('sync'); assert.ok(e.alarms.has('sessionAlarm')); e.advance(1600); e.suspend(); await e.send('sync'); assert.equal(e.data.timerState, 'idle'); assert.equal(e.notices.length, 1); });
test('settings validate ranges and never overwrite active duration', async () => { const e = engine(); await e.send('startFocus'); const settings = { focusDuration: 3000, breakDuration: 600, soundAlerts: false, autoCycle: false, mindfulnessReminders: true }; assert.equal((await e.send('saveSettings', { settings })).ok, true); assert.equal(e.data.duration, 1500); assert.equal(e.data.focusDuration, 3000); assert.equal((await e.send('saveSettings', { settings: { ...settings, focusDuration: NaN } })).ok, false); assert.equal(e.data.focusDuration, 3000); });
test('reminders stop on pause and only run in focus', async () => { const e = engine({ mindfulnessReminders: true }); await e.ready(); assert.ok(!e.alarms.has('mindfulnessAlarm')); await e.send('startFocus'); assert.ok(e.alarms.has('mindfulnessAlarm')); await e.send('pause'); assert.ok(!e.alarms.has('mindfulnessAlarm')); await e.send('reset'); await e.send('startBreak'); assert.ok(!e.alarms.has('mindfulnessAlarm')); });
test('concurrent starts are serialized and modes cannot replace active session', async () => { const e = engine(); await Promise.all([e.send('startFocus'), e.send('startBreak')]); assert.equal(e.data.timerType, 'focus'); await e.send('selectMode', { mode: 'break' }); assert.equal(e.data.timerType, 'focus'); });
test('pause at completion does not invent another minute', async () => { const e = engine(); await e.send('startFocus'); e.advance(1500); await e.send('pause'); assert.equal(e.data.timerState, 'idle'); assert.equal(e.notices.length, 1); });
