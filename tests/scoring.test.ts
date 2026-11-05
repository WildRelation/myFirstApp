/// <reference types="jest" />

import { calculateScore } from "../src/models/scoring";

test("rätta svar ger poäng", () => {
  expect(calculateScore(4, 0)).toBe(4);
});

test("feltryck dras av från rätta svar", () => {
  expect(calculateScore(4, 1)).toBe(3);
});

test("poängen kan inte bli negativ", () => {
  expect(calculateScore(1, 3)).toBe(0);
});