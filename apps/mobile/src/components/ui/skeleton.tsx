import { useEffect } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors, radius } from "@/lib/theme";

/** Pulsing placeholder block shown while content loads. */
export function Skeleton({
  height = 190,
  style,
}: {
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius: radius.lg,
          backgroundColor: colors.cardElevated,
        },
        animated,
        style,
      ]}
    />
  );
}
