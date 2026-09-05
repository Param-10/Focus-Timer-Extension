# Agent notes

This is a Manifest V3 Chrome / Dia extension. Product name is **Focus**. Timer state lives in `chrome.storage.local`; session completion uses `chrome.alarms`. Do not add host permissions, remote code, or analytics.

Whenever you are creating or making changes to this Chrome extension, create and manage a `CHROMEWEBSTORE.md` file. Use the `chrome-extensions` skill (`.agents/skills/chrome-extensions`) for the format of that file, permission justifications, and the pre-publish checklist.

This project's Baseline target is Baseline 2024.

Keep the popup a quiet square timer that pings when time is up. Do not bring back stretch reminders or marketing copy in the UI.
