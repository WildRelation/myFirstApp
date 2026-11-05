/// <reference types="jest" />

import {
    act,
    cleanup,
    renderHook,
} from "@testing-library/react-native";
import { EVENT_DURATION_MS } from "../src/models/settings";
import { useGameViewModel } from "../src/viewmodels/useGameViewModel";

// Simulera en aktiv skärm tills komponenten tas bort.
jest.mock("expo-router", () => {
  const React = jest.requireActual("react");

  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(callback, [callback]);
    },
  };
});

jest.mock("../src/services/speechService", () => ({
  speakLetter: jest.fn(),
  stopSpeech: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../src/services/storageService", () => ({
  saveHighScoreIfBetter: jest.fn().mockResolvedValue(undefined),
}));

// Med n = 2 blir stimulus 3–20 matchningar.
jest.mock("../src/models/sequence", () => {
  const actual = jest.requireActual("../src/models/sequence");

  return {
    ...actual,
    generateSequence: jest.fn(() => Array(20).fill(0)),
  };
});

let intervalSpy: jest.SpyInstance;
let clearIntervalSpy: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();

  // Observera anropen utan att ersätta deras funktion.
  intervalSpy = jest.spyOn(globalThis, "setInterval");
  clearIntervalSpy = jest.spyOn(globalThis, "clearInterval");
});

afterEach(async () => {
  await cleanup();
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

// Hitta timern med spelets stimulusintervall.
function getGameTimerId(): ReturnType<typeof setInterval> {
  const matchingCalls = intervalSpy.mock.calls
    .map((args, index) => ({
      duration: args[1],
      index,
    }))
    .filter((call) => call.duration === EVENT_DURATION_MS);

  expect(matchingCalls).toHaveLength(1);

  const callIndex = matchingCalls[0].index;
  return intervalSpy.mock.results[callIndex].value;
}

test("timern går vidare efter ett stimulusintervall", async () => {
  const { result } = await renderHook(() =>
    useGameViewModel("visual")
  );

  await act(() => {
    result.current.startRound();
  });

  expect(result.current.eventNumber).toBe(1);

  await act(() => {
    jest.advanceTimersByTime(EVENT_DURATION_MS);
  });

  expect(result.current.eventNumber).toBe(2);
  expect(result.current.status).toBe("running");
});

test("två tryck på samma stimulus räknas bara en gång", async () => {
  const { result } = await renderHook(() =>
    useGameViewModel("visual")
  );

  await act(() => {
    result.current.startRound();
  });

  await act(() => {
    jest.advanceTimersByTime(EVENT_DURATION_MS * 2);
  });

  expect(result.current.eventNumber).toBe(3);
  expect(result.current.canAnswer).toBe(true);

  await act(() => {
    result.current.checkMatch();
    result.current.checkMatch();
  });

  expect(result.current.correctResponses).toBe(1);
  expect(result.current.falseAlarms).toBe(0);
  expect(result.current.canAnswer).toBe(false);
});

test("ogiltiga tryck ignoreras och sista missningen räknas", async () => {
  const { result } = await renderHook(() =>
    useGameViewModel("visual")
  );

  // Före start.
  await act(() => {
    result.current.checkMatch();
  });

  expect(result.current.correctResponses).toBe(0);
  expect(result.current.falseAlarms).toBe(0);

  await act(() => {
    result.current.startRound();
  });

  const gameTimerId = getGameTimerId();

  // Under första stimuluset.
  await act(() => {
    result.current.checkMatch();
  });

  expect(result.current.correctResponses).toBe(0);
  expect(result.current.falseAlarms).toBe(0);

  await act(() => {
    jest.advanceTimersByTime(EVENT_DURATION_MS);
  });

  // Under andra stimuluset.
  await act(() => {
    result.current.checkMatch();
  });

  expect(result.current.correctResponses).toBe(0);
  expect(result.current.falseAlarms).toBe(0);

  // Slutför omgången utan giltiga svar.
  await act(async () => {
    jest.advanceTimersByTime(EVENT_DURATION_MS * 19);
  });

  expect(result.current.status).toBe("finished");
  expect(result.current.eventNumber).toBe(20);
  expect(result.current.misses).toBe(18);
  expect(result.current.canAnswer).toBe(false);

  // Just spelets timer ska ha stoppats.
  expect(clearIntervalSpy).toHaveBeenCalledWith(gameTimerId);

  // Efter avslut.
  await act(() => {
    result.current.checkMatch();
  });

  expect(result.current.correctResponses).toBe(0);
  expect(result.current.falseAlarms).toBe(0);
  expect(result.current.misses).toBe(18);
});

test("timern stoppas när spelskärmen tas bort", async () => {
  const { result, unmount } = await renderHook(() =>
    useGameViewModel("visual")
  );

  await act(() => {
    result.current.startRound();
  });

  const gameTimerId = getGameTimerId();

  expect(clearIntervalSpy).not.toHaveBeenCalledWith(gameTimerId);

  await unmount();

  expect(clearIntervalSpy).toHaveBeenCalledWith(gameTimerId);
});