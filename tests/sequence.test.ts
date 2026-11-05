/// <reference types="jest" />

import {
    EVENTS_PER_ROUND,
    generateSequence,
    isNBackMatch,
    N,
} from "../src/models/sequence";

test("sekvensen har rätt längd och giltiga rutnummer", () => {
  const sequence = generateSequence();

  expect(sequence).toHaveLength(EVENTS_PER_ROUND);

  for (const cell of sequence) {
    expect(Number.isInteger(cell)).toBe(true);
    expect(cell).toBeGreaterThanOrEqual(0);
    expect(cell).toBeLessThan(9);
  }
});

test("matchfrekvensen ligger mellan 20 och 40 procent", () => {
  for (let round = 0; round < 100; round++) {
    const sequence = generateSequence();
    let matches = 0;

    // Räkna faktiska matchningar direkt från sekvensen.
    for (let index = N; index < sequence.length; index++) {
      if (sequence[index] === sequence[index - N]) {
        matches++;
      }
    }

    const matchRate = matches / (sequence.length - N);

    expect(matchRate).toBeGreaterThanOrEqual(0.2);
    expect(matchRate).toBeLessThanOrEqual(0.4);
  }
});

test("de första n händelserna är aldrig matchningar", () => {
  const sequence = [4, 4, 4, 4];

  for (let index = 0; index < N; index++) {
    expect(isNBackMatch(sequence, index, N)).toBe(false);
  }
});

test("matchkontrollen jämför exakt n steg bakåt", () => {
  const sequence = [0, 4, 0, 7];

  expect(isNBackMatch(sequence, 2, 2)).toBe(true);
  expect(isNBackMatch(sequence, 3, 2)).toBe(false);
});