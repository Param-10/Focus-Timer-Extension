# Mindful Focus Timer

A premium, gorgeous cyberpunk-themed Pomodoro and Mindfulness Chrome Extension designed for developers, creators, and high-performance screen-workers. It helps you manage focus cycles, rest your eyes, stretch, and beat screen fatigue.

---

> [!NOTE]
> **Modern MV3 Architecture Upgrade:**
> This extension has been upgraded to Chrome Extension Manifest V3 best practices. It features a fully stateless service worker backed by `chrome.alarms` and `chrome.storage.local`. Your timers are completely immune to background suspension!

---

## 🌟 Key Features

- **Holographic Cyberpunk UI**: A visual centerpiece containing a gorgeous, interactive circular SVG progress ring that breathes and shrinks as time runs down.
- **Stateless & Robust Engine**: Timers are scheduled via browser-level alarms. The extension is 100% immune to background service worker termination—it will never freeze or reset!
- **Background Audio Alerts**: Plays high-quality audible chime alerts (`alert.mp3`) at the end of focus/break blocks via `chrome.offscreen` sandboxed audio—working flawlessly even when the popup is closed.
- **Mindful Pause Prompts**: Toggles periodic notifications that deliver hand-crafted physical stretches, breathing exercises, and eye relaxation cues (the 20-20-20 rule) to combat screen fatigue.
- **Embedded Instant-Sync Settings**: Open the glassmorphic settings drawer in the popup to instantly customize durations (1 to 120 minutes) and toggles. Your settings save instantly with immediate visual feedback.
- **Congruent Options Dashboard**: A fullscreen desktop options control panel that mirrors the settings drawer and stays synchronized in real-time.

---

## 🛠️ Installation

### 1. Download or Clone
Clone this repository to your local computer:
```bash
git clone https://github.com/Param-10/Focus-Timer-Extension.git
```

### 2. Load into Chrome
1. Open your Google Chrome browser and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top-right switch) to **ON**.
3. Click the **Load unpacked** button (top-left).
4. Select the root folder of this project (which contains the `manifest.json` file).

### 3. Pin the Extension
Click the puzzle piece icon in the Chrome toolbar, locate **Mindful Focus**, and click the Pin icon to lock the holographic dashboard for quick access.

---

## 🚀 How It Works (Architecture)

Mindful Focus is designed to be highly resource-efficient and fully MV3-compliant:

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

Click the **Gear Icon** at the top right of the popup, or open the extension options from Chrome to customize:
- **Focus Duration**: 1 to 120 minutes (Default: 25 min)
- **Break Duration**: 1 to 30 minutes (Default: 5 min)
- **Audio Alerts**: Toggle chime sounds on completion.
- **Mindful Prompts**: Turn on background mindfulness stretching notifications (Default: every 20 minutes of active browser time).

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