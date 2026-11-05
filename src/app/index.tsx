import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Welcome to N-Back!</Text>

      <Button
        title="Start Game"
        onPress={() => router.push("/game")}
      />
    </View>
  );
}