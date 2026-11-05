import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Button, Text, View } from "react-native";
import { EVENTS_PER_ROUND, N } from "../models/sequence";
import {
  EVENT_DURATION_MS,
  MODE_LABELS,
  StimulusMode,
} from "../models/settings";
import { getHighScore } from "../services/storageService";

export default function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<StimulusMode>("visual");

  const [highScore, setHighScore] = useState<number | null>(null);
  const [recordError, setRecordError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setHighScore(null);
      setRecordError("");

      getHighScore()
        .then((score) => {
          if (active) {
            setHighScore(score);
          }
        })
        .catch(() => {
          if (active) {
            setRecordError("Kunde inte läsa rekordet.");
          }
        });

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 28 }}>N-back</Text>

      <Text>
        {recordError !== ""
          ? recordError
          : highScore === null
            ? "Läser rekord..."
            : `High score: ${highScore}`}
      </Text>

      <Text>Valt läge: {MODE_LABELS[mode]}</Text>

      <Button
        title="Visuellt"
        onPress={() => setMode("visual")}
        disabled={mode === "visual"}
      />

      <Button
        title="Ljud"
        onPress={() => setMode("audio")}
        disabled={mode === "audio"}
      />

      <Button
        title="Båda"
        onPress={() => setMode("both")}
        disabled={mode === "both"}
      />

      <Text>N: {N}</Text>
      <Text>Tid per stimulus: {EVENT_DURATION_MS / 1000} sekunder</Text>
      <Text>Antal stimuli: {EVENTS_PER_ROUND}</Text>

      <Button
        title="Öppna spelet"
        onPress={() =>
          router.push({
            pathname: "/game",
            params: { mode },
          })
        }
      />
    </View>
  );
}