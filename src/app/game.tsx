import { useLocalSearchParams } from "expo-router";
import { Button, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MatchButton from "../components/MatchButton";
import StimulusGrid from "../components/StimulusGrid";
import { StimulusMode } from "../models/settings";
import { useGameViewModel } from "../viewmodels/useGameViewModel";

export default function GameScreen() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    mode?: string | string[];
  }>();

  const mode: StimulusMode =
    params.mode === "audio" || params.mode === "both"
      ? params.mode
      : "visual";

  const game = useGameViewModel(mode);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        gap: 16,
        paddingTop: 16,
        paddingLeft: 16 + insets.left,
        paddingRight: 16 + insets.right,
        paddingBottom: 24 + insets.bottom,
      }}
    >
      <Text style={{ fontSize: 24 }}>{game.n}-back</Text>

      <Text>
        Stimulus: {game.eventNumber} / {game.totalEvents}
      </Text>

      <View style={{ alignItems: "center", gap: 4 }}>
        <Text>Rätta svar: {game.correctResponses}</Text>
        <Text>Feltryck: {game.falseAlarms}</Text>
        <Text>Missade matchningar: {game.misses}</Text>
        <Text>Poäng: {game.score}</Text>
      </View>

      {game.showVisual ? (
        <StimulusGrid
          activeCell={game.activeCell}
          eventNumber={game.eventNumber}
        />
      ) : (
        <Text>Lyssna på bokstäverna.</Text>
      )}

      <MatchButton
        onPress={game.checkMatch}
        disabled={!game.canAnswer}
        errorCount={game.falseAlarms}
      />

      <Text style={{ minHeight: 24, textAlign: "center" }}>
        {game.feedback}
      </Text>

      <Button
        title={
          game.status === "finished"
            ? "Spela igen"
            : "Starta omgång"
        }
        onPress={game.startRound}
        disabled={game.status === "running"}
      />

      {game.storageMessage !== "" && (
        <Text style={{ textAlign: "center" }}>
          {game.storageMessage}
        </Text>
      )}

      {game.audioError !== "" && (
        <Text
          accessibilityRole="alert"
          style={{ textAlign: "center" }}
        >
          {game.audioError}
        </Text>
      )}
    </ScrollView>
  );
}