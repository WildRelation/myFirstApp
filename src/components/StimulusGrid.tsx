import { View } from "react-native";

type Props = {
  activeCell: number;
};

export default function StimulusGrid({ activeCell }: Props) {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

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
            backgroundColor: cell === activeCell ? "blue" : "lightgray",
          }}
        />
      ))}
    </View>
  );
}