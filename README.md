# Mindful Timer Extension

A Chrome extension designed to help you manage focus and break sessions using a customizable timer. The extension supports a focus timer and a break timer, with notifications and sound alerts for session completion.

## Features

- **Focus Timer**: Set and start a focus timer for productivity sessions.
- **Break Timer**: Set and start a break timer to ensure regular breaks.
- **Sound Alerts**: Play a sound when a timer completes.
- **Popup Display**: View and control timers from the extension's popup.

## Installation

1. **Download the Extension**: [Download the latest release](https://example.com/latest-release.zip) or clone the repository.

2. **Load the Extension**:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" using the toggle switch in the top right.
   - Click "Load unpacked" and select the directory containing the `manifest.json` file of your extension.

3. **Start Using the Extension**:
   - Click on the extension icon in the Chrome toolbar.
   - Use the popup interface to start, pause, resume, or reset timers.

## Usage

1. **Start a Focus Timer**:
   - Click on "Start Focus" in the popup.
   - The focus timer will begin and count down from the set duration.

2. **Start a Break Timer**:
   - Click on "Start Break" in the popup.
   - The break timer will begin and count down from the set duration.

3. **Pause/Resume Timer**:
   - Use the "Pause" button to pause the current timer.
   - Use the "Resume" button to continue the paused timer.

4. **Reset Timer**:
   - Click "Reset" to reset the current timer to its default duration.

## Configuration

- **Focus Duration**: Default is 25 minutes.
- **Break Duration**: Default is 5 minutes.

To change the default durations, update the `focusDuration` and `breakDuration` values in the extension's storage.

## Troubleshooting

- **Notification Issues**: Ensure that notifications are enabled for Chrome and that you have the appropriate permissions.
- **Sound Not Playing**: Check the path to the sound file and ensure it's correctly referenced in the extension.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please contact [Paramveer Singh](mailto:bheleparamveer@gmail.com).

---
