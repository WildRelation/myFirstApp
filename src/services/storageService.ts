import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "nback.highScore";

// Sparningar utförs i ordning.
let pendingSave: Promise<void> = Promise.resolve();

async function readStoredScore(): Promise<number> {
  const storedValue = await AsyncStorage.getItem(HIGH_SCORE_KEY);

  if (storedValue === null) {
    return 0;
  }

  const score = Number(storedValue);

  if (!Number.isInteger(score) || score < 0) {
    throw new Error("Det sparade rekordet är ogiltigt.");
  }

  return score;
}

export async function getHighScore(): Promise<number> {
  await pendingSave;
  return readStoredScore();
}

export function saveHighScoreIfBetter(score: number): Promise<void> {
  const task = pendingSave.then(async () => {
    const previousRecord = await readStoredScore();

    if (score > previousRecord) {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
    }
  });

  // Ett misslyckat försök ska inte blockera framtida sparningar.
  pendingSave = task.catch(() => {});

  // Anroparen får fortfarande veta om just denna sparning misslyckas.
  return task;
}