const sentSound = new Audio("/sounds/sent.mp3");
const receivedSound = new Audio("/sounds/received.mp3");
const notificationSound = new Audio("/sounds/notification.mp3");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch((error) => console.log("Audio play failed:", error));
}

export function playSentSound() {
  playSound(sentSound);
}

export function playReceivedSound() {
  playSound(receivedSound);
}

export function playNotificationSound() {
  playSound(notificationSound);
}
