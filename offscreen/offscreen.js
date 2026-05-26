// Mindful Focus Timer - Offscreen Audio Player
// Runs in a sandboxed offscreen document. Only chrome.runtime messaging is available here.

// Signal to the background service worker that this document is ready to receive messages.
// This solves the race condition where sendMessage fires before the listener is registered.
chrome.runtime.sendMessage({ action: 'offscreenReady' }).catch(() => {
  // Background worker might not be listening yet — that's OK, it will send playAudio on ready signal
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'playAudio') {
    const audio = new Audio(message.source); // source must be a chrome.runtime.getURL() result
    audio.volume = typeof message.volume === 'number' ? message.volume : 1.0;

    const cleanup = () => {
      // Tell the service worker we're done — it will close this offscreen document
      chrome.runtime.sendMessage({ action: 'offscreenAudioComplete' }).catch(() => {});
    };

    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', (e) => {
      console.error('Offscreen audio error:', e);
      cleanup();
    });

    audio.play().catch((err) => {
      console.error('Offscreen audio play() rejected:', err);
      cleanup();
    });

    return false;
  }
});
