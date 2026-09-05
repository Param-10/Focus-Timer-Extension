# Chrome Web Store Listing — Focus

> Last Updated: 2026-09-05

## Store Listing

**Extension Name**
Focus

**Short Description**
Time a focus session or a short break, then get a ping when it’s done. Local, simple, and yours.

**Detailed Description**
Focus is a quiet timer for work sessions and short breaks. Start it, close the window, and it still finishes — then it pings you when time is up.

FEATURES
• 25-minute focus and 5-minute break by default, or set your own lengths
• Pause, resume, or end a session from the toolbar popup
• Optional chime and desktop notice when a session ends
• Optional auto-start of the next focus or break
• Keeps running after you close the popup
• Everything stays on this device — no account, no tracking

HOW TO USE
1. Pin Focus in your toolbar and click the icon
2. Choose Focus or Break, then press Start
3. Close the popup if you want — the timer keeps going
4. When time is up, you’ll get a notice and, if sound is on, a short chime
5. Open Settings to change durations, the end ping, or auto-start

PRIVACY
Focus does not collect personal data or browsing history. Your timer and settings stay on your device. Removing the extension deletes them.

PERMISSIONS
• Storage — remembers your durations, sound preference, and whether a session is running
• Notifications — tells you when a focus or break ends if the popup is closed
• Alarms — finishes the session on time even after you close the popup
• Offscreen — plays the optional end chime after the popup is closed

SUPPORT
Questions or bugs: https://github.com/Param-10/Focus-Timer-Extension/issues
Privacy: https://github.com/Param-10/Focus-Timer-Extension/blob/main/PRIVACY.md

Version 3.0.0 — simpler square timer, ping when done, stretch reminders removed from the interface.

**Category**
Productivity

**Single Purpose**
A local timer for focus sessions and short breaks that pings when time is up.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon128.png` |
| Screenshot 1 | 1280×800 or 640×400 | 🟡 Needs update | Idle popup: 25:00, Focus/Break, Start |
| Screenshot 2 | 1280×800 or 640×400 | 🟡 Needs update | Running session: remaining time, Pause, End |
| Screenshot 3 | 1280×800 or 640×400 | 🟡 Needs update | Settings: durations, ping, auto-start |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 5 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
Capture the current square popup (360×360 content), not the older tall layout or any cyberpunk/glass UI. Show the timer in use, not only empty chrome. Do not use phone mockups.

---

## Permissions Justification

Every permission in `manifest.json` is required for a user-facing timer feature. No host permissions or website access are requested.

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Saves focus and break lengths, whether the end chime is on, auto-start, and the current session (running, paused, remaining time) so the timer continues after the popup is closed. |
| `notifications` | permissions | Shows a desktop notice when a focus or break ends so you know time is up without keeping the popup open. |
| `alarms` | permissions | Schedules the exact end of the current session so it still completes if the popup is closed or the extension is put to sleep. |
| `offscreen` | permissions | Plays a short local chime when a session ends, because the popup cannot play sound after it is closed. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

Focus stores timer preferences and session state only in the browser’s local extension storage on this device. It does not use accounts, analytics, cookies, or network requests. It does not read websites or browsing history.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL**
https://github.com/Param-10/Focus-Timer-Extension/blob/main/PRIVACY.md

Confirm this URL loads before submission. The text in `PRIVACY.md` must match this disclosure (no off-device transmission, no analytics).

---

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

---

## Developer Info

**Publisher Name**
Paramveer Singh

**Contact Email**
bheleparamveer@gmail.com

**Support URL / Email**
https://github.com/Param-10/Focus-Timer-Extension/issues

**Homepage URL**
https://github.com/Param-10/Focus-Timer-Extension

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 3.0.0 | 2026-09-05 | Square popup, even spacing, ping when done, stretch reminder removed from the UI, settings save as you change them. | Draft |
| 2.0 | 2026-05-26 | Timer continues after the popup closes; optional end sound and notifications. | Draft |
| 1.2 | 2025-04-10 | Basic focus and break timer with notifications. | Published |

---

## Review Notes

### Known Issues / Limitations
- Browser alarms cannot wake a sleeping computer or fire while the browser is fully quit. Notices can be delayed; the user’s system may suppress notifications.
- Screenshots in the developer dashboard still need to be recaptured against the 3.0.0 UI.
- Unused `sounds/alert.mp3` is excluded from the store ZIP; the packaged chime is `sounds/chime.wav`.

### Rejection History
<!-- If applicable:
| Date | Reason | Fix Applied | Resubmitted |
|------|--------|-------------|-------------|
-->
