(() => {
  "use strict";

  const AppleSpring = {
    // Apple HIG Damped Harmonic Spring preset
    stiffness: 300,
    damping: 28,
    mass: 1,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
  };

  let cleanups = [];

  const plugin = {
    onLoad: () => {
      try {
        const v = window.vendetta || window.revenge || window.bunny;
        if (!v) {
          console.warn("[AppleMotion] Mod loader global not found.");
          return;
        }

        const metro = v.metro;
        const patcher = v.patcher;

        // Show a visual toast in Discord so you know the plugin actually activated
        try {
          const toasts = v.ui && v.ui.toasts;
          if (toasts && toasts.showToast) {
            toasts.showToast("Apple Motion Enabled", toasts.getAssetIDByName ? toasts.getAssetIDByName("ic_theme_24px") : undefined);
          }
        } catch (_) {}

        // 1. Hook React Native Reanimated (used for modern Discord gestures & sheets)
        try {
          const Reanimated = metro.findByProps("useSharedValue", "withSpring") || metro.findByProps("withSpring");
          if (Reanimated && Reanimated.withSpring) {
            const origWithSpring = Reanimated.withSpring;
            const patchedWithSpring = function (toValue, userConfig, callback) {
              const mergedConfig = Object.assign({}, userConfig, {
                stiffness: AppleSpring.stiffness,
                damping: AppleSpring.damping,
                mass: AppleSpring.mass,
              });
              return origWithSpring.call(this, toValue, mergedConfig, callback);
            };

            // Preserve worklet metadata if present
            if (origWithSpring._workletFlag) {
              patchedWithSpring._workletFlag = origWithSpring._workletFlag;
            }

            Reanimated.withSpring = patchedWithSpring;
            cleanups.push(() => {
              Reanimated.withSpring = origWithSpring;
            });
            console.log("[AppleMotion] Patched Reanimated.withSpring successfully.");
          }
        } catch (e) {
          console.warn("[AppleMotion] Failed to patch Reanimated:", e);
        }

        // 2. Hook React Native LayoutAnimation (used for expand/collapse, message deletions, categories)
        try {
          const LayoutAnimation = metro.findByProps("configureNext", "Presets");
          if (LayoutAnimation && LayoutAnimation.configureNext) {
            const origConfigureNext = LayoutAnimation.configureNext;
            LayoutAnimation.configureNext = function (config, onComplete) {
              if (config && config.update && config.update.type === "spring") {
                config.update.springDamping = 0.85; // Apple HIG snappy damping ratio
              }
              return origConfigureNext.call(this, config, onComplete);
            };
            cleanups.push(() => {
              LayoutAnimation.configureNext = origConfigureNext;
            });
            console.log("[AppleMotion] Patched LayoutAnimation.configureNext.");
          }
        } catch (e) {
          console.warn("[AppleMotion] Failed to patch LayoutAnimation:", e);
        }

        // 3. Hook Legacy React Native Animated.spring (for legacy UI components)
        try {
          const Animated = metro.findByProps("spring", "timing", "decay");
          if (Animated && Animated.spring && patcher) {
            cleanups.push(
              patcher.instead("spring", Animated, (args, orig) => {
                const [value, config] = args;
                const patched = Object.assign({}, config, {
                  useNativeDriver: config.useNativeDriver !== undefined ? config.useNativeDriver : true,
                  stiffness: AppleSpring.stiffness,
                  damping: AppleSpring.damping,
                  mass: AppleSpring.mass,
                });
                return orig(value, patched);
              })
            );
            console.log("[AppleMotion] Patched Animated.spring.");
          }
        } catch (e) {
          console.warn("[AppleMotion] Failed to patch Animated:", e);
        }

        console.log("[AppleMotion] All animation hooks installed.");
      } catch (err) {
        console.error("[AppleMotion] Fatal initialization error:", err);
      }
    },

    onUnload: () => {
      for (const cleanup of cleanups) {
        try {
          cleanup();
        } catch (_) {}
      }
      cleanups = [];
      console.log("[AppleMotion] Plugin unloaded and all hooks restored.");
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
  }
  if (typeof exports !== "undefined") {
    exports.default = plugin;
  }

  return plugin;
})();
