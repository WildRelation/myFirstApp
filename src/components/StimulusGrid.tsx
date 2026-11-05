import { useEffect, useState } from "react";
import { View } from "react-native";
import { EVENT_DURATION_MS } from "../models/settings";

type Props = {
  activeCell: number;
  eventNumber: number;
};

const GAP_DURATION_MS = 250;
const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function StimulusGrid({
  activeCell,
  eventNumber,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeCell < 0) {
      setIsVisible(false);
      return;
    }

    // Tänd vid varje nytt stimulus, även om rutnumret är samma.
    setIsVisible(true);

    const timeoutId = setTimeout(() => {
      setIsVisible(false);
    }, EVENT_DURATION_MS - GAP_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeCell, eventNumber]);

  return (
    <View
      style={{
        width: 270,
        height: 270,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {cells.map((cell) => (
        <View
          key={cell}
          style={{
            width: 90,
            height: 90,
            borderWidth: 2,
            borderColor: "white",
            backgroundColor:
              isVisible && cell === activeCell
                ? "blue"
                : "lightgray",
          }}
        />
      ))}
    </View>
  );
}