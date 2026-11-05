import * as Speech from "expo-speech";

export function speakLetter(letter: string, onError: () => void): void {
  Speech.speak(letter, {
    language: "en-US",
    rate: 0.8,
    onError: () => onError(),
  });
}

export async function stopSpeech(): Promise<void> {
  await Speech.stop();
}