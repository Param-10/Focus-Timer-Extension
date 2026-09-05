# Focus

A quiet Pomodoro timer for your own focus sessions. Warm white, simple controls, no account or tracking.

## Use in Dia

1. Open `dia://extensions` in a separate Dia window.
2. Turn on **Developer mode**, then choose **Load unpacked**.
3. Select this `Focus-Timer-Extension` folder (the folder containing `manifest.json`).
4. Use **Extensions → Pin Extensions** to pin **Focus**.
5. Open **Focus** and press Start. It pings when the time is up.

Keep this folder in place: Dia loads the extension from it. If an older copy is installed, disable it to avoid two timers.

## Your sessions

- Defaults: 25 minutes of focus and a 5-minute break.
- Pause, resume, or end a session from the popup.
- Close the popup at any time; the browser alarm keeps your session scheduled.
- Settings: focus 1–120 minutes, break 1–30 minutes, end sound, and automatic cycling.
- Settings save as you change them. Duration changes apply to the next session.
- Automatic cycling is off on a fresh install. Existing preferences survive updates.
- After an overdue session, reopening the browser or popup recovers the completion. A session overdue by a minute or more does not automatically start another session.
- Browser alarms cannot wake a sleeping computer or play while Dia is fully quit. Alerts can be delayed; system notification settings may suppress notifications.

All settings and timer state stay in the browser's local extension storage. Permissions cover local storage, alarms, notifications, and a hidden audio document. No website access or browsing history permission is requested.

## Check the timer engine

Run `node --test tests/background.test.cjs`. No package install or build is needed.
