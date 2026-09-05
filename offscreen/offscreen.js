const audio = new Audio(chrome.runtime.getURL('sounds/chime.wav'));
audio.volume = 0.35;
let finished = false;
function cleanup() {
    if (finished)
        return;
    finished = true;
    chrome.runtime.sendMessage({ action: 'offscreenAudioComplete' }).catch(() => { });
}
audio.addEventListener('ended', cleanup, { once: true });
audio.addEventListener('error', cleanup, { once: true });
audio.play().catch(cleanup);
setTimeout(cleanup, 15000);
