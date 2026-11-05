export const N = 2;
export const EVENTS_PER_ROUND = 20;

const CELL_COUNT = 9;
const TARGET_MATCH_RATE = 0.3;

export function isNBackMatch(
  sequence: number[],
  currentIndex: number,
  n: number
): boolean {
  if (currentIndex < n || currentIndex >= sequence.length) {
    return false;
  }

  return sequence[currentIndex] === sequence[currentIndex - n];
}

export function generateSequence(): number[] {
  const sequence: number[] = [];

  // Bara positioner från N och framåt får vara matchningar.
  const availablePositions: number[] = [];

  for (let index = N; index < EVENTS_PER_ROUND; index++) {
    availablePositions.push(index);
  }

  const matchCount = Math.round(
    availablePositions.length * TARGET_MATCH_RATE
  );

  const matchPositions = new Set<number>();

  // Välj unika matchpositioner slumpmässigt.
  for (let count = 0; count < matchCount; count++) {
    const randomIndex = Math.floor(
      Math.random() * availablePositions.length
    );

    const position = availablePositions[randomIndex];

    matchPositions.add(position);
    availablePositions.splice(randomIndex, 1);
  }

  for (let index = 0; index < EVENTS_PER_ROUND; index++) {
    if (matchPositions.has(index)) {
      // Skapa en avsiktlig matchning.
      sequence.push(sequence[index - N]);
    } else {
      // Välj bland rutor som inte skapar en oavsiktlig matchning.
      const allowedCells: number[] = [];

      for (let cell = 0; cell < CELL_COUNT; cell++) {
        if (index < N || cell !== sequence[index - N]) {
          allowedCells.push(cell);
        }
      }

      const randomIndex = Math.floor(
        Math.random() * allowedCells.length
      );

      sequence.push(allowedCells[randomIndex]);
    }
  }

  return sequence;
}