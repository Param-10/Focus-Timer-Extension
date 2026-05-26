# Chrome Web Store Listing — Mindful Focus Timer

> Last Updated: 2026-05-26

## Store Listing

**Extension Name**
Mindful Focus Timer

**Short Description**
A gorgeous cyberpunk Pomodoro & Mindfulness Timer with rich sound alerts and reminders to boost focus and relieve fatigue.

**Detailed Description**
Elevate your productivity and maintain physical well-being with Mindful Focus Timer, a premium cyberpunk-themed Pomodoro extension designed for creators, developers, and professional screen-workers.

Built around the scientifically proven Pomodoro Technique (alternating deep focus with restorative breaks), this extension seamlessly blends tactical task focus with physical mindfulness reminders.

Key Features:
- Cyberpunk Glassmorphism UI: An interactive, visual centerpiece with a glowing circular SVG countdown ring that breathes and shrinks as time elapses.
- Epic Sound Alerts: High-quality audio alert chimes that play reliably upon timer completion, even when the popup is closed.
- Stateless Architecture: Engine backed by Chrome Alarms and Storage. Your sessions never pause, glitch, or freeze when the background worker goes to sleep.
- Custom Durations: Instantly adjust focus and break lengths in a single click via range sliders with instant reactive feedback.
- Mindful Prompts: Toggle periodic notifications delivering hand-crafted breathing cues, eye exercises (20-20-20 rule), and physical stretches to fight screen fatigue.
- Sync-Ready Options Panel: A beautiful fullscreen options page that mirrors your settings and stays perfectly in sync with the popup in real-time.

How to Use:
1. Click the Mindful Focus icon in your toolbar to open the holographic dashboard.
2. Select "Start Focus" to begin your productivity sprint (default 25 min) or click the Gear icon to adjust durations instantly.
3. Once the circular progress bar completes, a rich notification will fire, and an alert sound will play.
4. Take a restorative rest with "Start Break" (default 5 min). Read the custom mindfulness tip to stretch or rest your eyes.
5. Repeat to build healthy, sustainable focus cycles!

Privacy & Security:
We believe your data is your own. Mindful Focus Timer operates 100% locally. No user analytics, personal identification details, or browsing data are ever collected, transmitted, or shared. Everything is stored securely within your own browser storage.

Support & Feedback:
Having issues or want to suggest features? Check out our GitHub issues page or email our support desk.

**Category**
Productivity

**Single Purpose**
A customizable Pomodoro focus timer with automated rest intervals and mindfulness reminders to enhance user productivity and wellness.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon128.png` |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | (Dashboard view: active focus session) |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Not created | (Configuration drawer: sliders & toggles) |
| Screenshot 3 | 1280×800 or 640×400 | ⬜ Not created | (Options page: desktop configuration dashboard) |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | (Rich notifications: mindfulness prompt popup) |
| Small Promo Tile | 440×280 | ⬜ Not created | (Cyberpunk marquee branding) |

---

## Permissions Justification

Every permission in `manifest.json` is strictly required to provide local, user-requested features. No network permissions are requested.

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Allows the extension to persist and synchronize user configurations (durations, audio levels, mindfulness settings) and current active timer states across browser sessions. |
| `notifications` | permissions | Triggers native desktop notification cards when a focus session or rest break completes, keeping the user updated without needing to leave their active window. |
| `alarms` | permissions | Establishes a robust, browser-level scheduler that fires Pomodoro and mindfulness events precisely even when the service worker is terminated by the browser. |
| `offscreen` | permissions | Creates a temporary, sandboxed offscreen helper to play the audible alerts (alert.mp3) upon timer completion, working flawlessly even when the popup window is closed. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

Mindful Focus Timer operates entirely within the local sandbox of the user's browser. It does not use any remote servers, databases, or analytics engines.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL**
https://github.com/Param-10/Focus-Timer-Extension/blob/main/PRIVACY.md

*(See the `PRIVACY.md` file in our repository for the full text, which certified that no data is collected, shared, or transferred).*

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
| 2.0 | 2026-05-26 | Complete architectural modernization to MV3: stateless service worker timer, background alarms scheduler, chrome.offscreen audio player, and a premium glassmorphic visual redesign with interactive sliders. | Draft / Ready for Upload |
| 1.2 | 2025-04-10 | Pre-release with basic Pomodoro logic and static notifications. | Published |
