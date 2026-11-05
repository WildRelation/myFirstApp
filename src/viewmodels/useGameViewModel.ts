import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { calculateScore } from "../models/scoring";
import {
    EVENTS_PER_ROUND,
    generateSequence,
    isNBackMatch,
    N,
} from "../models/sequence";

import {
    EVENT_DURATION_MS,
    LETTERS,
    StimulusMode,
} from "../models/settings";

import {
    speakLetter,
    stopSpeech,
} from "../services/speechService";

import { saveHighScoreIfBetter } from "../services/storageService";

type GameStatus = "idle" | "running" | "finished";

type GameState = {
  status: GameStatus;
  currentIndex: number;
  correctResponses: number;
  hasAnswered: boolean;
  feedback: string;
  sequence: number[];
  falseAlarms: number;
  misses: number;
};

const initialState: GameState = {
  status: "idle",
  currentIndex: 0,
  correctResponses: 0,
  hasAnswered: false,
  sequence: [],
  feedback: "",
  falseAlarms: 0,
  misses: 0,
};

export function useGameViewModel(mode: StimulusMode) {
  const [state, setState] = useState<GameState>(initialState);
  const [audioError, setAudioError] = useState("");
  const [storageMessage, setStorageMessage] = useState("");

  function startRound() {
    if (state.status === "running") {
      return;
    }

    setAudioError("");
    setStorageMessage("");
    // Slumpa vid knapptrycket, utanför state-uppdateringsfunktionen.
    const newSequence = generateSequence();

    setState((previous) => {
      if (previous.status === "running") {
        return previous;
      }

      return {
        ...initialState,
        status: "running",
        sequence: newSequence,
      };
    });
  }

  function checkMatch() {
    setState((previous) => {
      if (
        previous.status !== "running" ||
        previous.currentIndex < N ||
        previous.hasAnswered
      ) {
        return previous;
      }

      const isMatch = isNBackMatch(
        previous.sequence,
        previous.currentIndex,
        N
      );

      return {
        ...previous,
        hasAnswered: true,

        correctResponses:
          previous.correctResponses + (isMatch ? 1 : 0),

        falseAlarms:
          previous.falseAlarms + (isMatch ? 0 : 1),

        feedback: isMatch
          ? "Rätt! Det är samma ruta."
          : "Ingen matchning denna gång.",
      };
    });
  }
  useFocusEffect(
  useCallback(() => {
    if (state.status !== "running") {
      return;
    }

    const timerId = setInterval(() => {
      setState((previous) => {
        if (previous.status !== "running") {
          return previous;
        }

        const wasMissed =
          !previous.hasAnswered &&
          isNBackMatch(
            previous.sequence,
            previous.currentIndex,
            N
          );

        const updatedMisses =
          previous.misses + (wasMissed ? 1 : 0);

        const isLastEvent =
          previous.currentIndex === previous.sequence.length - 1;

        if (isLastEvent) {
          return {
            ...previous,
            misses: updatedMisses,
            status: "finished",
            feedback: "Omgången är klar!",
          };
        }

        return {
          ...previous,
          misses: updatedMisses,
          currentIndex: previous.currentIndex + 1,
          hasAnswered: false,
          feedback: "",
        };
      });
    }, EVENT_DURATION_MS);

    return () => {
      clearInterval(timerId);

      setState((previous) =>
        previous.status === "running"
          ? { ...initialState }
          : previous
      );
    };
  }, [state.status])
);

  useFocusEffect(
    useCallback(() => {
      if (state.status !== "running" || mode === "visual") {
        return;
      }

      let cancelled = false;

      async function playCurrentLetter() {
        try {
          // Vänta tills eventuellt tidigare tal har stoppats.
          await stopSpeech();

          if (cancelled) {
            return;
          }

          const stimulus = state.sequence[state.currentIndex];
          const letter = LETTERS[stimulus];

          speakLetter(letter, () => {
            if (!cancelled) {
              setAudioError(
                "Bokstaven kunde inte läsas upp. Kontrollera enhetens talfunktion."
              );
            }
          });
        } catch {
          if (!cancelled) {
            setAudioError("Kunde inte starta talfunktionen.");
          }
        }
      }

      void playCurrentLetter();

      return () => {
        cancelled = true;

        void stopSpeech().catch((error) => {
          console.warn("Kunde inte stoppa talet:", error);
        });
      };
    }, [state.status, state.currentIndex, state.sequence, mode])
  );

  useEffect(() => {
    if (state.status !== "finished") {
      return;
    }

    let active = true;

    const finalScore = calculateScore(
      state.correctResponses,
      state.falseAlarms
    );

    setStorageMessage("Sparar resultat...");

    saveHighScoreIfBetter(finalScore)
      .then(() => {
        if (active) {
          setStorageMessage("Rekordet är uppdaterat.");
        }
      })
      .catch(() => {
        if (active) {
          setStorageMessage("Kunde inte spara rekordet.");
        }
      });

    return () => {
      active = false;
    };
  }, [state.status, state.correctResponses, state.falseAlarms]);

  const isRunning = state.status === "running";

  return {
    n: N,
    status: state.status,
    eventNumber:
      state.status === "idle" ? 0 : state.currentIndex + 1,
    totalEvents: EVENTS_PER_ROUND,

    // -1 matchar ingen ruta: alla rutor blir grå.
    activeCell: isRunning
      ? state.sequence[state.currentIndex]
      : -1,

    correctResponses: state.correctResponses,
    feedback: state.feedback,
    canAnswer:
      isRunning &&
      state.currentIndex >= N &&
      !state.hasAnswered,

    startRound,
    checkMatch,
    falseAlarms: state.falseAlarms,
    misses: state.misses,
    score: calculateScore(
      state.correctResponses,
      state.falseAlarms
    ),

    showVisual: mode !== "audio",
    audioError,
    storageMessage,
  };
}
