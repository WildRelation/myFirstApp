import { useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";

type Props = {
  onPress: () => void;
  disabled: boolean;
  errorCount: number;
};

export default function MatchButton({
  onPress,
  disabled,
  errorCount,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const previousErrorCount = useRef(errorCount);

  useEffect(() => {
    const hasNewError = errorCount > previousErrorCount.current;
    previousErrorCount.current = errorCount;

    scale.setValue(1);

    if (!hasNewError) {
      return;
    }

    const animation = Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
      scale.setValue(1);
    };
  }, [errorCount, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Registrera en n-back-matchning"
        accessibilityState={{ disabled }}
        style={{
          minWidth: 160,
          minHeight: 56,
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: disabled ? "#64748B" : "#2563EB",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          Match!
        </Text>
      </Pressable>
    </Animated.View>
  );
}