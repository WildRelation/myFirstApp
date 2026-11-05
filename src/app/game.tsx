import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import StimulusGrid from "../components/StimulusGrid";
import { N, practiceSequence } from "../models/sequence";

export default function GameScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const activeCell = practiceSequence[currentIndex];
  const isLastEvent = currentIndex === practiceSequence.length - 1;

  function showNextCell() {
    if (isLastEvent) {
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
  }

  return (
    <View style={{ flex: 1, alignItems: "center", gap: 20, padding: 24 }}>
      <Text>{N}-back</Text>

      <Text>
        Stimulus: {currentIndex + 1} / {practiceSequence.length}
      </Text>

      <StimulusGrid activeCell={activeCell} />

      <Button
        title="Nästa stimulus"
        onPress={showNextCell}
        disabled={isLastEvent}
      />

      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}