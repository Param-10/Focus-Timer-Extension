# Focus Timer PRO

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-blue?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/focus-timer-pro/bbmnnmmfgdefdhipfjiefioodbfhohde)
[![Version](https://img.shields.io/badge/version-2.0.0-success.svg)](#)

A premium, gorgeous cyberpunk-themed Pomodoro and Mindfulness Chrome Extension designed for developers, creators, and high-performance screen-workers. It helps you manage focus cycles, rest your eyes, stretch, and beat screen fatigue.

👉 **[Download on the Chrome Web Store](https://chromewebstore.google.com/detail/focus-timer-pro/bbmnnmmfgdefdhipfjiefioodbfhohde)**

---

> [!NOTE]
> **Modern MV3 Architecture Upgrade (v2.0.0):**
> This extension has been entirely rewritten to Chrome Extension Manifest V3 best practices. It features a fully stateless service worker backed by `chrome.alarms` and `chrome.storage.local`. Your timers are completely immune to background suspension!

---

## 🌟 Key Features

- **Holographic Cyberpunk UI**: A visual centerpiece containing a gorgeous, interactive circular SVG progress ring that breathes and shrinks as time runs down.
- **Auto-Cycling Sessions**: Automatically transition from focus → break → focus without any interaction, allowing you to stay completely in the zone.
- **Stateless & Robust Engine**: Timers are scheduled via browser-level alarms. The extension is 100% immune to background service worker termination—it will never freeze or reset.
- **Background Audio Alerts**: Plays high-quality audible chime alerts (`alert.mp3`) at the end of focus/break blocks via `chrome.offscreen` sandboxed audio—working flawlessly even when the popup is closed.
- **Mindful Pause Prompts**: Toggles periodic notifications that deliver hand-crafted physical stretches, breathing exercises, and eye relaxation cues (the 20-20-20 rule) to combat screen fatigue.
- **Embedded Instant-Sync Settings**: Open the glassmorphic settings drawer in the popup to instantly customize durations (1 to 120 minutes) and toggles. Your settings save instantly with immediate visual feedback.
- **Privacy by Design**: No accounts, no tracking, no analytics, no external network requests. All data stays strictly on your local device.

---

## 🛠️ Installation

### Option A: Install from Chrome Web Store (Recommended)
[Click here to install Focus Timer PRO from the Chrome Web Store](https://chromewebstore.google.com/detail/focus-timer-pro/bbmnnmmfgdefdhipfjiefioodbfhohde)

### Option B: Load Unpacked (For Developers)
1. Clone this repository to your local computer:
```bash
git clone https://github.com/Param-10/Focus-Timer-Extension.git
```
2. Open your Google Chrome browser and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** (top-right switch) to **ON**.
4. Click the **Load unpacked** button (top-left).
5. Select the root folder of this project.

### Pin the Extension
Click the puzzle piece icon in the Chrome toolbar, locate **Focus Timer PRO**, and click the Pin icon to lock the holographic dashboard for quick access.

---

## 🚀 How It Works (Architecture)

Focus Timer PRO is designed to be highly resource-efficient and fully MV3-compliant:

```
┌─────────────────┐             ┌────────────────────┐
│   Extension     ├────────────►│  chrome.storage    │
│   Popup UI      │ (Instantly) │  .local (State)    │
└────────┬────────┘             └─────────▲──────────┘
         │                                │ (Event Tick Sync)
         │ (Message Trigger)              │
         ▼                                │
┌─────────────────┐             ┌─────────┴──────────┐
│  background.js  ├────────────►│   chrome.alarms    │
│ (Service Worker)│ (Schedules) │ (Stateless Scheduler)
└────────┬────────┘             └─────────▲──────────┘
         │                                │ (Fires completion)
         ▼ (Spawns on Alert)              │
┌─────────────────┐                       │
│ offscreen.html  ├───────────────────────┘
│ (Audio Chime)   │
└─────────────────┘
```

1. **Popup UI**: Renders the SVG circular animation, does local high-performance countdown loops, and lets you slide settings. Changes are immediately written to local storage.
2. **Stateless Background Service Worker**: Handles incoming events and registers/clears alarms. The service worker safely suspends after 30 seconds of inactivity to save RAM and CPU.
3. **Chrome Alarms**: The browser's native scheduler takes over and keeps track of the remaining seconds. When the alarm triggers, it wakes up the service worker.
4. **Offscreen Audio Player**: The background worker temporarily opens a sandboxed, hidden document to play `sounds/alert.mp3`, ensuring audio alerts work perfectly when the popup is closed, and then immediately destroys it to save memory.

---

## ⚙️ Configuration & Customization

Click the **Settings Drawer** at the bottom of the popup, or open the extension options page from Chrome to customize:
- **Focus Duration**: 1 to 120 minutes (Default: 25 min)
- **Break Duration**: 1 to 30 minutes (Default: 5 min)
- **Audio Alerts**: Toggle chime sounds on completion.
- **Mindful Prompts**: Turn on background mindfulness stretching notifications (Default: every 20 minutes of active browser time).
- **Auto-Cycle Sessions**: Enable/disable automatic transitioning between Focus and Break sessions.

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create.
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## ✉️ Contact

**Developer:** Paramveer Singh  
**Email:** [bheleparamveer@gmail.com](mailto:bheleparamveer@gmail.com)  
**Project Link:** [https://github.com/Param-10/Focus-Timer-Extension](https://github.com/Param-10/Focus-Timer-Extension)