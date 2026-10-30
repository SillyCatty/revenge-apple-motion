import { findByProps } from "@vendetta/metro";
import { after, instead } from "@vendetta/patcher";
import { AppleSpringConfig } from "./motion";

let unpatches: (() => void)[] = [];

export default {
  onLoad: () => {
    try {
      // Find React Native Animated or Reanimated modules in Discord's metro bundle
      const Animated = findByProps("spring", "timing", "decay");

      if (Animated && Animated.spring) {
        // Intercept standard spring animations across components
        unpatches.push(
          instead("spring", Animated, (args, orig) => {
            const [value, config] = args;
            // Inject Apple standard smooth or snappy physics if damping/stiffness not strictly fixed
            const patchedConfig = {
              ...config,
              useNativeDriver: config.useNativeDriver ?? true,
              stiffness: config.stiffness ?? AppleSpringConfig.smooth.stiffness,
              damping: config.damping ?? AppleSpringConfig.smooth.damping,
              mass: config.mass ?? AppleSpringConfig.smooth.mass,
            };
            return orig(value, patchedConfig);
          })
        );
      }

      console.log("[AppleMotion] Plugin loaded successfully with Apple spring physics.");
    } catch (err) {
      console.error("[AppleMotion] Failed to patch animations:", err);
    }
  },

  onUnload: () => {
    for (const unpatch of unpatches) {
      try {
        unpatch();
      } catch (_) {}
    }
    unpatches = [];
    console.log("[AppleMotion] Plugin unloaded.");
  },
};
