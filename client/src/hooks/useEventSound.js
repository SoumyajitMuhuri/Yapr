
  const sentSound = new Audio("/sounds/sent.mp3");
  const receivedSound = new Audio("/sounds/received.mp3");
  const newMessageSound = new Audio("/sounds/notification.mp3");

function useSentSound() {
  const playRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0; //resets the sounds once played so it can play again smoothly
    randomSound.play().catch((error) => console.log("Audio play failed:", error));
  };

  return { playRandomKeyStrokeSound };
}

export default useTypingSound;